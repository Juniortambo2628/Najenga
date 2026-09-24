<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\LoginCode;
use App\Models\User;
use App\Notifications\LoginCodeNotification;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Email-based one-time-code login. The flow is:
 *   1. User enters email → request() issues a 6-digit code, stores its hash,
 *      mails the plaintext code, and flashes a "check your email" state.
 *   2. User enters the code → verify() matches against the newest unused
 *      code for that email, marks it used, and logs in via the same 2FA-aware
 *      path as regular login.
 *
 * The mailed code is the ONLY plaintext copy — we never persist or log it.
 * Requests are throttled per email+IP, verification attempts per email+IP.
 */
class LoginCodeController extends Controller
{
    private const CODE_TTL_MINUTES = 10;
    private const REQUEST_ATTEMPTS = 3;
    private const REQUEST_WINDOW = 900;   // 15 min
    private const VERIFY_ATTEMPTS = 6;
    private const VERIFY_WINDOW = 900;

    public function create(Request $request): Response
    {
        return Inertia::render('Auth/LoginCode', [
            'email' => (string) $request->session()->get('login_code.email', ''),
            'awaitingCode' => (bool) $request->session()->get('login_code.awaiting', false),
        ]);
    }

    public function request(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'email' => ['required', 'string', 'email'],
        ]);

        $key = 'login-code:req:'.Str::lower($data['email']).'|'.$request->ip();
        if (RateLimiter::tooManyAttempts($key, self::REQUEST_ATTEMPTS)) {
            throw ValidationException::withMessages([
                'email' => trans('auth.throttle', [
                    'seconds' => RateLimiter::availableIn($key),
                    'minutes' => (int) ceil(RateLimiter::availableIn($key) / 60),
                ]),
            ]);
        }
        RateLimiter::hit($key, self::REQUEST_WINDOW);

        $user = User::where('email', $data['email'])->first();

        // Always flash "check your email" — never reveal whether the address
        // exists. The code is only actually sent to real users.
        if ($user) {
            $code = str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);
            LoginCode::create([
                'user_id' => $user->id,
                'code_hash' => Hash::make($code),
                'expires_at' => now()->addMinutes(self::CODE_TTL_MINUTES),
                'requested_ip' => $request->ip(),
            ]);
            $user->notify(new LoginCodeNotification($code, self::CODE_TTL_MINUTES));
        }

        return redirect()->route('login.code')->with([
            'login_code.email' => $data['email'],
            'login_code.awaiting' => true,
            'status' => 'If that email matches an account, a sign-in code is on its way.',
        ]);
    }

    public function verify(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'email' => ['required', 'string', 'email'],
            'code' => ['required', 'string'],
        ]);

        $submitted = preg_replace('/\s+/', '', $data['code']);
        $key = 'login-code:ver:'.Str::lower($data['email']).'|'.$request->ip();
        if (RateLimiter::tooManyAttempts($key, self::VERIFY_ATTEMPTS)) {
            throw ValidationException::withMessages([
                'code' => trans('auth.throttle', [
                    'seconds' => RateLimiter::availableIn($key),
                    'minutes' => (int) ceil(RateLimiter::availableIn($key) / 60),
                ]),
            ]);
        }

        $user = User::where('email', $data['email'])->first();
        $loginCode = $user
            ? LoginCode::where('user_id', $user->id)
                ->whereNull('used_at')
                ->latest('id')
                ->first()
            : null;

        if (! $user || ! $loginCode || ! $loginCode->isUsable() || ! Hash::check($submitted, $loginCode->code_hash)) {
            RateLimiter::hit($key, self::VERIFY_WINDOW);

            throw ValidationException::withMessages([
                'code' => __('That sign-in code is invalid or expired.'),
            ]);
        }

        RateLimiter::clear($key);
        $loginCode->forceFill(['used_at' => now()])->save();

        if ($user->hasEnabledTwoFactorAuthentication()) {
            $request->session()->put('login.id', $user->getKey());
            $request->session()->put('login.remember', false);
            $request->session()->forget(['login_code.email', 'login_code.awaiting']);

            return redirect()->route('two-factor.login');
        }

        Auth::login($user);
        $request->session()->regenerate();
        $request->session()->forget(['login_code.email', 'login_code.awaiting']);

        return redirect()->intended(route('dashboard', absolute: false));
    }
}
