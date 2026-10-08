<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Inertia\Testing\AssertableInertia;
use Laravel\Passkeys\Actions\StorePasskey;
use Laravel\Passkeys\Contracts\PasskeyUser;
use Laravel\Passkeys\Support\WebAuthn;
use Tests\TestCase;
use Webauthn\CredentialRecord;

class PasskeysTest extends TestCase
{
    use RefreshDatabase;

    private const SURFACE_CREDENTIAL = '{"type": "public-key", "aaguid": "9ddd1817-af5a-4672-a2b9-3e3dd95000a9", "counter": 0, "trustPath": [], "transports": [], "userHandle": "Mw", "backupStatus": false, "uvInitialized": true, "backupEligible": false, "attestationType": "none", "credentialPublicKey": "pQECAyYgASFYIBhQMjQrr6EmFaKv9BkYvYp7vAE9WUW8G8dMpG5IALDIIlggr0aFmyOlF2ZN7CtN4VhPaw7joYtTNnFYbAeDevVNgvI", "publicKeyCredentialId": "R80VHC0aDKPBKQXioHRchn8AOxWEmuNwfid71UE7V48"}';

    private const HP_CREDENTIAL = '{"type": "public-key", "aaguid": "d3452668-01fd-4c12-926c-83a4204853aa", "counter": 0, "trustPath": [], "transports": [], "userHandle": "Mw", "backupStatus": true, "uvInitialized": true, "backupEligible": true, "attestationType": "none", "credentialPublicKey": "pQECAyYgASFYIP0tu1tPsr_HIQ3d3ebDcTBLGBwWATf2jL8h_TSokP5FIlggVdxqAalT9KY3IhfIkJZ9Hp2TYj90TH2jmSKPPA4G9H8", "publicKeyCredentialId": "MadDZny9NobeYPQs7lcrIw"}';

    public function test_passkeys_table_uses_the_package_schema(): void
    {
        $this->assertTrue(Schema::hasColumns('passkeys', [
            'id', 'user_id', 'name', 'credential_id', 'credential', 'last_used_at',
        ]));
        $this->assertFalse(Schema::hasColumn('passkeys', 'public_key_credential_source'));
        $this->assertFalse(Schema::hasColumn('passkeys', 'counter'));
    }

    public function test_existing_passkey_rows_deserialize_with_webauthn_v5(): void
    {
        foreach ([self::SURFACE_CREDENTIAL, self::HP_CREDENTIAL] as $fixture) {
            $record = WebAuthn::fromJson($fixture, CredentialRecord::class);

            $this->assertSame('3', $record->userHandle);
            $this->assertSame(0, $record->counter);

            $source = json_decode($fixture, true, flags: JSON_THROW_ON_ERROR);
            $this->assertSame(
                $source['publicKeyCredentialId'],
                \ParagonIE\ConstantTime\Base64UrlSafe::encodeUnpadded($record->publicKeyCredentialId),
            );

            $this->assertEquals(
                $source,
                json_decode(WebAuthn::toJson($record), true, flags: JSON_THROW_ON_ERROR),
            );
        }
    }

    public function test_deserialized_credential_stores_through_the_package_model(): void
    {
        $user = User::factory()->create();
        $this->assertInstanceOf(PasskeyUser::class, $user);

        $record = WebAuthn::fromJson(self::SURFACE_CREDENTIAL, CredentialRecord::class);
        $passkey = app(StorePasskey::class)->createPasskey($user, 'SURFACE', $record);

        $this->assertDatabaseHas('passkeys', [
            'user_id' => $user->id,
            'name' => 'SURFACE',
            'credential_id' => 'R80VHC0aDKPBKQXioHRchn8AOxWEmuNwfid71UE7V48',
        ]);

        $stored = DB::table('passkeys')->where('id', $passkey->id)->first();
        $this->assertEquals(
            json_decode(self::SURFACE_CREDENTIAL, true, flags: JSON_THROW_ON_ERROR),
            json_decode($stored->credential, true, flags: JSON_THROW_ON_ERROR),
        );

        $this->assertTrue($user->fresh()->hasPasskeysEnabled());
        $this->assertNotEmpty($user->fresh()->getPasskeyUserHandle());
        $this->assertSame($user->email, $user->fresh()->getPasskeyUsername());
    }

    public function test_login_options_endpoint_issues_a_challenge_to_guests(): void
    {
        $response = $this->get(route('passkey.login-options'));

        $response->assertOk();
        $this->assertNotEmpty($response->json('options.challenge'));
        $this->assertNotNull(session('passkey.verification_options'));
    }

    public function test_login_options_endpoint_is_guest_only(): void
    {
        $this->actingAs(User::factory()->create())
            ->get(route('passkey.login-options'))
            ->assertRedirect('/dashboard');
    }

    public function test_login_with_a_malformed_credential_is_rejected(): void
    {
        $this->postJson(route('passkey.login'), [
            'credential' => [
                'id' => 'garbage',
                'rawId' => 'garbage',
                'type' => 'public-key',
                'response' => ['clientDataJSON' => 'garbage'],
            ],
        ])->assertStatus(422)->assertJsonValidationErrors(['credential']);
    }

    public function test_registration_options_require_authentication(): void
    {
        $this->get(route('passkey.registration-options'))->assertRedirect('/login');
        $this->delete(route('passkey.destroy', 1))->assertRedirect('/login');
    }

    public function test_registration_options_issue_a_challenge_to_authenticated_users(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->get(route('passkey.registration-options'));

        $response->assertOk();
        $this->assertNotEmpty($response->json('options.challenge'));
        $this->assertNotNull(session('passkey.registration_options'));
    }

    public function test_users_can_delete_their_own_passkeys(): void
    {
        $owner = User::factory()->create();
        $passkey = app(StorePasskey::class)->createPasskey(
            $owner,
            'SURFACE',
            WebAuthn::fromJson(self::SURFACE_CREDENTIAL, CredentialRecord::class),
        );

        $this->actingAs($owner)
            ->deleteJson(route('passkey.destroy', $passkey->id))
            ->assertOk();

        $this->assertDatabaseMissing('passkeys', ['id' => $passkey->id]);
    }

    public function test_users_cannot_delete_other_users_passkeys(): void
    {
        $owner = User::factory()->create();
        $intruder = User::factory()->create();
        $passkey = app(StorePasskey::class)->createPasskey(
            $owner,
            'SURFACE',
            WebAuthn::fromJson(self::SURFACE_CREDENTIAL, CredentialRecord::class),
        );

        $this->actingAs($intruder)
            ->delete(route('passkey.destroy', $passkey->id))
            ->assertForbidden();

        $this->assertDatabaseHas('passkeys', ['id' => $passkey->id]);
    }

    public function test_profile_passkeys_page_reports_registered_credentials(): void
    {
        $user = User::factory()->create();
        $passkey = app(StorePasskey::class)->createPasskey(
            $user,
            'SURFACE',
            WebAuthn::fromJson(self::SURFACE_CREDENTIAL, CredentialRecord::class),
        );

        $this->actingAs($user)
            ->get(route('profile.passkeys'))
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->component('Profile/Passkeys')
                ->has('passkeys', 1)
                ->where('passkeys.0.id', $passkey->id)
                ->where('passkeys.0.name', 'SURFACE'));

        $this->actingAs($user)
            ->get(route('profile.edit'))
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->where('passkeysCount', 1));
    }
}
