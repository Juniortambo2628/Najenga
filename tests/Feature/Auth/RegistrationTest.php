<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

/** Signing up, on the kit's auth API, with Najenga's fields. */
class RegistrationTest extends TestCase
{
    use RefreshDatabase;

    public function test_registration_screen_can_be_rendered(): void
    {
        $this->get('/register')->assertOk()->assertPage(fn ($page) => $page->component('Auth/Register'));
    }

    public function test_new_users_can_register_and_are_signed_straight_in(): void
    {
        Notification::fake();

        $this->postJson('/api/register', [
            'first_name' => 'Test',
            'last_name' => 'User',
            'username' => 'testuser',
            'email' => 'test@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
        ])->assertCreated()->assertJsonPath('data.redirect', route('dashboard', absolute: false));

        $user = User::where('email', 'test@example.com')->sole();
        $this->assertAuthenticatedAs($user);
        $this->assertSame('Test User', $user->name);
        // Najenga doesn't ask for verification (as before): no email.
        Notification::assertNotSentTo($user, VerifyEmail::class);
    }

    public function test_registration_needs_najengas_fields(): void
    {
        User::factory()->create(['username' => 'taken']);

        $this->postJson('/api/register', [
            'first_name' => 'Test',
            'email' => 'test@example.com',
            'username' => 'taken',
            'password' => 'password',
            'password_confirmation' => 'password',
        ])->assertStatus(422)->assertJsonValidationErrors(['last_name', 'username']);

        $this->assertGuest();
    }
}
