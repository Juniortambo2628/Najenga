<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use PragmaRX\Google2FA\Google2FA;
use Tests\TestCase;

class TwoFactorAuthenticationTest extends TestCase
{
    use RefreshDatabase;

    private function enableAndConfirm(User $user): string
    {
        $this->actingAs($user)->post(route('two-factor.enable'))->assertRedirect();

        $secret = decrypt($user->fresh()->two_factor_secret);
        $code = app(Google2FA::class)->getCurrentOtp($secret);

        $this->actingAs($user)
            ->post(route('two-factor.confirm'), ['code' => $code])
            ->assertRedirect();

        $this->assertNotNull($user->fresh()->two_factor_confirmed_at);

        return $secret;
    }

    private function prepareChallengedUser(User $user): string
    {
        $secret = $this->enableAndConfirm($user);

        $this->post(route('logout'))->assertRedirect();
        $this->assertGuest();

        Cache::flush();

        return $secret;
    }

    public function test_login_with_two_factor_enabled_redirects_to_the_challenge(): void
    {
        $user = User::factory()->create();
        $this->prepareChallengedUser($user);

        $this->post('/login', [
            'email' => $user->email,
            'password' => 'password',
        ])->assertRedirect(route('two-factor.login'));

        $this->assertGuest();
        $this->assertSame($user->getKey(), session('login.id'));
    }

    public function test_valid_authenticator_code_completes_the_login(): void
    {
        $user = User::factory()->create();
        $secret = $this->prepareChallengedUser($user);

        $this->post('/login', [
            'email' => $user->email,
            'password' => 'password',
        ])->assertRedirect(route('two-factor.login'));

        $this->post('/two-factor-challenge', [
            'code' => app(Google2FA::class)->getCurrentOtp($secret),
        ])->assertRedirect('/dashboard');

        $this->assertAuthenticatedAs($user);
        $this->assertNull(session('login.id'));
    }

    public function test_invalid_authenticator_code_is_rejected(): void
    {
        $user = User::factory()->create();
        $secret = $this->prepareChallengedUser($user);

        $this->post('/login', [
            'email' => $user->email,
            'password' => 'password',
        ])->assertRedirect(route('two-factor.login'));

        $current = (int) app(Google2FA::class)->getCurrentOtp($secret);
        $wrong = str_pad((string) (($current + 1) % 1000000), 6, '0', STR_PAD_LEFT);

        $this->post('/two-factor-challenge', ['code' => $wrong])
            ->assertRedirect(route('two-factor.login'))
            ->assertSessionHasErrors('code');

        $this->assertGuest();
    }

    public function test_recovery_code_completes_the_login_and_is_replaced(): void
    {
        $user = User::factory()->create();
        $this->prepareChallengedUser($user);

        $recoveryCode = $user->fresh()->recoveryCodes()[0];

        $this->post('/login', [
            'email' => $user->email,
            'password' => 'password',
        ])->assertRedirect(route('two-factor.login'));

        $this->post('/two-factor-challenge', [
            'recovery_code' => $recoveryCode,
        ])->assertRedirect('/dashboard');

        $this->assertAuthenticatedAs($user);
        $this->assertNotContains($recoveryCode, $user->fresh()->recoveryCodes());
    }

    public function test_challenge_without_a_code_is_rejected(): void
    {
        $user = User::factory()->create();
        $this->prepareChallengedUser($user);

        $this->post('/login', [
            'email' => $user->email,
            'password' => 'password',
        ])->assertRedirect(route('two-factor.login'));

        $this->post('/two-factor-challenge', [])
            ->assertRedirect(route('two-factor.login'))
            ->assertSessionHasErrors('code');

        $this->assertGuest();
    }

    public function test_challenge_page_redirects_to_login_without_a_pending_session(): void
    {
        $this->get('/two-factor-challenge')->assertRedirect('/login');
    }

    public function test_challenge_page_renders_for_a_challenged_session(): void
    {
        $user = User::factory()->create();
        $this->prepareChallengedUser($user);

        $this->post('/login', [
            'email' => $user->email,
            'password' => 'password',
        ])->assertRedirect(route('two-factor.login'));

        $this->get('/two-factor-challenge')
            ->assertOk()
            ->assertInertia(fn ($page) => $page->component('Auth/TwoFactorChallenge'));
    }

    public function test_user_without_two_factor_logs_in_directly(): void
    {
        $user = User::factory()->create();

        $this->post('/login', [
            'email' => $user->email,
            'password' => 'password',
        ])->assertRedirect('/dashboard');

        $this->assertAuthenticatedAs($user);
    }

    public function test_unconfirmed_two_factor_setup_does_not_challenge_login(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)->post(route('two-factor.enable'))->assertRedirect();
        $this->post(route('logout'))->assertRedirect();

        $this->post('/login', [
            'email' => $user->email,
            'password' => 'password',
        ])->assertRedirect('/dashboard');

        $this->assertAuthenticatedAs($user);
    }

    public function test_profile_endpoints_manage_two_factor_state(): void
    {
        $user = User::factory()->create();

        $this->post('/user/two-factor-authentication')->assertRedirect('/login');

        $this->actingAs($user)->post(route('two-factor.enable'))->assertRedirect();
        $user->refresh();

        $qr = $this->actingAs($user)->getJson(route('two-factor.qr-code'));
        $qr->assertOk()->assertJsonStructure(['svg', 'url']);

        $secret = $this->actingAs($user)
            ->getJson(route('two-factor.secret-key'))
            ->assertOk()
            ->json('secretKey');
        $this->assertSame(decrypt($user->two_factor_secret), $secret);

        $codes = $this->actingAs($user)
            ->getJson(route('two-factor.recovery-codes'))
            ->assertOk()
            ->json();
        $this->assertCount(8, $codes);

        $this->actingAs($user)->post(route('two-factor.regenerate-recovery-codes'))->assertRedirect();
        $newCodes = $this->actingAs($user)
            ->getJson(route('two-factor.recovery-codes'))
            ->assertOk()
            ->json();
        $this->assertCount(8, $newCodes);
        $this->assertNotSame($codes, $newCodes);

        $this->actingAs($user)->delete(route('two-factor.disable'))->assertRedirect();
        $user->refresh();
        $this->assertNull($user->two_factor_secret);
        $this->assertNull($user->two_factor_confirmed_at);
        $this->assertNull($user->two_factor_recovery_codes);
    }

    public function test_two_factor_page_requires_authentication(): void
    {
        $this->get(route('profile.two-factor'))->assertRedirect('/login');
    }

    public function test_two_factor_page_reports_current_state(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->get(route('profile.two-factor'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Profile/TwoFactor')
                ->where('enabled', false)
                ->where('pending', false));

        $this->actingAs($user)->post(route('two-factor.enable'))->assertRedirect();

        $this->actingAs($user)
            ->get(route('profile.two-factor'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Profile/TwoFactor')
                ->where('enabled', false)
                ->where('pending', true));

        $secret = decrypt($user->fresh()->two_factor_secret);
        $code = app(Google2FA::class)->getCurrentOtp($secret);
        $this->actingAs($user)
            ->post(route('two-factor.confirm'), ['code' => $code])
            ->assertRedirect();

        $this->actingAs($user)
            ->get(route('profile.two-factor'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Profile/TwoFactor')
                ->where('enabled', true)
                ->where('pending', false));
    }
}
