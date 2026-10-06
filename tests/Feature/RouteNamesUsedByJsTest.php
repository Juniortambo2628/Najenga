<?php

namespace Tests\Feature;

use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Route;
use Tests\TestCase;

/**
 * The JS side of the routing contract (Phase 2.7I).
 *
 * Ziggy throws "route 'x' is not in the route list" the moment a page renders
 * a name the app does not have - one typo and the page is a white screen - so
 * the names the front end calls are checked against the router itself.
 */
class RouteNamesUsedByJsTest extends TestCase
{
    public function test_every_route_name_the_js_calls_exists(): void
    {
        $names = [];

        foreach (File::allFiles(resource_path('js')) as $file) {
            if (! in_array(strtolower($file->getExtension()), ['js', 'jsx'], true)) {
                continue;
            }

            preg_match_all("/route\(\s*'([^']+)'/", $file->getContents(), $matches);
            $names = array_merge($names, $matches[1]);
        }

        $names = array_values(array_unique($names));
        $this->assertNotEmpty($names);

        foreach ($names as $name) {
            $this->assertTrue(
                Route::has($name),
                "resources/js calls route('{$name}') but no route is named that."
            );
        }
    }

    public function test_every_name_in_the_js_route_stub_exists(): void
    {
        $src = file_get_contents(base_path('tests/js/routeStub.js'));
        preg_match_all("/^\s+'([^']+)':/m", $src, $matches);

        $this->assertNotEmpty($matches[1]);

        foreach ($matches[1] as $name) {
            $this->assertTrue(
                Route::has($name),
                "tests/js/routeStub.js lists '{$name}' but no route is named that."
            );
        }
    }

    public function test_no_hardcoded_url_literals_are_left_in_js(): void
    {
        $patterns = [
            'href attribute' => '/href=\{?[\'"]\/(?!\/)/',
            'href object property' => '/href:\s*[\'"]\/(?!\/)/',
            'router call' => '/router\.(?:get|post|put|patch|delete|reload|visit)\(\s*[\'"]\/(?!\/)/',
        ];

        foreach (File::allFiles(resource_path('js')) as $file) {
            if (! in_array(strtolower($file->getExtension()), ['js', 'jsx'], true)) {
                continue;
            }

            $contents = $file->getContents();

            foreach ($patterns as $label => $pattern) {
                $this->assertDoesNotMatchRegularExpression(
                    $pattern,
                    $contents,
                    "{$file->getRelativePathname()} still has a hardcoded URL in a {$label}; use route('name') instead."
                );
            }
        }
    }
}
