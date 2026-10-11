<?php

namespace Tests\Feature;

use App\Http\Middleware\HandleInertiaRequests;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Request;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Tests\TestCase;

class ErrorPagesTest extends TestCase
{
    use RefreshDatabase;

    private const MISSING = '/this-route-does-not-exist';

    public function test_unknown_route_renders_the_custom_404_page(): void
    {
        $response = $this->get('/definitely-not-a-route');

        $response->assertStatus(404);
        $response->assertSee('Page not found');
        $response->assertSee('Back to home');
    }

    public function test_404_page_does_not_expose_a_stack_trace(): void
    {
        $response = $this->get('/definitely-not-a-route');

        $response->assertDontSee('Whoops');
        $response->assertDontSee('Stack trace');
    }

    public function test_403_page_shows_the_abort_message(): void
    {
        $html = view('errors.403', [
            'exception' => new HttpException(403, 'Unauthorized. Admin access required.'),
        ])->render();

        $this->assertStringContainsString('Access denied', $html);
        $this->assertStringContainsString('Unauthorized. Admin access required.', $html);
    }

    public function test_403_page_falls_back_when_there_is_no_message(): void
    {
        $html = view('errors.403', [
            'exception' => new HttpException(403),
        ])->render();

        $this->assertStringContainsString('You do not have permission to view this page.', $html);
    }

    public function test_every_status_page_renders_without_vite(): void
    {
        $headings = [
            403 => 'Access denied',
            404 => 'Page not found',
            419 => 'Session expired',
            500 => 'Something went wrong',
            503 => 'Maintenance in progress',
        ];

        foreach ($headings as $status => $heading) {
            $html = view("errors.{$status}", [
                'exception' => new HttpException($status),
            ])->render();

            $this->assertStringContainsString($heading, $html, "errors.{$status} is missing its heading.");
            $this->assertStringContainsString('Back to home', $html, "errors.{$status} is missing the home link.");
            // The page must be self-contained so it still renders when the build is broken.
            $this->assertStringNotContainsString('/build/assets/', $html, "errors.{$status} must not depend on Vite.");
        }
    }

    public function test_an_inertia_visit_to_a_missing_route_gets_the_react_error_page(): void
    {
        $response = $this->get(self::MISSING, ['X-Inertia' => 'true']);

        // assertInertia() reads viewData('page'), which only exists on the
        // HTML rendering of the root template - an X-Inertia request gets
        // JSON back, so assert on that body directly.
        $response->assertStatus(404);
        $response->assertHeader('X-Inertia', 'true');
        $this->assertSame('Errors', $response->json('component'));
        $this->assertSame(404, $response->json('props.status'));
    }

    public function test_the_error_page_carries_the_asset_version(): void
    {
        $response = $this->get(self::MISSING, ['X-Inertia' => 'true']);

        // Without this the client would store version "", then have its
        // next visit answered with a 409 reload.
        $this->assertSame(
            (string) (new HandleInertiaRequests)->version(Request::create(self::MISSING)),
            $response->json('version')
        );
    }

    public function test_a_forbidden_inertia_visit_reports_the_real_status(): void
    {
        $user = User::factory()->create(['role' => 'client']);

        $headers = ['X-Inertia' => 'true'];
        $version = (new HandleInertiaRequests)->version(Request::create('/users'));

        if ($version !== null) {
            // A real Inertia client always sends the version it holds;
            // without it HandleVersion answers 409 before the page shows.
            $headers['X-Inertia-Version'] = $version;
        }

        $response = $this->actingAs($user)->get('/users', $headers);

        $response->assertStatus(403);
        $response->assertHeader('X-Inertia', 'true');
        $this->assertSame('Errors', $response->json('component'));
        $this->assertSame(403, $response->json('props.status'));
    }

    public function test_json_requests_are_not_handed_the_react_error_page(): void
    {
        $response = $this->getJson(self::MISSING);

        $response->assertStatus(404);
        $response->assertJsonStructure(['message']);
    }

    /**
     * The render callback in bootstrap/app.php runs before Laravel converts
     * a ValidationException, so if it claims one, every rejected form - the
     * login typo above all - answers 500 and the field messages are lost.
     */
    public function test_a_rejected_form_gets_errors_not_the_error_page(): void
    {
        $response = $this->post('/login', [
            'email' => 'nobody@example.com',
            'password' => 'wrong-password',
        ], [
            'X-Inertia' => 'true',
            'Accept' => 'text/html',
        ]);

        $response->assertStatus(302);
        $response->assertSessionHasErrors('email');
    }

    public function test_a_signed_out_inertia_visit_is_sent_to_login(): void
    {
        $headers = [
            'X-Inertia' => 'true',
            'Accept' => 'text/html',
            'X-Inertia-Version' => (string) (new HandleInertiaRequests)->version(Request::create('/activity-logs')),
        ];

        $response = $this->get('/activity-logs', $headers);

        $response->assertRedirect('/login');
    }
}
