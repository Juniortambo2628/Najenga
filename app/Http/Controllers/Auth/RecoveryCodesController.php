<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Services\TwoFactorAuthenticator;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class RecoveryCodesController extends Controller
{
    public function __construct(private readonly TwoFactorAuthenticator $totp)
    {
    }

    public function regenerate(Request $request): RedirectResponse
    {
        $user = $request->user();
        if (! $user->hasEnabledTwoFactorAuthentication()) {
            return back();
        }

        $user->forceFill([
            'two_factor_recovery_codes' => json_encode($this->totp->generateRecoveryCodes()),
        ])->save();

        return back();
    }
}
