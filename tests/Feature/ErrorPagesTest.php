<?php

namespace Tests\Feature;

use App\Http\Page;
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

    public function test_the_app_asking_for_a_missing_route_gets_the_error_page(): void
    {
        $response = $this->get(self::MISSING, ['X-Kit-Page' => '1']);

        $response->assertStatus(404);
        $response->assertHeader('X-Kit-Page', 'true');
        $this->assertSame('Errors', $response->json('component'));
        $this->assertSame(404, $response->json('props.status'));
    }

    public function test_the_error_page_carries_the_asset_version(): void
    {
        $response = $this->get(self::MISSING, ['X-Kit-Page' => '1']);

        // Without it the app would take the error page for a new build and reload.
        $this->assertSame(Page::version(), $response->json('version'));
        $this->assertNotSame('', $response->json('version'));
    }

    public function test_a_forbidden_page_reports_the_real_status_to_the_kit_app(): void
    {
        // The app's request for /users' data gets the Errors page, at the real status.
        $user = User::factory()->create(['role' => 'client']);

        $response = $this->actingAs($user)->get('/users', ['X-Kit-Page' => '1']);

        $response->assertStatus(403);
        $response->assertHeader('X-Kit-Page', 'true');
        $this->assertSame('Errors', $response->json('component'));
        $this->assertSame(403, $response->json('props.status'));
    }

    public function test_a_forbidden_page_opened_in_the_browser_is_a_403_too(): void
    {
        // The Blade page, which renders even when the app's build is broken.
        $user = User::factory()->create(['role' => 'client']);

        $response = $this->actingAs($user)->get('/users');

        $response->assertStatus(403);
        $response->assertSee('Back to home');
        $response->assertDontSee('id="kit-page"', false);
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
            'X-Kit-Page' => '1',
            'Accept' => 'text/html',
        ]);

        $response->assertStatus(302);
        $response->assertSessionHasErrors('email');
    }

    public function test_the_app_asking_for_a_page_while_signed_out_is_sent_to_login(): void
    {
        $response = $this->get('/activity-logs', ['X-Kit-Page' => '1', 'Accept' => 'text/html']);

        $response->assertRedirect('/login');
    }
}
