<?php

use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Auth\LoginCodeController;
use Okjt\Kit\Http\Controllers\ConfirmPasswordController;
use Okjt\Kit\Http\Controllers\EmailVerificationController;
use Okjt\Kit\Http\Controllers\PasswordResetController;
use Okjt\Kit\Http\Controllers\TwoFactorController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Every URL that starts with /api/ is registered here, so the file a route
| lives in matches the prefix it is served under. routes/web.php keeps the
| Inertia HTML page flow.
|
| Two kinds of endpoint:
|
|   1. Public webhooks - no session, called by Telegram and Meta.
|
|   2. Session-authenticated JSON for the logged-in frontend. These must
|      opt into the `web` middleware group: routes/api.php is registered
|      with the `api` group, which has no StartSession, and the web guard
|      cannot resolve a user from a session that was never started.
|
*/

// Whether someone is signed in, for the kit app's public pages (frontend/).
Route::middleware('web')->get('/session', fn () => ['signed_in' => auth()->check()])->name('api.session');

// Telegram Webhook (Public, no auth)
Route::post('/telegram/webhook', [\App\Http\Controllers\TelegramController::class, 'handleWebhook']);

// Meta WhatsApp Cloud API Webhook (Public, no auth)
Route::get('/whatsapp/webhook', [\App\Http\Controllers\WhatsAppController::class, 'verifyWebhook']);
Route::post('/whatsapp/webhook', [\App\Http\Controllers\WhatsAppController::class, 'handleWebhook']);

// Signing in, on the OKJT kit's auth API (okjt.auth.mode 'session': the
// session cookie). The sign-in pages (resources/js/Pages/Auth) call these.
Route::middleware('web')->group(function () {
    Route::post('/login', [AuthController::class, 'login'])->name('api.login');
    Route::post('/verify-2fa', [AuthController::class, 'verify2fa'])->name('api.verify-2fa');
    Route::post('/register', [AuthController::class, 'register'])->middleware('throttle:6,1')->name('api.register');
    Route::post('/login-code', [LoginCodeController::class, 'request'])->middleware('throttle:3,1')->name('api.login-code');
    Route::post('/login-code/verify', [LoginCodeController::class, 'verify'])->middleware('throttle:6,1')->name('api.login-code.verify');
    Route::post('/forgot-password', [PasswordResetController::class, 'forgot'])->middleware('throttle:6,1')->name('api.forgot-password');
    Route::post('/reset-password', [PasswordResetController::class, 'reset'])->middleware('throttle:6,1')->name('api.reset-password');
    Route::post('/email/resend', [EmailVerificationController::class, 'resend'])->middleware('throttle:6,1')->name('api.email.resend');

    Route::middleware('auth')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout'])->name('api.logout');
        Route::get('/user', [AuthController::class, 'user'])->name('api.user');
        Route::post('/confirm-password', [ConfirmPasswordController::class, 'confirm'])->middleware('throttle:6,1')->name('api.confirm-password');
        Route::get('/confirmed-password-status', [ConfirmPasswordController::class, 'status'])->name('api.confirmed-password-status');

        Route::post('/2fa/setup', [TwoFactorController::class, 'setup'])->name('api.2fa.setup');
        Route::post('/2fa/confirm', [TwoFactorController::class, 'confirm'])->middleware('throttle:6,1')->name('api.2fa.confirm');
        Route::post('/2fa/disable', [TwoFactorController::class, 'disable'])->name('api.2fa.disable');
        Route::get('/2fa/recovery-codes', [TwoFactorController::class, 'recoveryCodes'])->name('api.2fa.recovery-codes');
        Route::post('/2fa/recovery-codes', [TwoFactorController::class, 'regenerateRecoveryCodes'])->name('api.2fa.regenerate-recovery-codes');
    });
});

// Activity logs API (JSON, session auth)
Route::middleware(['web', 'auth'])->group(function () {
    Route::get('/activity-logs', [\App\Http\Controllers\ActivityLogController::class, 'index']);
});

// JSON endpoints the Inertia frontend fetches. `verified` mirrors the
// middleware these routes carried while they lived in routes/web.php.
Route::middleware(['web', 'auth', 'verified'])->group(function () {
    Route::get('/search/live', [\App\Http\Controllers\SearchController::class, 'live'])->name('search.live');
});
