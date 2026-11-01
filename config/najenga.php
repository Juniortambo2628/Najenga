<?php

/*
 * Najenga's own settings.
 *
 * kit_pages: the dashboard pages (route names) the OKJT kit app in
 * frontend/ now draws. Laravel serves that app for them and hands it each
 * page's data as JSON (App\Http\Middleware\ServeKitPages); every other page
 * is still Inertia. Grows a page at a time until Inertia is gone.
 */
return [
    'kit_pages' => [
    ],
];
