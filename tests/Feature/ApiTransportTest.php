<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Auth\Middleware\Authenticate;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Session\Middleware\StartSession;
use Illuminate\Support\Facades\Route;
use Tests\TestCase;

/**
 * Covers the Phase 2.7 rule that decided route file placement: every URL
 * starting with /api/ lives in routes/api.php, and routes/web.php keeps the
 * Inertia HTML page flow.
 *
 * The sharp edge is middleware. routes/api.php is registered with the `api`
 * group, and that group contains SubstituteBindings only - no StartSession.
 * The web guard reads the login id out of the session, so any route in there
 * that uses plain `auth` has to opt into the `web` group or it silently 401s
 * for every real browser request.
 */
class ApiTransportTest extends TestCase
{
    use RefreshDatabase;

    public function test_no_api_prefixed_route_is_left_in_the_web_stack(): void
    {
        $webStack = [];
        $apiStack = [];

        foreach (Route::getRoutes() as $route) {
            if (str_starts_with($route->uri(), 'api/')) {
                $apiStack[] = $route;
            } elseif (in_array('web', $route->gatherMiddleware(), true)) {
                $webStack[] = $route;
            }
        }

        $this->assertNotEmpty($apiStack, 'no /api/ routes registered at all');

        foreach ($webStack as $route) {
            $this->assertFalse(
                str_starts_with($route->uri(), 'api/'),
                "route {$route->uri()} is served by routes/web.php but is prefixed /api/"
            );
        }

        // The three that were moved in the Option 4 consolidation.
        $this->assertSame(
            ['api/analytics', 'api/search/live', 'api/timeline/data'],
            collect($apiStack)
                ->pluck('uri')
                ->filter(fn ($uri) => $uri !== 'api/user' && $uri !== 'api/activity-logs')
                ->filter(fn ($uri) => ! str_contains($uri, 'webhook'))
                ->sort()
                ->values()
                ->all()
        );
    }

    public function test_session_authed_api_routes_opt_into_the_web_group(): void
    {
        $router = $this->app['router'];
        $checked = 0;

        foreach (Route::getRoutes() as $route) {
            if (! str_starts_with($route->uri(), 'api/')) {
                continue;
            }

            $declared = $route->gatherMiddleware();
            $usesWebGuard = in_array(Authenticate::class, $declared, true)
                || in_array('auth', $declared, true);

            if (! $usesWebGuard) {
                continue; // auth:sanctum resolves to Authenticate:sanctum
            }

            $checked++;

            $this->assertContains(
                'web',
                $declared,
                "{$route->uri()} must declare the web group, otherwise the web guard has no session to read"
            );

            $this->assertContains(
                StartSession::class,
                $router->gatherRouteMiddleware($route),
                "{$route->uri()} authenticates against the web guard but StartSession never runs"
            );
        }

        $this->assertGreaterThan(
            0,
            $checked,
            'no session-authed /api/ route was found, so the assertions above never ran'
        );
    }

    public function test_session_authed_api_routes_answer_for_a_signed_in_user(): void
    {
        $user = User::factory()->create(['role' => 'client']);

        $this->actingAs($user)
            ->getJson('/api/activity-logs')
            ->assertOk();

        $this->actingAs($user)
            ->getJson('/api/search/live?q=roof')
            ->assertOk()
            ->assertJsonStructure(['results']);

        $this->actingAs($user)
            ->getJson('/api/timeline/data')
            ->assertOk();

        $this->actingAs($user)
            ->get('/api/analytics')
            ->assertOk();
    }
}
