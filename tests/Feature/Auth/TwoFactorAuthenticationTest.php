<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use App\Services\TwoFactorAuthenticator;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PragmaRX\Google2FA\Google2FA;
use Tests\TestCase;

class TwoFactorAuthenticationTest extends TestCase
{
    use RefreshDatabase;

    public function test_enable_stashes_a_pending_secret_but_does_not_turn_2fa_on(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)->post(route('two-factor.enable'));

        $this->assertNotNull(session('two_factor_pending_secret'));
        $this->assertNull($user->refresh()->two_factor_confirmed_at);
    }

    public function test_confirm_requires_a_valid_code_from_the_pending_secret(): void
    {
        $user = User::factory()->create();
        $this->actingAs($user)->post(route('two-factor.enable'));
        $secret = session('two_factor_pending_secret');
        $code = (new Google2FA())->getCurrentOtp($secret);

        $this->actingAs($user)->post(route('two-factor.confirm'), ['code' => $code]);

        $fresh = $user->refresh();
        $this->assertTrue($fresh->hasEnabledTwoFactorAuthentication());
        $this->assertSame($secret, $fresh->two_factor_secret);
        $this->assertCount(8, $fresh->recoveryCodesArray());
        $this->assertNull(session('two_factor_pending_secret'));
    }

    public function test_confirm_rejects_a_wrong_code(): void
    {
        $user = User::factory()->create();
        $this->actingAs($user)->post(route('two-factor.enable'));

        $response = $this->actingAs($user)
            ->from(route('profile.edit'))
            ->post(route('two-factor.confirm'), ['code' => '000000']);

        $response->assertSessionHasErrors('code');
        $this->assertFalse($user->refresh()->hasEnabledTwoFactorAuthentication());
    }

    public function test_login_with_2fa_enabled_lands_on_the_challenge_page(): void
    {
        $user = $this->userWithTwoFactor();

        $response = $this->post('/login', [
            'email' => $user->email,
            'password' => 'password',
        ]);

        $response->assertRedirect(route('two-factor.login'));
        $this->assertGuest();
        $this->assertSame($user->id, session('login.id'));
    }

    public function test_valid_totp_at_challenge_completes_login(): void
    {
        $user = $this->userWithTwoFactor();
        $this->post('/login', ['email' => $user->email, 'password' => 'password']);

        $code = (new Google2FA())->getCurrentOtp($user->fresh()->two_factor_secret);
        $response = $this->post(route('two-factor.login'), ['code' => $code]);

        $this->assertAuthenticatedAs($user);
        $response->assertRedirect(route('dashboard', absolute: false));
    }

    public function test_recovery_code_at_challenge_completes_login_and_is_consumed(): void
    {
        $user = $this->userWithTwoFactor();
        $codes = $user->recoveryCodesArray();
        $this->post('/login', ['email' => $user->email, 'password' => 'password']);

        $this->post(route('two-factor.login'), ['recovery_code' => $codes[0]]);

        $this->assertAuthenticatedAs($user);
        $this->assertNotContains($codes[0], $user->fresh()->recoveryCodesArray());
        $this->assertCount(count($codes) - 1, $user->fresh()->recoveryCodesArray());
    }

    public function test_disabling_clears_the_secret_and_recovery_codes(): void
    {
        $user = $this->userWithTwoFactor();

        $this->actingAs($user)->delete(route('two-factor.disable'));

        $fresh = $user->refresh();
        $this->assertFalse($fresh->hasEnabledTwoFactorAuthentication());
        $this->assertNull($fresh->two_factor_secret);
        $this->assertNull($fresh->two_factor_recovery_codes);
    }

    private function userWithTwoFactor(): User
    {
        $user = User::factory()->create();
        $secret = (new Google2FA())->generateSecretKey();
        $codes = (new TwoFactorAuthenticator(new Google2FA()))->generateRecoveryCodes();
        $user->forceFill([
            'two_factor_secret' => $secret,
            'two_factor_recovery_codes' => json_encode($codes),
            'two_factor_confirmed_at' => now(),
        ])->save();

        return $user;
    }
}
