<?php

/*
 * Passkeys (laravel/passkeys), with its own routes: /passkeys/login/options,
 * /passkeys/login, /user/passkeys… Set as Laravel Fortify set them before
 * sign-in moved to the OKJT kit, so everyone's passkeys keep working: the
 * same relying party and user handle secret.
 */
return [
    'relying_party_id' => env('PASSKEYS_RELYING_PARTY_ID', parse_url((string) env('APP_URL', 'http://localhost'), PHP_URL_HOST)),

    'allowed_origins' => [
        env('APP_URL', 'http://localhost'),
    ],

    'user_handle_secret' => env('PASSKEYS_USER_HANDLE_SECRET', env('APP_KEY')),

    'timeout' => 60000,

    'guard' => 'web',

    'middleware' => ['web'],

    // Adding or removing a passkey doesn't ask for the password again (as before).
    'management_middleware' => [],

    'throttle' => 'throttle:10,1',

    // After a passkey sign-in, unless the person was on their way somewhere.
    'redirect' => '/dashboard',
];
