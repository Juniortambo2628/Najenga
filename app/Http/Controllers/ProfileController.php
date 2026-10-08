<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
use App\Http\Requests\ToggleLoginNotificationsRequest;
use App\Http\Requests\VerifyWhatsAppCodeRequest;
use App\Services\WhatsAppMessageService;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * Display the user's profile form.
     */
    public function edit(Request $request): Response
    {
        $user = $request->user();
        $digits = preg_replace('/[^\d]/', '', (string) ($user->whatsapp_wa_id ?? $user->phone));

        return Inertia::render('Profile/Edit', [
            'mustVerifyEmail' => $user instanceof MustVerifyEmail,
            'status' => session('status'),
            'passkeysCount' => $user->passkeys()->count(),
            'whatsapp' => [
                'phone' => $digits !== '' ? '+' . $digits : null,
                'verified' => ! is_null($user->whatsapp_verified_at),
            ],
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
     * Toggle login notifications for the authenticated user.
     */
    public function toggleLoginNotifications(ToggleLoginNotificationsRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        $request->user()->forceFill([
            'login_notifications_enabled' => $validated['enabled'],
        ])->save();

        return back()->with('success', 'Login notification preference updated.');
    }

    /**
     * Display the two-factor authentication management page.
     */
    public function twoFactor(Request $request): Response
    {
        $user = $request->user();

        return Inertia::render('Profile/TwoFactor', [
            'enabled' => ! is_null($user->two_factor_confirmed_at),
            'pending' => ! is_null($user->two_factor_secret) && is_null($user->two_factor_confirmed_at),
        ]);
    }

    /**
     * Display the passkey management page.
     */
    public function passkeys(Request $request): Response
    {
        return Inertia::render('Profile/Passkeys', [
            'passkeys' => $request->user()
                ->passkeys()
                ->orderByDesc('created_at')
                ->get()
                ->map(fn ($passkey) => [
                    'id' => $passkey->id,
                    'name' => $passkey->name,
                    'created_at' => $passkey->created_at?->format('M j, Y'),
                    'last_used_at' => $passkey->last_used_at?->format('M j, Y'),
                ]),
        ]);
    }

    /**
     * Send a WhatsApp verification code to the user's number.
     */
    public function sendWhatsAppCode(Request $request, WhatsAppMessageService $whatsapp): RedirectResponse
    {
        $user = $request->user();
        $digits = preg_replace('/[^\d]/', '', (string) ($user->whatsapp_wa_id ?? $user->phone));

        if ($digits === '') {
            return back()->withErrors([
                'whatsapp' => 'Add a phone number to your profile before verifying WhatsApp.',
            ]);
        }

        $code = (string) random_int(100000, 999999);

        $sent = $whatsapp->send(
            '+' . $digits,
            "Your Najenga verification code is {$code}. It expires in 10 minutes."
        );

        if (! $sent) {
            return back()->withErrors([
                'whatsapp' => 'The verification code could not be sent. Check the WhatsApp configuration.',
            ]);
        }

        Cache::put("whatsapp.verify.{$user->id}", [
            'code' => hash('sha256', $code),
            'digits' => $digits,
            'expires_at' => now()->addMinutes(10),
        ], now()->addMinutes(15));

        return back()->with('status', 'whatsapp-code-sent');
    }

    /**
     * Verify the WhatsApp code the user pasted from the message.
     */
    public function verifyWhatsAppCode(VerifyWhatsAppCodeRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        $key = "whatsapp.verify.{$request->user()->id}";
        $payload = Cache::get($key);

        if (! $payload || $payload['expires_at']->isPast()) {
            Cache::forget($key);

            return back()->withErrors([
                'code' => 'The verification code has expired. Request a new one.',
            ]);
        }

        if (! hash_equals($payload['code'], hash('sha256', $validated['code']))) {
            return back()->withErrors([
                'code' => 'The verification code is incorrect.',
            ]);
        }

        Cache::forget($key);

        $request->user()->fill(['whatsapp_verified_at' => now()])->save();

        return back()->with('status', 'whatsapp-verified');
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
