<?php

use App\Http\Middleware\HandleInertiaRequests;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->web(append: [
            \App\Http\Middleware\HandleInertiaRequests::class,
            \Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets::class,
        ]);

        $middleware->alias([
            'admin' => \App\Http\Middleware\AdminOnly::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        // An Inertia visit that 403s or 404s gets the React error page, so
        // the SPA stays on screen instead of being handed raw HTML. Full-page
        // requests and fatal errors keep falling through to
        // resources/views/errors/*.blade.php - those have to render when the
        // JS build is broken, so they cannot move to React.
        $exceptions->render(function (Throwable $e, Request $request): ?Response {
            if (! $request->header('X-Inertia')) {
                return null;
            }

            $status = $e instanceof HttpExceptionInterface ? $e->getStatusCode() : 500;

            // A 404 never enters the web middleware, so nothing has told
            // Inertia the asset version yet; the response would say
            // version "", the client would adopt it, and its next visit
            // would get a 409 full reload. Reuse the resolver
            // HandleInertiaRequests would have installed.
            Inertia::version(fn (): string => (string) (new HandleInertiaRequests)->version($request));

            // Inertia's Response has no setStatusCode(), so build it first
            // and stamp the real code on it - a 404 that answers 200 would
            // tell the browser the page exists.
            $response = Inertia::render('Errors', ['status' => $status])->toResponse($request);
            $response->setStatusCode($status);

            return $response;
        });
    })->create();
