<?php

namespace App\Services;

use App\Models\Passkey;
use App\Models\User;
use Cose\Algorithm\Manager as AlgorithmManager;
use Cose\Algorithm\Signature\ECDSA\ES256;
use Cose\Algorithm\Signature\RSA\RS256;
use Illuminate\Support\Facades\URL;
use Symfony\Component\Serializer\SerializerInterface;
use Webauthn\AttestationStatement\AttestationStatementSupportManager;
use Webauthn\AttestationStatement\NoneAttestationStatementSupport;
use Webauthn\AuthenticatorAssertionResponse;
use Webauthn\AuthenticatorAssertionResponseValidator;
use Webauthn\AuthenticatorAttestationResponse;
use Webauthn\AuthenticatorAttestationResponseValidator;
use Webauthn\AuthenticatorSelectionCriteria;
use Webauthn\CeremonyStep\CeremonyStepManagerFactory;
use Webauthn\CredentialRecord;
use Webauthn\Denormalizer\WebauthnSerializerFactory;
use Webauthn\PublicKeyCredential;
use Webauthn\PublicKeyCredentialCreationOptions;
use Webauthn\PublicKeyCredentialDescriptor;
use Webauthn\PublicKeyCredentialParameters;
use Webauthn\PublicKeyCredentialRequestOptions;
use Webauthn\PublicKeyCredentialRpEntity;
use Webauthn\PublicKeyCredentialSource;
use Webauthn\PublicKeyCredentialUserEntity;

/**
 * All the WebAuthn plumbing in one place: serializer configuration, ceremony
 * managers, options generation, response validation, and Eloquent persistence
 * of CredentialRecords. Controllers only talk to this class.
 */
class PasskeyService
{
    private readonly SerializerInterface $serializer;
    private readonly AttestationStatementSupportManager $attestationSupport;
    private readonly AuthenticatorAttestationResponseValidator $attestationValidator;
    private readonly AuthenticatorAssertionResponseValidator $assertionValidator;

    public function __construct()
    {
        // Only pass NoneAttestationStatementSupport — we skip attestation
        // verification. Real passkeys (Windows Hello, Touch ID, security keys)
        // still work without attestation, and we get to avoid pulling in the
        // metadata-service infrastructure for every install.
        $this->attestationSupport = new AttestationStatementSupportManager();
        $this->attestationSupport->add(new NoneAttestationStatementSupport());

        $this->serializer = (new WebauthnSerializerFactory($this->attestationSupport))->create();

        $algorithmManager = AlgorithmManager::create()->add(ES256::create(), RS256::create());
        $factory = new CeremonyStepManagerFactory();
        $factory->setAlgorithmManager($algorithmManager);
        $factory->setAttestationStatementSupportManager($this->attestationSupport);
        $factory->setAllowedOrigins([$this->origin()]);

        $this->attestationValidator = new AuthenticatorAttestationResponseValidator(
            $factory->creationCeremony()
        );
        $this->assertionValidator = new AuthenticatorAssertionResponseValidator(
            $factory->requestCeremony()
        );
    }

    // -- Registration --------------------------------------------------------

    public function creationOptionsFor(User $user): PublicKeyCredentialCreationOptions
    {
        $exclude = Passkey::where('user_id', $user->id)
            ->get()
            ->map(fn (Passkey $p) => PublicKeyCredentialDescriptor::create(
                PublicKeyCredentialDescriptor::CREDENTIAL_TYPE_PUBLIC_KEY,
                $this->rawCredentialId($p),
            ))
            ->all();

        return PublicKeyCredentialCreationOptions::create(
            new PublicKeyCredentialRpEntity(config('app.name', 'Najenga'), $this->rpId()),
            new PublicKeyCredentialUserEntity(
                (string) $user->email,
                (string) $user->id,
                (string) ($user->name ?: $user->email),
            ),
            random_bytes(32),
            [
                PublicKeyCredentialParameters::create('public-key', -7),   // ES256
                PublicKeyCredentialParameters::create('public-key', -257), // RS256
            ],
            authenticatorSelection: AuthenticatorSelectionCriteria::create(
                userVerification: AuthenticatorSelectionCriteria::USER_VERIFICATION_REQUIREMENT_PREFERRED,
                residentKey: AuthenticatorSelectionCriteria::RESIDENT_KEY_REQUIREMENT_PREFERRED,
            ),
            attestation: PublicKeyCredentialCreationOptions::ATTESTATION_CONVEYANCE_PREFERENCE_NONE,
            excludeCredentials: $exclude,
        );
    }

