<?php

namespace App\Http\Middleware;

use App\Http\Controllers\SpaController;
use Closure;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response;

/**
 * The bridge while Najenga's pages move from Inertia to the OKJT kit app
 * (frontend/). For a GET to a page in config('najenga.kit_pages'), the
 * controller runs as it always has, as an Inertia request, and then:
 *
 *   - the kit app asking for a page's data (X-Kit-Page): its Inertia page
 *     object as JSON ({ component, props, url, version }), shared props
 *     included;
 *   - a browser loading the page: the kit app's index.html with that page
 *     object inside, at the controller's status (a 403 stays a 403);
 *   - an Inertia visit from a page that hasn't moved: a full reload, so the
 *     browser lands in the kit app.
 *
 * Redirects and sign-in redirects pass through as they are. So a page moves
 * without touching its controller. Sits before HandleInertiaRequests in the
 * web group.
 */
class ServeKitPages
{
    public function handle(Request $request, Closure $next): Response
    {
        $name = $request->route()?->getName();

        if (! $request->isMethodSafe() || ! $name || ! in_array($name, config('najenga.kit_pages', []), true)) {
            return $next($request);
        }

        if ($request->headers->has('X-Inertia') && ! $request->headers->has('X-Kit-Page')) {
            return Inertia::location($request->fullUrl());
        }

        $forApp = $request->headers->has('X-Kit-Page');

        // Ask Inertia for its JSON page object, at the version it expects.
        $request->headers->set('X-Inertia', 'true');
        $request->headers->set('X-Inertia-Version', (string) (new HandleInertiaRequests)->version($request));

        $response = $next($request);

        if ($forApp || ! $response instanceof JsonResponse) {
            return $response;
        }

        $page = $response->getData(true);
        if (! isset($page['component'])) {
            return $response;
        }

        return response()
            ->view('kit-app', ['page' => $page, 'html' => SpaController::html($page)], $response->getStatusCode())
            ->header('Cache-Control', 'no-cache, private');
    }
}
