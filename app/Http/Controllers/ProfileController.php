<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
use App\Services\TwoFactorAuthenticator;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * Display the user's profile form.
     */
    public function edit(Request $request, TwoFactorAuthenticator $totp): Response
    {
        $user = $request->user();

        $twoFactor = [
            'enabled' => $user->hasEnabledTwoFactorAuthentication(),
            'recovery_codes' => $user->hasEnabledTwoFactorAuthentication()
                ? $user->recoveryCodesArray()
                : [],
        ];

        // Setup handshake in progress: show the QR + confirmation input.
        if ($pending = $request->session()->get('two_factor_pending_secret')) {
            $otpauth = $totp->otpauthUrl($user, $pending);
            $twoFactor['pending'] = [
                'secret' => $pending,
                'otpauth_url' => $otpauth,
                'qr_svg' => $totp->qrCodeSvg($otpauth),
            ];
        }

        return Inertia::render('Profile/Edit', [
            'mustVerifyEmail' => $user instanceof MustVerifyEmail,
            'status' => session('status'),
            'whatsapp' => [
                'wa_id' => $user->whatsapp_wa_id,
                'verified_at' => $user->whatsapp_verified_at?->toIso8601String(),
                'configured' => (bool) config('services.meta.whatsapp_access_token')
                    && (bool) config('services.meta.whatsapp_phone_number_id'),
            ],
            'twoFactor' => $twoFactor,
        ]);
    }

    /**
     * Update the user's profile information.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $request->user()->fill($request->validated());

        if ($request->user()->isDirty('email')) {
            $request->user()->email_verified_at = null;
        }

        $request->user()->save();

        return Redirect::route('profile.edit');
    }

    /**
     * Delete the user's account.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return Redirect::to('/');
    }
}
