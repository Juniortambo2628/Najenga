<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class WhatsAppSettingsController extends Controller
{
    public function index()
    {
        $mask = fn (?string $v) => $v ? substr($v, 0, 4) . str_repeat('*', max(0, strlen($v) - 8)) . substr($v, -4) : null;

        return Inertia::render('WhatsApp', [
            'config' => [
                'app_id' => config('services.meta.whatsapp_app_id'),
                'app_secret_masked' => $mask(config('services.meta.whatsapp_app_secret')),
                'access_token_masked' => $mask(config('services.meta.whatsapp_access_token')),
                'phone_number_id' => config('services.meta.whatsapp_phone_number_id'),
                'verify_token_set' => (bool) config('services.meta.whatsapp_verify_token'),
                'webhook_url' => url('/api/whatsapp/webhook'),
                'configured' => (bool) config('services.meta.whatsapp_access_token')
                    && (bool) config('services.meta.whatsapp_phone_number_id'),
                'admin_wa_id' => config('services.meta.admin_wa_id'),
                'test_mode' => (bool) config('services.meta.test_mode', true),
            ],
        ]);
    }

    public function testSend(Request $request)
    {
        $data = $request->validate([
            'phone' => 'required|string',
            'message' => 'required|string|max:1000',
        ]);

        $phoneNumberId = config('services.meta.whatsapp_phone_number_id');
        $accessToken = config('services.meta.whatsapp_access_token');

        if (! $phoneNumberId || ! $accessToken) {
            return response()->json(['ok' => false, 'error' => 'WhatsApp not configured'], 422);
        }

        $to = preg_replace('/[^\d]/', '', $data['phone']);

        try {
            $response = Http::withToken($accessToken)->post(
                "https://graph.facebook.com/v18.0/{$phoneNumberId}/messages",
                ['messaging_product' => 'whatsapp', 'to' => $to, 'type' => 'text', 'text' => ['body' => $data['message']]]
            );

            if ($response->failed()) {
                Log::warning('WhatsApp test send failed', ['status' => $response->status(), 'body' => $response->body()]);
                return response()->json(['ok' => false, 'error' => $response->json('error.message') ?? 'Send failed', 'raw' => $response->json()], 502);
            }

            return response()->json(['ok' => true, 'response' => $response->json()]);
        } catch (\Throwable $e) {
            Log::error('WhatsApp test send exception: ' . $e->getMessage());
            return response()->json(['ok' => false, 'error' => $e->getMessage()], 500);
        }
    }
}
