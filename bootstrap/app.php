<?php

use App\Http\Page;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;

return Application::configure(basePath: dirname(__DIR__))
    ->withEvents(false)
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->web(append: [
            \App\Http\Middleware\HandlePageRequests::class,
            \Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets::class,
        ]);

        $middleware->alias([
            'admin' => \App\Http\Middleware\AdminOnly::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        // When the app asks for a page (X-Kit-Page) that 403s, 404s or
        // fails, it gets Najenga's Errors page at the real status, and shows
        // it. A page opened in the browser, JSON callers and everything else
        // fall through to resources/views/errors/*.blade.php, which render
        // even when the app's build is broken.
        $exceptions->render(function (Throwable $e, Request $request): ?Response {
            if (! Page::requested($request)) {
                return null;
            }

            // Not failures: these have answers of their own (back with
            // errors, to sign in, the response already built).
            if ($e instanceof ValidationException
                || $e instanceof AuthenticationException
                || $e instanceof HttpResponseException) {
                return null;
            }

            $status = $e instanceof HttpExceptionInterface ? $e->getStatusCode() : 500;

            // The Errors page needs no shared props, and they may not be set
            // yet (a missing record fails while the route's models load).
            Page::flushShared();
            try {
                $response = Page::render('Errors', ['status' => $status])->toResponse($request);
            } catch (Throwable) {
                // No build to draw it with: the Blade error pages.
                return null;
            }
            $response->setStatusCode($status);

            return $response;
        });
    })->create();
