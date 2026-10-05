<?php

namespace App\Listeners;

use App\Services\ActivityLogger;
use Illuminate\Auth\Events\Failed;
use Illuminate\Auth\Events\Login;
use Illuminate\Auth\Events\Logout;
use Illuminate\Auth\Events\Registered;

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
    }
}
