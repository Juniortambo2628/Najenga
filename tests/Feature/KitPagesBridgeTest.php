<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/** Pages moved to the kit app: index.html for the browser, Inertia props as JSON for the app. */
class KitPagesBridgeTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        config(['najenga.kit_pages' => ['expenses', 'users.index']]);
    }

    public function test_a_moved_page_serves_the_kit_app_with_its_data(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->get('/expenses')
            ->assertOk()
            ->assertSee('najenga-spa-fixture', false)
            ->assertSee('<script id="kit-page" type="application/json">', false)
            ->assertInertia(fn ($page) => $page->component('Expenses')->where('auth.user.id', $user->id));
    }

    public function test_the_embedded_data_cannot_close_its_script_tag(): void
    {
        $html = \App\Http\Controllers\SpaController::html(['component' => 'X', 'props' => ['title' => '</script><script>alert(1)</script>']]);

        $this->assertStringNotContainsString('</script><script>alert(1)', $html);
        $this->assertStringContainsString('\\u003C/script\\u003E', $html);
    }

    public function test_the_kit_app_gets_the_pages_props_as_json(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->getJson('/expenses', ['X-Kit-Page' => '1'])
            ->assertOk()
            ->assertJsonPath('component', 'Expenses')
            ->assertJsonPath('props.auth.user.id', $user->id)
            ->assertJsonStructure(['component', 'props', 'url', 'version']);
    }

    public function test_an_inertia_visit_reloads_into_the_kit_app(): void
    {
        $this->actingAs(User::factory()->create())
            ->get('/expenses', ['X-Inertia' => 'true'])
            ->assertStatus(409)
            ->assertHeader('X-Inertia-Location', url('/expenses'));
    }

    public function test_signed_out_visitors_still_go_to_sign_in(): void
    {
        $this->get('/expenses')->assertRedirect('/login');
        $this->getJson('/expenses', ['X-Kit-Page' => '1'])->assertUnauthorized();
    }

    public function test_pages_that_have_not_moved_are_still_inertia(): void
    {
        config(['najenga.kit_pages' => ['expenses']]);

        $this->actingAs(User::factory()->create())
            ->get('/photos')
            ->assertOk()
            ->assertDontSee('najenga-spa-fixture', false);
    }

    public function test_a_page_that_redirects_still_redirects(): void
    {
        // /projects sends you to /overview.
        config(['najenga.kit_pages' => ['projects', 'overview']]);

        $this->actingAs(User::factory()->create())
            ->get('/projects')
            ->assertRedirect(route('overview'));
    }

    public function test_every_dashboard_page_is_listed_and_can_be_switched_off(): void
    {
        $listed = require base_path('config/najenga.php');
        $this->assertContains('expenses', $listed['kit_pages']);
        $this->assertContains('dashboard', $listed['kit_pages']);

        putenv('NAJENGA_KIT_PAGES=off');
        $_ENV['NAJENGA_KIT_PAGES'] = $_SERVER['NAJENGA_KIT_PAGES'] = 'off';
        try {
            $this->assertSame([], (require base_path('config/najenga.php'))['kit_pages']);
        } finally {
            putenv('NAJENGA_KIT_PAGES');
            unset($_ENV['NAJENGA_KIT_PAGES'], $_SERVER['NAJENGA_KIT_PAGES']);
        }
    }
}
