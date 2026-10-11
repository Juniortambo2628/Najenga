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

        // Event auto-discovery is disabled in bootstrap/app.php, so these four
        // lines are the only registration path for LogAuthentication. Discovery
        // would also match its union type-hinted handle() and register it a
        // second time, double-firing every auth notification.
        Event::listen(\Illuminate\Auth\Events\Login::class, \App\Listeners\LogAuthentication::class);
        Event::listen(\Illuminate\Auth\Events\Logout::class, \App\Listeners\LogAuthentication::class);
        Event::listen(\Illuminate\Auth\Events\Registered::class, \App\Listeners\LogAuthentication::class);
        Event::listen(\Illuminate\Auth\Events\Failed::class, \App\Listeners\LogAuthentication::class);

        $this->app->singleton(\App\Services\ReceiptParser::class);
    }
}
