<?php

namespace Tests\Feature\Auth;

use App\Models\Passkey;
use App\Models\User;
use App\Services\PasskeyService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Route + persistence smoke tests. WebAuthn signature verification is exercised
 * through web-auth/webauthn-lib's own unit tests; here we assert that our
 * controllers hook up the ceremony correctly and gate access properly.
 */
class PasskeyTest extends TestCase
{
    use RefreshDatabase;

    public function test_options_endpoint_requires_auth(): void
    {
        $this->post(route('passkeys.options'))->assertRedirect(route('login'));
    }

    public function test_options_endpoint_returns_creation_options(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->postJson(route('passkeys.options'));

        $response->assertOk();
        $body = $response->json();
        $this->assertArrayHasKey('rp', $body);
        $this->assertArrayHasKey('user', $body);
        $this->assertArrayHasKey('challenge', $body);
        $this->assertArrayHasKey('pubKeyCredParams', $body);
        $this->assertTrue(session()->has('passkey.register_options'));
    }

    public function test_register_without_pending_options_errors(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->post(route('passkeys.register'), [
            'name' => 'MacBook',
            'response' => ['id' => 'x', 'type' => 'public-key', 'rawId' => 'x', 'response' => []],
        ]);

        $response->assertSessionHasErrors('response');
    }

    public function test_destroy_only_deletes_the_owners_passkey(): void
    {
        [$owner, $other] = User::factory()->count(2)->create();
        $passkey = Passkey::create([
            'user_id' => $owner->id,
            'name' => 'Test',
            'credential_id' => 'raw-id',
            'public_key_credential_source' => '{}',
            'counter' => 0,
        ]);

        $this->actingAs($other)
            ->delete(route('passkeys.destroy', $passkey->id))
            ->assertForbidden();
        $this->assertDatabaseHas('passkeys', ['id' => $passkey->id]);

        $this->actingAs($owner)
            ->delete(route('passkeys.destroy', $passkey->id))
            ->assertRedirect();
        $this->assertDatabaseMissing('passkeys', ['id' => $passkey->id]);
    }

    public function test_login_options_endpoint_returns_request_options_even_for_unknown_email(): void
    {
        $response = $this->postJson(route('login.passkey.options'), [
            'email' => 'nobody@example.test',
        ]);

        $response->assertOk();
        $body = $response->json();
        $this->assertArrayHasKey('challenge', $body);
        $this->assertArrayHasKey('rpId', $body);
    }

    public function test_service_uses_the_app_url_host_as_rp_id(): void
    {
        config(['app.url' => 'https://najenga.example.test']);
        $service = new PasskeyService();

        $this->assertSame('najenga.example.test', $service->rpId());
    }
}
