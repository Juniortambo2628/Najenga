<?php

use Illuminate\Http\Request;
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

// Telegram Webhook (Public, no auth)
Route::post('/telegram/webhook', [\App\Http\Controllers\Api\TelegramController::class, 'handleWebhook']);

// Meta WhatsApp Cloud API Webhook (Public, no auth)
Route::get('/whatsapp/webhook', [\App\Http\Controllers\Api\WhatsAppController::class, 'verifyWebhook']);
Route::post('/whatsapp/webhook', [\App\Http\Controllers\Api\WhatsAppController::class, 'handleWebhook']);

// Authenticated user route (for Sanctum SPA if needed)
Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// Activity logs API (JSON, session auth)
Route::middleware(['web', 'auth'])->group(function () {
    Route::get('/activity-logs', [\App\Http\Controllers\Api\ActivityLogApiController::class, 'index']);
});

// JSON endpoints the Inertia frontend fetches. `verified` mirrors the
// middleware these routes carried while they lived in routes/web.php.
Route::middleware(['web', 'auth', 'verified'])->group(function () {
    Route::get('/search/live', [\App\Http\Controllers\SearchController::class, 'live'])->name('search.live');
    Route::get('/timeline/data', [\App\Http\Controllers\Api\ProjectTimelineController::class, 'timelineData'])->name('timeline.data');
    Route::get('/analytics', [\App\Http\Controllers\AnalyticsController::class, 'index'])->name('analytics.api');
});
