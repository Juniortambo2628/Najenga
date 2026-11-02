<?php

use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Auth\EmailVerificationNotificationController;
use App\Http\Controllers\Auth\EmailVerificationPromptController;
use App\Http\Controllers\Auth\PasswordController;
use App\Http\Controllers\Auth\VerifyEmailController;
use Illuminate\Support\Facades\Route;

/*
 * Signing in, on the OKJT kit's auth API (okjt.auth.mode 'session': the
 * session cookie, as ever). The pages are Najenga's (resources/js/Pages/Auth,
 * built on the kit's sign-in pages); they talk to /api/… (routes/api.php). Passkeys are
 * laravel/passkeys' own routes (config/passkeys.php).
 */

// ---- The pages --------------------------------------------------------------

Route::middleware('guest')->group(function () {
    Route::get('login', [AuthController::class, 'loginPage'])->name('login');
    Route::get('register', [AuthController::class, 'registerPage'])->name('register');
    Route::get('forgot-password', [AuthController::class, 'forgotPasswordPage'])->name('password.request');
    Route::get('reset-password/{token}', [AuthController::class, 'resetPasswordPage'])->name('password.reset');
    // Old addresses: signing in with an emailed code or a passkey is on the sign-in page now.
    Route::redirect('login/code', '/login');
    Route::redirect('login/passkey', '/login');
});

Route::middleware('auth')->group(function () {
    Route::get('verify-email', EmailVerificationPromptController::class)
        ->name('verification.notice');

    Route::get('verify-email/{id}/{hash}', VerifyEmailController::class)
        ->middleware(['signed', 'throttle:6,1'])
        ->name('verification.verify');

    Route::post('email/verification-notification', [EmailVerificationNotificationController::class, 'store'])
        ->middleware('throttle:6,1')
        ->name('verification.send');

    Route::get('user/confirm-password', [AuthController::class, 'confirmPasswordPage'])->name('password.confirm');

    Route::put('password', [PasswordController::class, 'update'])->name('password.update');

    Route::post('logout', [AuthController::class, 'signOut'])->name('logout');
});

// The auth API the pages call (/api/login, /api/verify-2fa, …) is in routes/api.php.
