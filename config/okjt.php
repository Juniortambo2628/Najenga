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
]);

$config['roles']['all'] = ['owner', 'editor', 'viewer'];

return $config;
