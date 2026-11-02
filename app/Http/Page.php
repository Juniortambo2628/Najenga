<?php

namespace App\Http;

use App\Http\Controllers\SpaController;
use Closure;
use Illuminate\Contracts\Support\Arrayable;
use Illuminate\Contracts\Support\Responsable;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * A page of Najenga's app (frontend/), drawn by the component it names
 * (resources/js/Pages/{component}.jsx) with these props. Controllers return
 * Page::render('Expenses', [...]), as they returned Inertia::render().
 *
 * The app asks for a page's data with an X-Kit-Page header and gets the page
 * object as JSON: { component, props, url, version }. A browser opening the
 * URL gets the app's index.html with the page object inside, so the app
 * starts without asking again. Shared props (auth, flash, errors) come from
 * App\Http\Middleware\HandlePageRequests.
 */
class Page implements Responsable
{
    public const HEADER = 'X-Kit-Page';

    /** @var array<string, mixed> */
    protected static array $shared = [];

    /** @param array<string, mixed> $props */
    public function __construct(public readonly string $component, public readonly array $props = [])
    {
    }

    /** @param array<string, mixed> $props */
    public static function render(string $component, array $props = []): self
    {
        return new self($component, $props);
    }

    /** Props every page gets: share('flash', fn () => ...) or share([...]). */
    public static function share(string|array $key, mixed $value = null): void
    {
        static::$shared = is_array($key) ? array_merge(static::$shared, $key) : array_merge(static::$shared, [$key => $value]);
    }

    public static function flushShared(): void
    {
        static::$shared = [];
    }

    /** Is this the app asking for a page's data (not a browser loading it)? */
    public static function requested(Request $request): bool
    {
        return $request->headers->has(self::HEADER);
    }

    /**
     * The app's build: a tab still running an older one reloads when a page
     * comes back with a different version (so it never asks for chunk files a
     * deploy removed).
     */
    public static function version(): string
    {
        $index = config('app.spa_index') ?: public_path('index.html');

        return is_file($index) ? md5_file($index) : '';
    }

    /** @return array{component: string, props: array<string, mixed>, url: string, version: string} */
    public function toPage(Request $request): array
    {
        return [
            'component' => $this->component,
            'props' => $this->resolve(array_merge(static::$shared, $this->props), $request),
            'url' => $request->getRequestUri(),
            'version' => static::version(),
        ];
    }

    public function toResponse($request): Response
    {
        $page = $this->toPage($request);

        if (static::requested($request)) {
            return new JsonResponse($page, 200, [self::HEADER => 'true', 'Vary' => self::HEADER]);
        }

        return response()
            ->view('kit-app', ['page' => $page, 'html' => SpaController::html($page)])
            ->header('Vary', self::HEADER)
            ->header('Cache-Control', 'no-cache, private');
    }

    /**
     * Closures are called, Arrayables and resources become arrays, all the
     * way down (as Inertia did).
     *
     * @param  array<string, mixed>  $props
     * @return array<string, mixed>
     */
    protected function resolve(array $props, Request $request): array
    {
        foreach ($props as $key => $value) {
            if ($value instanceof Closure) {
                $value = app()->call($value);
            }
            if ($value instanceof Arrayable) {
                $value = $value->toArray();
            }
            if ($value instanceof Responsable) {
                $response = $value->toResponse($request);
                if (method_exists($response, 'getData')) {
                    $value = $response->getData(true);
                }
            }
            if (is_array($value)) {
                $value = $this->resolve($value, $request);
            }
            $props[$key] = $value;
        }

        return $props;
    }
}
