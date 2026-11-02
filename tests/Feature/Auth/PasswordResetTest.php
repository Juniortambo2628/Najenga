<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

/** Forgotten passwords, on the kit's auth API. */
class PasswordResetTest extends TestCase
{
    use RefreshDatabase;

    public function test_reset_password_link_screen_can_be_rendered(): void
    {
        $this->get('/forgot-password')->assertOk()->assertPage(fn ($page) => $page->component('Auth/ForgotPassword'));
    }

    public function test_reset_password_link_can_be_requested_and_opens_the_reset_page(): void
    {
        Notification::fake();
        $user = User::factory()->create();

        $this->postJson('/api/forgot-password', ['email' => 'nobody@example.com'])->assertOk();
        $this->postJson('/api/forgot-password', ['email' => $user->email])->assertOk();

        Notification::assertSentTo($user, ResetPassword::class, function (ResetPassword $notification) use ($user) {
            $url = $notification->toMail($user)->actionUrl;
            $this->assertSame(url('/reset-password/'.$notification->token).'?email='.urlencode($user->email), $url);

            $this->get('/reset-password/'.$notification->token.'?email='.urlencode($user->email))
                ->assertOk()
                ->assertPage(fn ($page) => $page->component('Auth/ResetPassword')->where('token', $notification->token)->where('email', $user->email));

            return true;
        });
    }

    public function test_password_can_be_reset_with_valid_token(): void
    {
        Notification::fake();
        $user = User::factory()->create();

        $this->postJson('/api/forgot-password', ['email' => $user->email]);

        Notification::assertSentTo($user, ResetPassword::class, function (ResetPassword $notification) use ($user) {
            $this->postJson('/api/reset-password', [
                'token' => $notification->token,
                'email' => $user->email,
                'password' => 'new-password',
                'password_confirmation' => 'new-password',
            ])->assertOk();

            return true;
        });

        $this->postJson('/api/login', ['email' => $user->email, 'password' => 'new-password'])->assertOk();
    }

    public function test_a_wrong_token_is_refused(): void
    {
        $user = User::factory()->create();

        $this->postJson('/api/reset-password', [
            'token' => 'wrong',
            'email' => $user->email,
            'password' => 'new-password',
            'password_confirmation' => 'new-password',
        ])->assertStatus(422)->assertJsonValidationErrors('email');
    }
}
