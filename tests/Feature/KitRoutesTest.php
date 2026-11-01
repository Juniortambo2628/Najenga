<?php

namespace Tests\Feature;

use App\Console\Commands\WriteKitRoutes;
use Tests\TestCase;

class KitRoutesTest extends TestCase
{
    public function test_the_kit_apps_route_list_is_up_to_date(): void
    {
        $this->assertSame(
            WriteKitRoutes::contents(),
            file_get_contents(base_path(WriteKitRoutes::PATH)),
            'frontend/src/dashboard/routes.json is out of date: run php artisan najenga:kit-routes',
        );
    }
}
