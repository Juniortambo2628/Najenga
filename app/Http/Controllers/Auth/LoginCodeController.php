<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\RequestLoginCodeRequest;
use App\Http\Requests\VerifyLoginCodeRequest;
use App\Models\LoginCode;
use App\Models\User;
use App\Notifications\LoginCodeNotification;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class LoginCodeController extends Controller
{
    public function request(RequestLoginCodeRequest $request): RedirectResponse
    {
        $data = $request->validated();

        $user = User::where('email', $data['email'])->first();

        if ($user) {
            $plain = (string) random_int(100000, 999999);

            LoginCode::create([
                'user_id' => $user->id,
                'code_hash' => Hash::make($plain),
                'expires_at' => now()->addMinutes(10),
                'requested_ip' => $request->ip(),
            ]);

            $user->notify(new LoginCodeNotification($plain));
        }

        return back()->with('status', 'If that address exists, a sign-in code is on its way.');
    }

    public function verify(VerifyLoginCodeRequest $request): RedirectResponse
    {
        $data = $request->validated();

        $user = User::where('email', $data['email'])->first();

        $code = $user
            ? LoginCode::where('user_id', $user->id)
                ->whereNull('used_at')
                ->where('expires_at', '>', now())
                ->latest('id')
                ->first()
            : null;

        if (!$code || !Hash::check($data['code'], $code->code_hash)) {
            return back()->withErrors(['code' => 'That code is invalid or has expired.']);
        }

        $code->update(['used_at' => now()]);

        Auth::login($user);
        $request->session()->regenerate();

        return redirect()->intended(route('dashboard', absolute: false));
    }
}
