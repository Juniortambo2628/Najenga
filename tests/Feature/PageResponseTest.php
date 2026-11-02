<?php

namespace Tests\Feature;

use App\Http\Controllers\SpaController;
use App\Http\Page;
use App\Models\Expense;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Support\AssertablePage;
use Tests\TestCase;

/** App\Http\Page: index.html with the page inside for a browser, the page as JSON for the app. */
class PageResponseTest extends TestCase
{
    use RefreshDatabase;

    public function test_a_browser_gets_the_app_with_the_page_inside(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->get('/expenses')
            ->assertOk()
            ->assertHeader('Content-Type', 'text/html; charset=UTF-8')
            ->assertSee('najenga-spa-fixture', false)
            ->assertSee('<script id="kit-page" type="application/json">', false)
            ->assertPage(fn (AssertablePage $page) => $page
                ->component('Expenses')
                ->url('/expenses')
                ->version(Page::version())
                ->where('auth.user.id', $user->id)
                ->etc());
    }

    public function test_the_app_gets_the_page_as_json(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->getJson('/expenses?project=1', ['X-Kit-Page' => '1'])
            ->assertOk()
            ->assertHeader('X-Kit-Page', 'true')
            ->assertJsonPath('component', 'Expenses')
            ->assertJsonPath('url', '/expenses?project=1')
            ->assertJsonPath('props.auth.user.id', $user->id)
            ->assertJsonStructure(['component', 'props' => ['auth', 'flash', 'errors'], 'url', 'version']);
    }

    public function test_validation_errors_come_back_with_the_page(): void
    {
        $this->actingAs(User::factory()->create())
            ->from('/expenses/create')
            ->withHeaders(['X-Kit-Page' => '1', 'Accept' => 'text/html'])
            ->followingRedirects()
            ->post('/expenses', [])
            ->assertJsonPath('component', 'Expenses/Create')
            ->assertJsonPath('props.errors.title', 'The title field is required.');
    }

    public function test_a_redirect_after_a_change_is_a_303_for_the_app(): void
    {
        $user = User::factory()->create(['role' => 'client']);
        $expense = Expense::factory()->create(['user_id' => $user->id]);

        $this->actingAs($user)
            ->from('/expenses')
            ->delete("/expenses/{$expense->id}", [], ['X-Kit-Page' => '1'])
            ->assertStatus(303);
    }

    public function test_a_page_that_redirects_still_redirects(): void
    {
        // /projects sends you to /overview.
        $this->actingAs(User::factory()->create())
            ->get('/projects')
            ->assertRedirect(route('overview'));
    }

    public function test_signed_out_visitors_go_to_sign_in(): void
    {
        $this->get('/expenses')->assertRedirect('/login');
        $this->getJson('/expenses', ['X-Kit-Page' => '1'])->assertUnauthorized();
    }

    public function test_the_sign_in_page_is_a_page_too(): void
    {
        $this->get('/login')->assertOk()->assertPage(fn (AssertablePage $page) => $page->component('Auth/Login')->etc());
    }

    public function test_errors_without_a_build(): void
    {
        config(['app.spa_index' => base_path('tests/fixtures/missing.html')]);
        $user = User::factory()->create();

        // A browser gets the Blade page, which needs no build.
        $this->actingAs($user)->get('/expenses/999999')->assertNotFound()->assertSee('Back to home');

        // The app's own request still gets the Errors page: JSON needs no build either.
        $this->actingAs($user)->get('/expenses/999999', ['X-Kit-Page' => '1'])
            ->assertNotFound()
            ->assertJsonPath('component', 'Errors');
    }

    public function test_the_version_follows_the_build(): void
    {
        $this->assertSame(md5_file(base_path('tests/fixtures/spa-index.html')), Page::version());
    }

    public function test_the_embedded_page_cannot_close_its_script_tag(): void
    {
        $html = SpaController::html(['component' => 'X', 'props' => ['title' => '</script><script>alert(1)</script>']]);

        $this->assertStringNotContainsString('</script><script>alert(1)', $html);
        $this->assertStringContainsString('\\u003C/script\\u003E', $html);
    }
}
