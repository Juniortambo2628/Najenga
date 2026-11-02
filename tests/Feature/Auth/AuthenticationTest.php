<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/** Signing in and out, on the kit's auth API (session mode). */
class AuthenticationTest extends TestCase
{
    use RefreshDatabase;

    public function test_login_screen_can_be_rendered(): void
    {
        $this->get('/login')->assertOk()->assertPage(fn ($page) => $page->component('Auth/Login'));
    }

    public function test_users_can_authenticate_and_are_sent_to_the_dashboard(): void
    {
        $user = User::factory()->create();

        $this->postJson('/api/login', ['email' => $user->email, 'password' => 'password'])
            ->assertOk()
            ->assertJsonPath('data.user.id', $user->id)
            ->assertJsonPath('data.redirect', route('dashboard', absolute: false))
            ->assertJsonMissingPath('data.token');

        $this->assertAuthenticatedAs($user);
    }

    public function test_signing_in_goes_back_to_where_the_person_was_sent_away_from(): void
    {
        $user = User::factory()->create();

        $this->get('/activity-logs')->assertRedirect(route('login'));
        $this->postJson('/api/login', ['email' => $user->email, 'password' => 'password'])
            ->assertJsonPath('data.redirect', url('/activity-logs'));
    }

    public function test_remember_me_keeps_the_person_signed_in(): void
    {
        $user = User::factory()->create();

        $this->postJson('/api/login', ['email' => $user->email, 'password' => 'password', 'remember' => true])->assertOk();

        $this->assertNotNull($user->fresh()->remember_token);
    }

    public function test_users_can_not_authenticate_with_invalid_password(): void
    {
        $user = User::factory()->create();

        $this->postJson('/api/login', ['email' => $user->email, 'password' => 'wrong-password'])
            ->assertStatus(422)
            ->assertJsonPath('errors.email.0', 'These credentials do not match our records.');

        $this->assertGuest();
    }

    public function test_wrong_passwords_are_throttled(): void
    {
        $user = User::factory()->create();
        foreach (range(1, 5) as $i) {
            $this->postJson('/api/login', ['email' => $user->email, 'password' => 'wrong-password'])->assertStatus(422);
        }

        $this->postJson('/api/login', ['email' => $user->email, 'password' => 'password'])
            ->assertStatus(422)
            ->assertJsonValidationErrors('email');
        $this->assertGuest();
    }

    public function test_an_unverified_address_can_still_sign_in_as_before(): void
    {
        $user = User::factory()->unverified()->create();

        $this->postJson('/api/login', ['email' => $user->email, 'password' => 'password'])
            ->assertOk()
            ->assertJsonMissingPath('data.requires_verification');
        $this->assertAuthenticatedAs($user);
    }

    public function test_users_can_logout(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)->post('/logout')->assertRedirect('/');

        $this->assertGuest();
    }

    public function test_users_can_logout_from_the_api(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)->postJson('/api/logout')->assertOk();

        $this->assertGuest();
    }

    public function test_who_is_signed_in(): void
    {
        $user = User::factory()->create();

        $this->getJson('/api/user')->assertUnauthorized();
        $this->actingAs($user)->getJson('/api/user')->assertOk()->assertJsonPath('data.email', $user->email);
    }

    public function test_old_sign_in_addresses_go_to_the_sign_in_page(): void
    {
        $this->get('/login/code')->assertRedirect('/login');
        $this->get('/login/passkey')->assertRedirect('/login');
    }
}
