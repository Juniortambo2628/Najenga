<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\TwoFactorAuthenticator;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

/**
 * The bridge between "password accepted" and "session logged in" for users
 * with 2FA enabled. AuthenticatedSessionController stashes the pending user
 * id in the session and redirects here; this controller verifies a TOTP or
 * recovery code and only then calls Auth::login.
 */
class TwoFactorChallengeController extends Controller
{
    public function __construct(private readonly TwoFactorAuthenticator $totp)
    {
    }

    public function create(Request $request): Response|RedirectResponse
    {
        if (! $request->session()->has('login.id')) {
            return redirect()->route('login');
        }

        return Inertia::render('Auth/TwoFactorChallenge');
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'code' => ['nullable', 'string'],
            'recovery_code' => ['nullable', 'string'],
        ]);

        $id = $request->session()->get('login.id');
        $remember = (bool) $request->session()->get('login.remember', false);
        $user = $id ? User::find($id) : null;

        if (! $user || ! $user->hasEnabledTwoFactorAuthentication()) {
            $request->session()->forget(['login.id', 'login.remember']);

            return redirect()->route('login');
        }

        if (! empty($data['code'])) {
            if (! $this->totp->verify($user->two_factor_secret, $data['code'])) {
                throw ValidationException::withMessages([
                    'code' => __('The provided two-factor authentication code was invalid.'),
                ]);
            }
        } elseif (! empty($data['recovery_code'])) {
            $remaining = $this->totp->useRecoveryCode($user->recoveryCodesArray(), $data['recovery_code']);
            if ($remaining === null) {
                throw ValidationException::withMessages([
                    'recovery_code' => __('The provided recovery code was invalid.'),
                ]);
            }

            $user->forceFill([
                'two_factor_recovery_codes' => json_encode($remaining),
            ])->save();
        } else {
            throw ValidationException::withMessages([
                'code' => __('Enter a one-time code or a recovery code.'),
            ]);
        }

        Auth::login($user, $remember);
        $request->session()->regenerate();
        $request->session()->forget(['login.id', 'login.remember']);

        return redirect()->intended(route('dashboard', absolute: false));
    }
}
