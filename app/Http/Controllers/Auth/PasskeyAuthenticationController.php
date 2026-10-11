<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Passkey;
use App\Models\User;
use App\Services\PasskeyService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Sign in with a passkey (WebAuthn assertion). Two-step JSON handshake:
 *   1. options()  → server returns request options + stashes them in session
 *   2. login()    → browser posts the assertion response; server validates
 *      the signature against the stored public key and logs the user in.
 *
 * A verified passkey with userVerification satisfies MFA on its own, so this
 * flow does not funnel through /two-factor-challenge even for 2FA-enabled
 * accounts.
 */
class PasskeyAuthenticationController extends Controller
{
    private const OPTIONS_ATTEMPTS = 10;
    private const LOGIN_ATTEMPTS = 6;
    private const WINDOW_SECONDS = 900;

    public function __construct(private readonly PasskeyService $passkeys)
    {
    }

    public function create(): Response
    {
        return Inertia::render('Auth/PasskeyLogin');
    }

    public function options(Request $request): JsonResponse
    {
        $data = $request->validate([
            'email' => ['required', 'string', 'email'],
        ]);

        $key = 'passkey:opts:'.Str::lower($data['email']).'|'.$request->ip();
        if (RateLimiter::tooManyAttempts($key, self::OPTIONS_ATTEMPTS)) {
            throw ValidationException::withMessages([
                'email' => trans('auth.throttle', [
                    'seconds' => RateLimiter::availableIn($key),
                    'minutes' => (int) ceil(RateLimiter::availableIn($key) / 60),
                ]),
            ]);
        }
        RateLimiter::hit($key, self::WINDOW_SECONDS);

        $user = User::where('email', $data['email'])->first();
        $userPasskeys = $user ? Passkey::where('user_id', $user->id)->get()->all() : [];

        // Always return options — even for unknown emails — so a probe can't
        // tell whether an account exists. When the list is empty, the browser
        // will simply not find a matching credential.
        $options = $this->passkeys->requestOptionsFor($userPasskeys);
        $json = $this->passkeys->serializeRequestOptions($options);
        $request->session()->put('passkey.login_options', $json);
        $request->session()->put('passkey.login_user_id', $user?->id);

        return response()->json($this->passkeys->optionsAsArray($json));
    }

    public function login(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'response' => ['required', 'array'],
        ]);

        $ipKey = 'passkey:login:'.$request->ip();
        if (RateLimiter::tooManyAttempts($ipKey, self::LOGIN_ATTEMPTS)) {
            throw ValidationException::withMessages([
                'response' => trans('auth.throttle', [
                    'seconds' => RateLimiter::availableIn($ipKey),
                    'minutes' => (int) ceil(RateLimiter::availableIn($ipKey) / 60),
                ]),
            ]);
        }

        $json = $request->session()->pull('passkey.login_options');
        $expectedUserId = $request->session()->pull('passkey.login_user_id');
        if (! $json) {
            RateLimiter::hit($ipKey, self::WINDOW_SECONDS);
            throw ValidationException::withMessages([
                'response' => __('Start the sign-in again.'),
            ]);
        }

        try {
            $options = $this->passkeys->deserializeRequestOptions($json);
            $passkey = $this->passkeys->verifyAssertion(
                $data['response'],
                $options,
                $expectedUserId ? (string) $expectedUserId : null,
            );
        } catch (\Throwable $e) {
            RateLimiter::hit($ipKey, self::WINDOW_SECONDS);
            throw ValidationException::withMessages([
                'response' => __('That passkey could not be verified.'),
            ]);
        }

        RateLimiter::clear($ipKey);
        Auth::login($passkey->user);
        $request->session()->regenerate();

        return redirect()->intended(route('dashboard', absolute: false));
    }
}
