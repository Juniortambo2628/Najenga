<?php

namespace Tests\Feature;

use App\Models\LoginCode;
use App\Models\User;
use App\Notifications\LoginCodeNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class LoginCodeTest extends TestCase
{
    use RefreshDatabase;

    private function requestCodeFor(User $user): string
    {
        Notification::fake();

        $this->post('/login-code', ['email' => $user->email])->assertRedirect();

        $plain = null;
        Notification::assertSentTo($user, LoginCodeNotification::class, function (LoginCodeNotification $notification) use (&$plain): bool {
            $plain = $notification->code;

            return true;
        });

        $this->assertNotNull($plain);

        return $plain;
    }

    public function test_requesting_a_login_code_emails_a_six_digit_code(): void
    {
        $user = User::factory()->create();

        $plain = $this->requestCodeFor($user);

        $this->assertMatchesRegularExpression('/^\d{6}$/', $plain);

        $record = LoginCode::where('user_id', $user->id)->firstOrFail();

        $this->assertNotSame($plain, $record->code_hash);
        $this->assertNull($record->used_at);
        $this->assertTrue($record->expires_at->isFuture());
        $this->assertSame('127.0.0.1', $record->requested_ip);
    }

    public function test_unknown_email_gets_the_same_response_without_a_code(): void
    {
        Notification::fake();

        $this->post('/login-code', ['email' => 'nobody@example.com'])
            ->assertRedirect()
            ->assertSessionHas('status', 'If that address exists, a sign-in code is on its way.');

        $this->assertDatabaseCount('login_codes', 0);
        Notification::assertNothingSent();
    }

    public function test_the_code_authenticates_the_user(): void
    {
        $user = User::factory()->create();
        $plain = $this->requestCodeFor($user);

        $this->post('/login-code/verify', [
            'email' => $user->email,
            'code' => $plain,
        ])->assertRedirect('/dashboard');

        $this->assertAuthenticatedAs($user);
        $this->assertNotNull(LoginCode::where('user_id', $user->id)->firstOrFail()->used_at);
    }

    public function test_a_wrong_code_is_rejected(): void
    {
        $user = User::factory()->create();
        $plain = $this->requestCodeFor($user);
        $wrong = $plain === '111111' ? '222222' : '111111';

        $this->from('/login')
            ->post('/login-code/verify', [
                'email' => $user->email,
                'code' => $wrong,
            ])
            ->assertRedirect('/login')
            ->assertSessionHasErrors('code');

        $this->assertGuest();
        $this->assertNull(LoginCode::where('user_id', $user->id)->firstOrFail()->used_at);
    }

    public function test_an_expired_code_is_rejected(): void
    {
        $user = User::factory()->create();

        Notification::fake();
        $this->post('/login-code', ['email' => $user->email])->assertRedirect();

        LoginCode::query()->update(['expires_at' => now()->subMinute()]);

        $record = LoginCode::where('user_id', $user->id)->firstOrFail();
        $plain = null;
        Notification::assertSentTo($user, LoginCodeNotification::class, function (LoginCodeNotification $notification) use (&$plain): bool {
            $plain = $notification->code;

            return true;
        });

        $this->from('/login')
            ->post('/login-code/verify', [
                'email' => $user->email,
                'code' => $plain,
            ])
            ->assertRedirect('/login')
            ->assertSessionHasErrors('code');

        $this->assertGuest();
        $this->assertTrue($record->fresh()->used_at === null);
    }

    public function test_a_code_cannot_be_used_twice(): void
    {
        $user = User::factory()->create();
        $plain = $this->requestCodeFor($user);

        $this->post('/login-code/verify', [
            'email' => $user->email,
            'code' => $plain,
        ])->assertRedirect('/dashboard');

        $this->post('/logout')->assertRedirect();

        $this->from('/login')
            ->post('/login-code/verify', [
                'email' => $user->email,
                'code' => $plain,
            ])
            ->assertRedirect('/login')
            ->assertSessionHasErrors('code');

        $this->assertGuest();
    }

    public function test_code_requests_are_rate_limited(): void
    {
        Notification::fake();

        foreach (range(1, 3) as $i) {
            $this->post('/login-code', ['email' => 'someone@example.com'])->assertRedirect();
        }

        $this->post('/login-code', ['email' => 'someone@example.com'])->assertStatus(429);
    }

    public function test_verification_requires_a_six_digit_code(): void
    {
        $this->from('/login')
            ->post('/login-code/verify', [
                'email' => 'someone@example.com',
                'code' => 'abc',
            ])
            ->assertRedirect('/login')
            ->assertSessionHasErrors('code');

        $this->assertGuest();
    }
}
