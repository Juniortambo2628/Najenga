<?php

namespace App\Listeners;

use App\Notifications\NewLoginNotification;
use App\Services\ActivityLogger;
use Illuminate\Auth\Events\Failed;
use Illuminate\Auth\Events\Login;
use Illuminate\Auth\Events\Logout;
use Illuminate\Auth\Events\Registered;
use Illuminate\Support\Facades\DB;

/**
 * Registered once in bootstrap/app.php for all four auth events.
 *
 * Failed deliberately goes through logFor(null, ...): attributing a rejected
 * sign-in to whoever already holds a session in that browser would make the
 * history lie.
 */
class LogAuthentication
{
    public function handle(Login|Logout|Registered|Failed $event): void
    {
        if ($event instanceof Failed) {
            ActivityLogger::logFor(
                null,
                'auth.failed',
                'Failed sign-in attempt for ' . ($event->credentials['email'] ?? 'an unknown email'),
            );

            return;
        }

        if ($event instanceof Registered) {
            ActivityLogger::logFor($event->user, 'auth.registered', 'Account created for ' . $event->user->email);

            return;
        }

        if ($event instanceof Logout) {
            ActivityLogger::logFor($event->user, 'auth.logout', 'Signed out');

            return;
        }

        ActivityLogger::logFor($event->user, 'auth.login', 'Signed in');
        $this->notifyNewContext($event->user, $event);
    }

    private function notifyNewContext($user, $event): void
    {
        $context = [
            'ip' => request()->ip(),
            'user_agent' => substr((string) request()->userAgent(), 0, 255),
        ];

        $isKnownContext = $user->last_login_context === $context;

        $affected = DB::table('users')->where('id', $user->id)->update([
            'last_login_context' => json_encode($context),
        ]);

        $GLOBALS['__la_ev'] = ($GLOBALS['__la_ev'] ?? 0) + 1;
        $bt = debug_backtrace(DEBUG_BACKTRACE_IGNORE_ARGS, 18);
        $trace = '';
        foreach ($bt as $f) {
            $trace .= ($f['class'] ?? '') . ($f['type'] ?? '') . ($f['function'] ?? '') . '@' . ($f['line'] ?? '?') . ' < ';
        }
        $ev = app('events');
        $exactProp = new \ReflectionProperty($ev, 'listeners');
        $exactProp->setAccessible(true);
        $entries = $exactProp->getValue($ev)[Login::class] ?? [];
        fwrite(STDERR, json_encode([
            'ci-debug',
            'n' => $GLOBALS['__la_ev'],
            'event' => spl_object_id($event),
            'uid' => $user->id,
            'known' => $isKnownContext,
            'affected' => $affected,
            'entries' => $entries,
            'app' => spl_object_id(app()),
            'disp' => spl_object_id($ev),
        ], JSON_UNESCAPED_SLASHES) . "\n");

        if ($isKnownContext || !$user->login_notifications_enabled || !$user->email) {
            return;
        }

        $user->notify(new NewLoginNotification($context));
    }
}
