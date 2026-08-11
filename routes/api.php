<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| External API endpoints only. Inertia frontend uses web.php routes.
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
Route::middleware('auth')->group(function () {
    Route::get('/activity-logs', [\App\Http\Controllers\Api\ActivityLogApiController::class, 'index']);
});
