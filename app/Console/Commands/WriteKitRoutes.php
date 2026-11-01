<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Route;

/**
 * Writes Laravel's named routes (name => path) for the kit app in
 * frontend/, so its route('expenses.show', id) gives the same URLs as the
 * Inertia pages' Ziggy. Run after adding or renaming a route; a test fails
 * while the file is out of date.
 */
class WriteKitRoutes extends Command
{
    protected $signature = 'najenga:kit-routes {--check : Fail if the file is out of date instead of writing it}';

    protected $description = 'Write the named routes for the kit app (frontend/src/dashboard/routes.json)';

    public const PATH = 'frontend/src/dashboard/routes.json';

    public static function routes(): array
    {
        $routes = [];
        foreach (Route::getRoutes() as $route) {
            $name = $route->getName();
            if (! $name || str_starts_with($name, 'ignition.') || str_starts_with($name, 'sanctum.') || str_starts_with($name, 'storage.')) {
                continue;
            }
            $routes[$name] = '/'.ltrim($route->uri(), '/');
        }
        ksort($routes);

        return $routes;
    }

    public static function contents(): string
    {
        return json_encode(self::routes(), JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES)."\n";
    }

    public function handle(): int
    {
        $path = base_path(self::PATH);
        $current = is_file($path) ? file_get_contents($path) : null;

        if ($this->option('check')) {
            if ($current !== self::contents()) {
                $this->error(self::PATH.' is out of date: run php artisan najenga:kit-routes');

                return self::FAILURE;
            }

            return self::SUCCESS;
        }

        file_put_contents($path, self::contents());
        $this->info('Wrote '.self::PATH.' ('.count(self::routes()).' routes)');

        return self::SUCCESS;
    }
}
