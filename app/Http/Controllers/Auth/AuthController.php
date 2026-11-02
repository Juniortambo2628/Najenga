<?php

namespace App\Http\Controllers\Auth;

use App\Services\ProjectInvitations;
use App\Http\Page;
use App\Models\ProjectInvitation;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rules;
use Okjt\Kit\Http\Controllers\AuthController as KitAuthController;

/**
 * Signing in, up and out, on the kit's auth API (okjt.auth.mode 'session'),
 * with Najenga's sign-up fields, and the sign-in pages themselves.
 */
class AuthController extends KitAuthController
{
    use SignsInToNajenga;

    // ---- The pages ----------------------------------------------------------

    public function loginPage(Request $request): Page
    {
        return Page::render('Auth/Login', [
            'status' => session('status'),
        ]);
    }

    public function registerPage(Request $request): Page
    {
        // Arriving from a project invitation: suggest the invited address.
        $pending = $request->session()->get(ProjectInvitations::SESSION_KEY);
        $invitation = $pending ? ProjectInvitation::with('project:id,name')->find($pending['id']) : null;

        return Page::render('Auth/Register', [
            'email' => $invitation?->email ?? $request->query('email'),
            'joiningProject' => $invitation?->project?->name,
        ]);
    }

    public function forgotPasswordPage(): Page
    {
        return Page::render('Auth/ForgotPassword');
    }

    public function resetPasswordPage(Request $request, string $token): Page
    {
        return Page::render('Auth/ResetPassword', [
            'token' => $token,
            'email' => $request->query('email'),
        ]);
    }

    public function confirmPasswordPage(): Page
    {
        return Page::render('Auth/ConfirmPassword');
    }

    /** Signing out from a page (the account menu): back to the home page. */
    public function signOut(Request $request): RedirectResponse
    {
        $this->logout($request);

        return redirect('/');
    }

    // ---- Sign-up ------------------------------------------------------------

    protected function baseRegistrationRules(): array
    {
        return [
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'username' => 'required|string|max:50|unique:'.User::class,
            'email' => 'required|string|lowercase|email|max:255|unique:'.User::class,
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ];
    }

    protected function newUserAttributes(array $validated): array
    {
        return [
            'first_name' => $validated['first_name'],
            'last_name' => $validated['last_name'],
            'username' => $validated['username'],
            'email' => $validated['email'],
            'password' => $validated['password'],
        ];
    }

    /** New people are signed straight in (joining any project they were invited to), as before. */
    protected function registered(Model $user, array $validated): array
    {
        Auth::guard('web')->login($user);
        request()->session()->regenerate();

        return ['redirect' => request()->session()->pull('url.intended', route('dashboard', absolute: false))];
    }
}
