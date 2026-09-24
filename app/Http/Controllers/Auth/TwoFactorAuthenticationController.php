<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Services\TwoFactorAuthenticator;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

/**
 * Enable/confirm/disable TOTP for the signed-in user. The setup uses a
 * two-step handshake: /enable stashes a candidate secret in the session,
 * the UI shows the QR, and /confirm turns 2FA on only after the user
 * types a valid code from their authenticator — proving they scanned the
 * QR before they get locked out of their own account.
 */
class TwoFactorAuthenticationController extends Controller
{
    public function __construct(private readonly TwoFactorAuthenticator $totp)
    {
    }

    public function enable(Request $request): RedirectResponse
    {
        $secret = $this->totp->generateSecret();
        $request->session()->put('two_factor_pending_secret', $secret);

        return back();
    }

    public function confirm(Request $request): RedirectResponse
    {
        $request->validate([
            'code' => ['required', 'string'],
        ]);

        $secret = $request->session()->get('two_factor_pending_secret');
        if (! $secret) {
            throw ValidationException::withMessages([
                'code' => __('Start the setup again — the pending secret has expired.'),
            ]);
        }

        if (! $this->totp->verify($secret, $request->string('code'))) {
            throw ValidationException::withMessages([
                'code' => __('The provided two-factor authentication code was invalid.'),
            ]);
        }

        $user = $request->user();
        $user->forceFill([
            'two_factor_secret' => $secret,
            'two_factor_recovery_codes' => json_encode($this->totp->generateRecoveryCodes()),
            'two_factor_confirmed_at' => now(),
        ])->save();

        $request->session()->forget('two_factor_pending_secret');

        return back();
    }

    public function destroy(Request $request): RedirectResponse
    {
        $request->user()->forceFill([
            'two_factor_secret' => null,
            'two_factor_recovery_codes' => null,
            'two_factor_confirmed_at' => null,
        ])->save();

        $request->session()->forget('two_factor_pending_secret');

        return back();
    }
}
