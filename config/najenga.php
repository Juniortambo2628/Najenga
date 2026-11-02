<?php

/*
 * Najenga's own settings.
 *
 * kit_pages: the dashboard pages (route names) the OKJT kit app in
 * frontend/ now draws. Laravel serves that app for them and hands it each
 * page's data as JSON (App\Http\Middleware\ServeKitPages); every other page
 * is still Inertia. Grows a page at a time until Inertia is gone.
 * NAJENGA_KIT_PAGES (comma-separated route names) adds pages without a
 * deploy: to preview one, or to try it on one server first. Set to "off",
 * every page goes back to Inertia (a rollback without a deploy; clear the
 * config cache after changing it: php artisan config:cache).
 */
return [
    'kit_pages' => env('NAJENGA_KIT_PAGES') === 'off' ? [] : array_values(array_unique(array_merge([
        // Every page (Phase 6c): the dashboard (2026-11-02), and sign-in,
        // registration, password and email verification.
        'login',
        'login.code',
        'login.passkey',
        'register',
        'password.request',
        'password.reset',
        'password.confirm',
        'two-factor.login',
        'verification.notice',
        'activity.logs',
        'analytics',
        'dashboard',
        'documents',
        'documents.create',
        'documents.edit',
        'documents.show',
        'expenses',
        'expenses.create',
        'expenses.edit',
        'expenses.show',
        'messages',
        'overview',
        'photos',
        'photos.create',
        'photos.edit',
        'photos.show',
        'profile.edit',
        'profile.passkeys',
        'profile.two-factor',
        'projects',
        'projects.create',
        'projects.edit',
        'projects.show',
        'receipt.verification',
        'receipts.edit',
        'receipts.index',
        'receipts.show',
        'search',
        'settings',
        'timeline',
        'timeline.create',
        'timeline.edit',
        'timeline.show',
        'users.create',
        'users.edit',
        'users.index',
        'users.show',
        'whatsapp',
        'whatsapp.settings',
    ], array_filter(array_map('trim', explode(',', (string) env('NAJENGA_KIT_PAGES', ''))))))),
];
