<?php

namespace App\Services;

use App\Models\User;
use BaconQrCode\Renderer\ImageRenderer;
use BaconQrCode\Renderer\Image\SvgImageBackEnd;
use BaconQrCode\Renderer\RendererStyle\RendererStyle;
use BaconQrCode\Writer;
use Illuminate\Support\Str;
use PragmaRX\Google2FA\Google2FA;

/**
 * Thin wrapper around Google2FA so controllers stay small and tests can fake
 * the pieces they need. Handles secret generation, TOTP verification, QR SVG
 * rendering, and recovery-code helpers.
 */
class TwoFactorAuthenticator
{
    public function __construct(private readonly Google2FA $google2fa)
    {
    }

    public function generateSecret(): string
    {
        return $this->google2fa->generateSecretKey();
    }

    public function verify(string $secret, string $code): bool
    {
        $code = preg_replace('/\s+/', '', $code);
        if (! preg_match('/^[0-9]{6}$/', $code ?? '')) {
            return false;
        }

        return (bool) $this->google2fa->verifyKey($secret, $code, 1);
    }

    public function otpauthUrl(User $user, string $secret): string
    {
        $issuer = config('app.name', 'Laravel');

        return $this->google2fa->getQRCodeUrl($issuer, $user->email, $secret);
    }

    public function qrCodeSvg(string $otpauthUrl, int $size = 220): string
    {
        $renderer = new ImageRenderer(new RendererStyle($size, 0), new SvgImageBackEnd());
        $writer = new Writer($renderer);

        return $writer->writeString($otpauthUrl);
    }

    /**
     * @return array<int, string>
     */
    public function generateRecoveryCodes(int $count = 8): array
    {
        return collect(range(1, $count))
            ->map(fn () => Str::lower(Str::random(5)).'-'.Str::lower(Str::random(5)))
            ->all();
    }

    /**
     * Return the codes minus the matching one (removed on use). Case-insensitive.
     *
     * @param  array<int, string>  $codes
     * @return array<int, string>|null  null when no match
     */
    public function useRecoveryCode(array $codes, string $submitted): ?array
    {
        $needle = Str::lower(trim($submitted));
        $filtered = array_values(array_filter($codes, fn ($c) => Str::lower($c) !== $needle));

        return count($filtered) === count($codes) ? null : $filtered;
    }
}
