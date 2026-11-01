<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

abstract class TestCase extends BaseTestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        // The public pages serve the kit app's built index.html, which isn't
        // built in the PHP test run: a stand-in instead.
        config(['app.spa_index' => __DIR__.'/fixtures/spa-index.html']);
    }
}
