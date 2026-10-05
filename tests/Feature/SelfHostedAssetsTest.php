<?php

namespace Tests\Feature;

use Tests\TestCase;

class SelfHostedAssetsTest extends TestCase
{
    private const FA_ROOT = 'vendor/fontawesome/';

    /**
     * Font Awesome is committed rather than pulled from cdnjs, so a file
     * that goes missing (a bad .gitignore, a stray cleanup) silently
     * breaks every icon in the app with no error anywhere.
     */
    public function test_the_vendored_font_awesome_files_are_present(): void
    {
        $files = [
            'css/all.min.css',
            'webfonts/fa-solid-900.woff2',
            'webfonts/fa-regular-400.woff2',
            'webfonts/fa-brands-400.woff2',
            // Source still uses FA5 names such as fa-file-alt and
            // fa-cloud-upload-alt, which this font serves.
            'webfonts/fa-v4compatibility.woff2',
        ];

        foreach ($files as $file) {
            $this->assertFileExists(public_path(self::FA_ROOT.$file));
        }
    }

    public function test_the_page_loads_font_awesome_from_the_vendor_directory(): void
    {
        // /login renders the Inertia root template (app.blade.php); the
        // public welcome page has its own blade and no icons.
        $response = $this->get('/login');

        $response->assertOk();
        $response->assertSee('/'.self::FA_ROOT.'css/all.min.css', false);
        $response->assertDontSee('cdnjs.cloudflare.com/ajax/libs/font-awesome', false);
    }
}
