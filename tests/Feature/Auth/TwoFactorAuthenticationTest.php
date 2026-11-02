<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Okjt\Kit\Auth\TwoFactor;
use PragmaRX\Google2FA\Google2FA;
use Tests\TestCase;

/**
 * Two-step sign-in on the kit (okjt.auth.two_factor.secrets_encrypted: the
 * secrets and recovery codes stay stored as Laravel Fortify stored them, so
 * nobody who had it on loses it).
 */
class TwoFactorAuthenticationTest extends TestCase
{
    use RefreshDatabase;

    private const SECRET = 'JBSWY3DPEHPK3PXP';

    /** Two-step sign-in on, stored exactly as Fortify stored it. */
    private function userWithTwoFactor(array $recoveryCodes = ['abcdefghij-klmnopqrst', 'second-code-0000000000']): User
    {
        return User::factory()->create([
            'two_factor_secret' => encrypt(self::SECRET),
            'two_factor_recovery_codes' => encrypt(json_encode($recoveryCodes)),
            'two_factor_confirmed_at' => now(),
        ]);
    }

    private function challenge(User $user): string
    {
        return $this->postJson('/api/login', ['email' => $user->email, 'password' => 'password'])
            ->assertOk()
            ->assertJsonPath('data.requires_2fa', true)
            ->json('data.challenge');
    }

    public function test_setup_stores_a_pending_secret_as_fortify_did_without_turning_it_on(): void
    {
        $user = User::factory()->create();

        $secret = $this->actingAs($user)->postJson('/api/2fa/setup')->assertOk()->json('secret');

        $user->refresh();
        $this->assertSame($secret, decrypt($user->two_factor_secret));
        $this->assertFalse($user->hasEnabledTwoFactorAuthentication());
    }

    public function test_confirm_needs_a_code_from_the_app_and_hands_out_recovery_codes(): void
    {
        $user = User::factory()->create();
        $secret = $this->actingAs($user)->postJson('/api/2fa/setup')->json('secret');

        $this->postJson('/api/2fa/confirm', ['code' => '000000'])->assertStatus(422);
        $this->assertFalse($user->refresh()->hasEnabledTwoFactorAuthentication());

        $codes = $this->postJson('/api/2fa/confirm', ['code' => (new Google2FA)->getCurrentOtp($secret)])
            ->assertOk()->json('recovery_codes');

        $user->refresh();
        $this->assertTrue($user->hasEnabledTwoFactorAuthentication());
        $this->assertCount(8, $codes);
        $this->assertSame($codes, json_decode(decrypt($user->two_factor_recovery_codes), true));
    }

    public function test_signing_in_asks_for_the_second_step(): void
    {
        $user = $this->userWithTwoFactor();

        $this->challenge($user);

        $this->assertGuest();
    }

    public function test_a_code_from_the_app_completes_the_sign_in(): void
    {
        $user = $this->userWithTwoFactor();
        $challenge = $this->challenge($user);

        $this->postJson('/api/verify-2fa', ['challenge' => $challenge, 'code' => '000000'])->assertStatus(422);
        $this->assertGuest();

        $this->postJson('/api/verify-2fa', ['challenge' => $challenge, 'code' => (new Google2FA)->getCurrentOtp(self::SECRET)])
            ->assertOk()
            ->assertJsonPath('data.redirect', route('dashboard', absolute: false));
        $this->assertAuthenticatedAs($user);
    }

    public function test_a_code_without_the_challenge_signs_nobody_in(): void
    {
        $user = $this->userWithTwoFactor();

        $this->postJson('/api/verify-2fa', ['email' => $user->email, 'code' => (new Google2FA)->getCurrentOtp(self::SECRET)])
            ->assertStatus(422);
        $this->postJson('/api/verify-2fa', ['challenge' => 'forged', 'code' => (new Google2FA)->getCurrentOtp(self::SECRET)])
            ->assertStatus(422);
        $this->assertGuest();
    }

    public function test_a_recovery_code_completes_the_sign_in_once_and_is_replaced(): void
    {
        $user = $this->userWithTwoFactor();

        $this->postJson('/api/verify-2fa', ['challenge' => $this->challenge($user), 'code' => 'abcdefghij-klmnopqrst'])->assertOk();
        $this->assertAuthenticatedAs($user);

        $codes = TwoFactor::recoveryCodesOf($user->fresh());
        $this->assertCount(2, $codes);
        $this->assertNotContains('abcdefghij-klmnopqrst', $codes);
        $this->assertContains('second-code-0000000000', $codes);

        auth()->guard('web')->logout();
        $this->postJson('/api/verify-2fa', ['challenge' => $this->challenge($user), 'code' => 'abcdefghij-klmnopqrst'])->assertStatus(422);
        $this->assertGuest();
    }

    public function test_recovery_codes_can_be_shown_and_replaced(): void
    {
        $user = $this->userWithTwoFactor();

        $this->actingAs($user)->getJson('/api/2fa/recovery-codes')->assertJsonPath('recovery_codes', ['abcdefghij-klmnopqrst', 'second-code-0000000000']);
        $codes = $this->postJson('/api/2fa/recovery-codes')->assertOk()->json('recovery_codes');

        $this->assertCount(8, $codes);
        $this->assertSame($codes, TwoFactor::recoveryCodesOf($user->fresh()));
    }

    public function test_turning_it_off_clears_the_secret_and_recovery_codes(): void
    {
        $user = $this->userWithTwoFactor();

        $this->actingAs($user)->postJson('/api/2fa/disable')->assertOk();

        $user->refresh();
        $this->assertNull($user->two_factor_secret);
        $this->assertNull($user->two_factor_recovery_codes);
        $this->assertFalse($user->hasEnabledTwoFactorAuthentication());
    }

    public function test_the_profile_shows_the_setup_and_the_recovery_codes(): void
    {
        $user = User::factory()->create();
        $secret = $this->actingAs($user)->postJson('/api/2fa/setup')->json('secret');

        $this->get(route('settings'))->assertPage(fn ($page) => $page
            ->where('twoFactor.enabled', false)
            ->where('twoFactor.pending.secret', $secret)
            ->etc());
        $this->get(route('profile.two-factor'))->assertPage(fn ($page) => $page
            ->where('pending', true)
            ->where('setup.secret', $secret)
            ->etc());

        $this->postJson('/api/2fa/confirm', ['code' => (new Google2FA)->getCurrentOtp($secret)]);
        $this->get(route('settings'))->assertPage(fn ($page) => $page
            ->where('twoFactor.enabled', true)
            ->where('twoFactor.recovery_codes', TwoFactor::recoveryCodesOf($user->fresh()))
            ->etc());
    }
}
