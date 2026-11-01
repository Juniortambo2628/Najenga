<?php

namespace App\Http\Middleware;

use App\Http\Controllers\SpaController;
use Closure;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response;

/**
 * The bridge while Najenga's pages move from Inertia to the OKJT kit app
 * (frontend/). For a GET to a page in config('najenga.kit_pages'):
 *
 *   - the kit app asking for the page's data (X-Kit-Page): the controller
 *     runs as it always has and its Inertia props come back as JSON
 *     ({ component, props, url, version }), shared props included;
 *   - an Inertia visit from a page that hasn't moved: a full reload, so the
 *     browser lands in the kit app;
 *   - anything else (typing the URL, a refresh): the kit app's index.html.
 *
 * So a page moves without touching its controller. Sits before
 * HandleInertiaRequests in the web group.
 */
class ServeKitPages
{
    public function handle(Request $request, Closure $next): Response
    {
        $name = $request->route()?->getName();

        if (! $request->isMethodSafe() || ! $name || ! in_array($name, config('najenga.kit_pages', []), true)) {
            return $next($request);
        }

        if ($request->headers->has('X-Kit-Page')) {
            // Ask Inertia for its JSON page object, at the version it expects.
            $request->headers->set('X-Inertia', 'true');
            $request->headers->set('X-Inertia-Version', (string) (new HandleInertiaRequests)->version($request));

            return $next($request);
        }

        if ($request->headers->has('X-Inertia')) {
            return Inertia::location($request->fullUrl());
        }

        // Signed-out visitors still go to sign in, as the page's auth would.
        if (! $request->user() && in_array('auth', $request->route()->gatherMiddleware(), true)) {
            return $next($request);
        }

        return app(SpaController::class)();
    }
}
