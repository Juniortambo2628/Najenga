<?php

namespace App\Http\Controllers;

use Illuminate\Http\Response;

/**
 * Serves the OKJT kit app (frontend/): its built index.html, which
 * deploy-kit copies into public/ (spa_dir). The public pages get it as it is;
 * every other page gets it with its data inside (App\Http\Page).
 */
class SpaController extends Controller
{
    public function __invoke(): Response
    {
        return response(self::html())
            ->header('Content-Type', 'text/html; charset=UTF-8')
            ->header('Cache-Control', 'no-cache');
    }

    /** index.html, with `$page` (an Inertia page object) for the app to start from. */
    public static function html(?array $page = null): string
    {
        $index = config('app.spa_index') ?: public_path('index.html');

        abort_unless(is_file($index), 503, 'The frontend has not been built (cd frontend && npm run build).');

        $html = file_get_contents($index);
        if ($page === null) {
            return $html;
        }

        $json = json_encode($page, JSON_HEX_TAG | JSON_HEX_AMP | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
        $script = '<script id="kit-page" type="application/json">'.$json.'</script>';

        return str_contains($html, '</head>') ? str_replace('</head>', $script.'</head>', $html) : $script.$html;
    }
}
