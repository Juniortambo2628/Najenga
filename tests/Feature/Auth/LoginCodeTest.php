<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use App\Notifications\LoginCodeNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Okjt\Kit\Auth\LoginCode;
use Tests\TestCase;

/** Signing in with a code sent by email (the kit's, with Najenga's email). */
class LoginCodeTest extends TestCase
{
    use RefreshDatabase;

    private function requestCode(User $user): string
    {
        Notification::fake();
        $this->postJson('/api/login-code', ['email' => $user->email])->assertOk();

        return Notification::sent($user, LoginCodeNotification::class)->last()->code;
    }

    public function test_requesting_a_code_emails_six_digits_and_keeps_only_its_hash(): void
    {
        $user = User::factory()->create();

        $code = $this->requestCode($user);

        $this->assertMatchesRegularExpression('/^\d{6}$/', $code);
        $this->assertDatabaseCount('login_codes', 1);
        $this->assertNotSame($code, LoginCode::sole()->code_hash);
    }

    public function test_unknown_email_gets_the_same_answer_without_a_code(): void
    {
        Notification::fake();

        $this->postJson('/api/login-code', ['email' => 'nobody@example.test'])
            ->assertOk()
            ->assertJson(['message' => 'If that address exists, a sign-in code is on its way.']);

        $this->assertDatabaseCount('login_codes', 0);
        Notification::assertNothingSent();
    }

    public function test_the_code_signs_the_user_in_once(): void
    {
        $user = User::factory()->create();
        $code = $this->requestCode($user);

        $this->postJson('/api/login-code/verify', ['email' => $user->email, 'code' => $code])
            ->assertOk()
            ->assertJsonPath('data.redirect', route('dashboard', absolute: false));
        $this->assertAuthenticatedAs($user);

        auth()->guard('web')->logout();
        $this->postJson('/api/login-code/verify', ['email' => $user->email, 'code' => $code])->assertStatus(422);
        $this->assertGuest();
    }

    public function test_a_wrong_or_expired_code_is_rejected(): void
    {
        $user = User::factory()->create();
        $code = $this->requestCode($user);

        $this->postJson('/api/login-code/verify', ['email' => $user->email, 'code' => $code === '000000' ? '111111' : '000000'])
            ->assertStatus(422)
            ->assertJsonPath('errors.code.0', 'That sign-in code is invalid or expired.');

        $this->travel(11)->minutes();
        $this->postJson('/api/login-code/verify', ['email' => $user->email, 'code' => $code])->assertStatus(422);
        $this->assertGuest();
    }

    public function test_with_two_step_sign_in_on_the_code_still_asks_for_the_second_step(): void
    {
        $user = User::factory()->create([
            'two_factor_secret' => encrypt('JBSWY3DPEHPK3PXP'),
            'two_factor_confirmed_at' => now(),
        ]);
        $code = $this->requestCode($user);

        $this->postJson('/api/login-code/verify', ['email' => $user->email, 'code' => $code])
            ->assertOk()
            ->assertJsonPath('data.requires_2fa', true);
        $this->assertGuest();
    }

    public function test_code_requests_are_rate_limited(): void
    {
        Notification::fake();
        $user = User::factory()->create();

        foreach (range(1, 3) as $i) {
            $this->postJson('/api/login-code', ['email' => $user->email])->assertOk();
        }
        $this->postJson('/api/login-code', ['email' => $user->email])->assertStatus(429);
    }
}
