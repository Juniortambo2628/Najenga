<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PasswordConfirmationTest extends TestCase
{
    use RefreshDatabase;

    public function test_confirm_password_screen_can_be_rendered(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)->get('/user/confirm-password')->assertOk()
            ->assertPage(fn ($page) => $page->component('Auth/ConfirmPassword'));
    }

    public function test_password_can_be_confirmed(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)->postJson('/api/confirm-password', ['password' => 'password'])->assertOk();
        $this->getJson('/api/confirmed-password-status')->assertJsonPath('data.confirmed', true);
    }

    public function test_password_is_not_confirmed_with_invalid_password(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)->postJson('/api/confirm-password', ['password' => 'wrong-password'])
            ->assertStatus(422)->assertJsonValidationErrors('password');
        $this->getJson('/api/confirmed-password-status')->assertJsonPath('data.confirmed', false);
    }
}
