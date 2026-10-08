<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
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
    public function edit(Request $request): Response
    {
        return Inertia::render('Profile/Edit', [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => session('status'),
            'passkeysCount' => $request->user()->passkeys()->count(),
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
    public function toggleLoginNotifications(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'enabled' => 'required|boolean',
        ]);

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
