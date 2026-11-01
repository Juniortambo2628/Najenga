<?php

namespace App\Http\Controllers;

use Illuminate\Http\Response;

/**
 * Serves the pages that have moved to the OKJT kit app (frontend/): its
 * built index.html, which deploy-kit copies into public/ (spa_dir). The
 * kit app routes in the browser; a path it doesn't know reloads, and
 * Laravel (Inertia) serves that page as before.
 */
class SpaController extends Controller
{
    public function __invoke(): Response
    {
        $index = config('app.spa_index') ?: public_path('index.html');

        abort_unless(is_file($index), 503, 'The frontend has not been built (cd frontend && npm run build).');

        return response(file_get_contents($index))
            ->header('Content-Type', 'text/html; charset=UTF-8')
            ->header('Cache-Control', 'no-cache');
    }
}
