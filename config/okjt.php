<?php

use App\Models\Account;
use App\Models\Project;

/*
 * Najenga's settings for the OKJT kit (okjt/laravel-kit): only what differs
 * from the kit; everything else, and what each setting means, is in
 * vendor/okjt/laravel-kit/config/okjt.php. Lists are replaced whole.
 *
 * A project is the workspace; a client's account holds their projects, and
 * a manager is staff on the accounts whose projects they manage.
 */
$kit = require base_path('vendor/okjt/laravel-kit/config/okjt.php');

$config = array_replace_recursive($kit, [
    'workspace' => [
        'model' => Project::class,
        'foreign_key' => 'project_id',
        'members_table' => 'project_user',
        'scope' => 'project',
        'header' => 'X-Project',
        'query' => 'project',
        'folder' => 'projects',
    ],
    'label' => 'project',
    'accounts' => [
        'model' => Account::class,
    ],
    // Signing in on Najenga's own origin: the session cookie, as before.
    'auth' => [
        'mode' => 'session',
        'guard' => 'web',
        // Najenga doesn't ask people to verify their address (User isn't MustVerifyEmail).
        'verified_to_sign_in' => false,
        // Secrets and recovery codes encrypted as Laravel Fortify kept them.
        'two_factor' => ['secrets_encrypted' => true],
        'login_codes' => ['notification' => \App\Notifications\LoginCodeNotification::class],
        'password_reset' => ['path' => '/reset-password'],
    ],
    'messages' => [
        'bad_credentials' => 'These credentials do not match our records.',
    ],
]);

$config['roles']['all'] = ['owner', 'editor', 'viewer'];

return $config;