    public function verifyAttestationAndSave(
        User $user,
        string $friendlyName,
        array $responseJson,
        PublicKeyCredentialCreationOptions $options,
    ): Passkey {
        /** @var PublicKeyCredential $credential */
        $credential = $this->serializer->denormalize($responseJson, PublicKeyCredential::class);
        if (! $credential->response instanceof AuthenticatorAttestationResponse) {
            throw new \InvalidArgumentException('Not an attestation response');
        }

        $record = $this->attestationValidator->check($credential->response, $options, $this->rpId());
        $source = PublicKeyCredentialSource::fromCredentialRecord($record);

        return Passkey::create([
            'user_id' => $user->id,
            'name' => $friendlyName,
            'credential_id' => $source->publicKeyCredentialId,
            'public_key_credential_source' => $this->serializer->serialize($source, 'json'),
            'counter' => $source->counter,
        ]);
    }

    // -- Assertion (login) ---------------------------------------------------

    /**
     * @param array<int, Passkey> $userPasskeys  can be [] for username-less flows
     */
    public function requestOptionsFor(array $userPasskeys): PublicKeyCredentialRequestOptions
    {
        $allow = collect($userPasskeys)
            ->map(fn (Passkey $p) => PublicKeyCredentialDescriptor::create(
                PublicKeyCredentialDescriptor::CREDENTIAL_TYPE_PUBLIC_KEY,
                $this->rawCredentialId($p),
            ))
            ->all();

        return PublicKeyCredentialRequestOptions::create(
            random_bytes(32),
            rpId: $this->rpId(),
            allowCredentials: $allow,
            userVerification: PublicKeyCredentialRequestOptions::USER_VERIFICATION_REQUIREMENT_PREFERRED,
        );
    }

    public function verifyAssertion(
        array $responseJson,
        PublicKeyCredentialRequestOptions $options,
        ?string $expectedUserHandle,
    ): Passkey {
        /** @var PublicKeyCredential $credential */
        $credential = $this->serializer->denormalize($responseJson, PublicKeyCredential::class);
        if (! $credential->response instanceof AuthenticatorAssertionResponse) {
            throw new \InvalidArgumentException('Not an assertion response');
        }

        $passkey = Passkey::query()->where('credential_id', $credential->rawId)->first();
        if (! $passkey) {
            throw new \RuntimeException('Unknown passkey');
        }

        /** @var CredentialRecord $stored */
        $stored = $this->serializer->deserialize(
            $passkey->public_key_credential_source,
            PublicKeyCredentialSource::class,
            'json',
        );

        $this->assertionValidator->check(
            $stored,
            $credential->response,
            $options,
            $this->rpId(),
            $expectedUserHandle,
        );

        // Save updated counter and last_used_at.
        $passkey->forceFill([
            'public_key_credential_source' => $this->serializer->serialize($stored, 'json'),
            'counter' => $stored->counter,
            'last_used_at' => now(),
        ])->save();

        return $passkey;
    }

    // -- Serialization pass-throughs so controllers can round-trip options ---

    public function serializeCreationOptions(PublicKeyCredentialCreationOptions $o): string
    {
        return $this->serializer->serialize($o, 'json');
    }

    public function deserializeCreationOptions(string $json): PublicKeyCredentialCreationOptions
    {
        return $this->serializer->deserialize($json, PublicKeyCredentialCreationOptions::class, 'json');
    }

    public function serializeRequestOptions(PublicKeyCredentialRequestOptions $o): string
    {
        return $this->serializer->serialize($o, 'json');
    }

    public function deserializeRequestOptions(string $json): PublicKeyCredentialRequestOptions
    {
        return $this->serializer->deserialize($json, PublicKeyCredentialRequestOptions::class, 'json');
    }

    public function optionsAsArray(string $json): array
    {
        return json_decode($json, true, flags: JSON_THROW_ON_ERROR);
    }

    // -- Helpers -------------------------------------------------------------

    /** Raw bytes stored in the DB column; may be binary. */
    private function rawCredentialId(Passkey $p): string
    {
        $value = $p->credential_id;
        return is_resource($value) ? stream_get_contents($value) : (string) $value;
    }

    public function rpId(): string
    {
        return parse_url((string) config('app.url'), PHP_URL_HOST) ?: 'localhost';
    }

    private function origin(): string
    {
        return rtrim((string) URL::to('/'), '/');
    }
}
