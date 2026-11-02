<?php

namespace Tests;

use Closure;
use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use Illuminate\Testing\TestResponse;
use Tests\Support\AssertablePage;

abstract class TestCase extends BaseTestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        // The public pages serve the kit app's built index.html, which isn't
        // built in the PHP test run: a stand-in instead.
        config(['app.spa_index' => __DIR__.'/fixtures/spa-index.html']);

        // $response->assertPage(fn (AssertablePage $page) => ...): see Tests\Support\AssertablePage.
        TestResponse::macro('assertPage', function (?Closure $callback = null) {
            $page = AssertablePage::fromTestResponse($this);
            if ($callback) {
                $callback($page);
            }

            return $this;
        });
        // The page object itself: ['component' => ..., 'props' => [...], ...].
        TestResponse::macro('page', fn () => AssertablePage::pageOf($this));
    }

    /** Requests as the app sends them for a page's data or a form (X-Kit-Page). */
    protected function page(): static
    {
        return $this->withHeaders(['X-Kit-Page' => '1', 'X-Requested-With' => 'XMLHttpRequest']);
    }
}
