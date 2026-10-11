<?php

namespace App\Providers;

use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Schema::defaultStringLength(191);
        Vite::prefetch(concurrency: 3);

        Gate::policy(\App\Models\Receipt::class, \App\Policies\ReceiptPolicy::class);
        Gate::policy(\App\Models\User::class, \App\Policies\UserPolicy::class);
        Gate::policy(\App\Models\Conversation::class, \App\Policies\ConversationPolicy::class);
        Gate::policy(\App\Models\Message::class, \App\Policies\MessagePolicy::class);
        Gate::policy(\App\Models\Comment::class, \App\Policies\CommentPolicy::class);
        Gate::policy(\App\Models\Annotation::class, \App\Policies\AnnotationPolicy::class);
        Gate::policy(\App\Models\ProjectTimeline::class, \App\Policies\TimelinePolicy::class);
        Gate::policy(\App\Models\Folder::class, \App\Policies\FolderPolicy::class);

        // Listed rather than left to withEvents() auto-discovery: that keys off
        // a single type-hinted parameter on handle(), and LogAuthentication
        // serves four distinct events.
        Event::listen(\Illuminate\Auth\Events\Login::class, \App\Listeners\LogAuthentication::class);
        Event::listen(\Illuminate\Auth\Events\Logout::class, \App\Listeners\LogAuthentication::class);
        Event::listen(\Illuminate\Auth\Events\Registered::class, \App\Listeners\LogAuthentication::class);
        Event::listen(\Illuminate\Auth\Events\Failed::class, \App\Listeners\LogAuthentication::class);

        $this->logListenerState('boot');

        $this->app->singleton(\App\Services\ReceiptParser::class);
    }

    private function logListenerState(string $when): void
    {
        try {
            $ev = app('events');
            $exactProp = new \ReflectionProperty($ev, 'listeners');
            $exactProp->setAccessible(true);
            $exact = count($exactProp->getValue($ev)[\Illuminate\Auth\Events\Login::class] ?? []);

            $wildProp = new \ReflectionProperty($ev, 'wildcards');
            $wildProp->setAccessible(true);
            $wild = 0;
            foreach (array_keys($wildProp->getValue($ev)) as $key) {
                if (\Illuminate\Support\Str::is($key, \Illuminate\Auth\Events\Login::class)) {
                    $wild++;
                }
            }

            if ($exact === 1 && $wild === 0) {
                return;
            }

            $bt = debug_backtrace(DEBUG_BACKTRACE_IGNORE_ARGS, 14);
            $trace = '';
            foreach ($bt as $f) {
                $trace .= ($f['class'] ?? '') . ($f['type'] ?? '') . ($f['function'] ?? '') . '@' . ($f['line'] ?? '?') . ' < ';
            }

            fwrite(STDERR, json_encode([
                'ci-reg',
                'when' => $when,
                'exact' => $exact,
                'wild' => $wild,
                'app' => spl_object_id(app()),
                'disp' => spl_object_id($ev),
                'trace' => $trace,
            ], JSON_UNESCAPED_SLASHES) . "\n");
        } catch (\Throwable $e) {
            fwrite(STDERR, 'ci-reg-error: ' . $e->getMessage() . "\n");
        }
    }
}
