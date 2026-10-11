<?php

namespace Tests\Feature\Auth;

use App\Models\LoginCode;
use App\Models\User;
use App\Notifications\LoginCodeNotification;
use App\Services\TwoFactorAuthenticator;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use PragmaRX\Google2FA\Google2FA;
use Tests\TestCase;

class LoginCodeTest extends TestCase
{
    use RefreshDatabase;

    public function test_page_renders(): void
    {
        $this->get(route('login.code'))->assertStatus(200);
    }

    public function test_request_creates_a_code_row_and_mails_it(): void
    {
        Notification::fake();
        $user = User::factory()->create();

        $this->post(route('login.code.request'), ['email' => $user->email])
            ->assertRedirect(route('login.code'))
            ->assertSessionHas('login_code.awaiting', true);

        $this->assertDatabaseCount('login_codes', 1);
        Notification::assertSentTo($user, LoginCodeNotification::class);
    }

    public function test_request_looks_the_same_for_unknown_emails(): void
    {
        Notification::fake();

        $this->post(route('login.code.request'), ['email' => 'nobody@example.test'])
            ->assertRedirect(route('login.code'))
            ->assertSessionHas('status');

        $this->assertDatabaseCount('login_codes', 0);
        Notification::assertNothingSent();
    }

    public function test_verify_signs_the_user_in_with_the_right_code(): void
    {
        Notification::fake();
        $user = User::factory()->create();

        $sentCode = null;
        $this->post(route('login.code.request'), ['email' => $user->email]);
        Notification::assertSentTo($user, LoginCodeNotification::class, function ($notif) use (&$sentCode) {
            $r = new \ReflectionClass($notif);
            $prop = $r->getProperty('code');
            $sentCode = $prop->getValue($notif);
            return true;
        });

        $response = $this->withSession(['login_code.email' => $user->email, 'login_code.awaiting' => true])
            ->post(route('login.code.verify'), [
                'email' => $user->email,
                'code' => $sentCode,
            ]);

        $this->assertAuthenticatedAs($user);
        $response->assertRedirect(route('dashboard', absolute: false));
        $this->assertNotNull(LoginCode::latest('id')->first()->used_at);
    }

    public function test_verify_rejects_a_wrong_code(): void
    {
        Notification::fake();
        $user = User::factory()->create();
        $this->post(route('login.code.request'), ['email' => $user->email]);

        $response = $this->post(route('login.code.verify'), [
            'email' => $user->email,
            'code' => '000000',
        ]);

        $response->assertSessionHasErrors('code');
        $this->assertGuest();
    }

    public function test_verify_rejects_an_expired_code(): void
    {
        Notification::fake();
        $user = User::factory()->create();
        $this->post(route('login.code.request'), ['email' => $user->email]);
        LoginCode::latest('id')->first()->forceFill(['expires_at' => now()->subMinute()])->save();

        // Even the correct plaintext code should fail because expires_at is past.
        $sentCode = null;
        Notification::assertSentTo($user, LoginCodeNotification::class, function ($notif) use (&$sentCode) {
            $sentCode = (new \ReflectionClass($notif))->getProperty('code')->getValue($notif);
            return true;
        });

        $this->post(route('login.code.verify'), [
            'email' => $user->email,
            'code' => $sentCode,
        ])->assertSessionHasErrors('code');
        $this->assertGuest();
    }

    public function test_verify_with_2fa_enabled_lands_on_the_challenge_page(): void
    {
        Notification::fake();
        $user = User::factory()->create();
        $secret = (new Google2FA())->generateSecretKey();
        $user->forceFill([
            'two_factor_secret' => $secret,
            'two_factor_recovery_codes' => json_encode((new TwoFactorAuthenticator(new Google2FA()))->generateRecoveryCodes()),
            'two_factor_confirmed_at' => now(),
        ])->save();

        $this->post(route('login.code.request'), ['email' => $user->email]);
        $sentCode = null;
        Notification::assertSentTo($user, LoginCodeNotification::class, function ($notif) use (&$sentCode) {
            $sentCode = (new \ReflectionClass($notif))->getProperty('code')->getValue($notif);
            return true;
        });

        $response = $this->post(route('login.code.verify'), [
            'email' => $user->email,
            'code' => $sentCode,
        ]);

        $response->assertRedirect(route('two-factor.login'));
        $this->assertGuest();
        $this->assertSame($user->id, session('login.id'));
    }
}
