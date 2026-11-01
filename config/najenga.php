<?php

/*
 * Najenga's own settings.
 *
 * kit_pages: the dashboard pages (route names) the OKJT kit app in
 * frontend/ now draws. Laravel serves that app for them and hands it each
 * page's data as JSON (App\Http\Middleware\ServeKitPages); every other page
 * is still Inertia. Grows a page at a time until Inertia is gone.
 * NAJENGA_KIT_PAGES (comma-separated route names) adds pages without a
 * deploy: to preview one, or to try it on one server first.
 */
return [
    'kit_pages' => array_values(array_unique(array_merge([
    ], array_filter(array_map('trim', explode(',', (string) env('NAJENGA_KIT_PAGES', ''))))))),
];
