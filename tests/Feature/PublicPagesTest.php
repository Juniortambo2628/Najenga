<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/** The public pages are the kit app (frontend/); Laravel serves its index.html. */
class PublicPagesTest extends TestCase
{
    use RefreshDatabase;

    public function test_the_public_pages_serve_the_kit_app(): void
    {
        foreach (['/', '/for-homeowners', '/for-contractors', '/privacy', '/terms'] as $path) {
            $this->get($path)
                ->assertOk()
                ->assertHeader('Content-Type', 'text/html; charset=UTF-8')
                ->assertSee('najenga-spa-fixture', false);
        }
    }

    public function test_the_route_names_still_point_at_them(): void
    {
        $this->assertSame(url('/for-homeowners'), route('journey.homeowners'));
        $this->assertSame(url('/privacy'), route('privacy'));
    }

    public function test_a_missing_build_says_so(): void
    {
        config(['app.spa_index' => __DIR__.'/../fixtures/missing.html']);

        $this->get('/')->assertStatus(503);
    }

    public function test_the_session_endpoint_says_whether_someone_is_signed_in(): void
    {
        $this->getJson('/api/session')->assertOk()->assertExactJson(['signed_in' => false]);

        $this->actingAs(User::factory()->create())
            ->getJson('/api/session')->assertOk()->assertExactJson(['signed_in' => true]);
    }
}
