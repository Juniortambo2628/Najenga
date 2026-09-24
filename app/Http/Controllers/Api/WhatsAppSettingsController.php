<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\WhatsAppLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Inertia\Inertia;

class WhatsAppSettingsController extends Controller
{
    public function index()
    {
        $mask = fn (?string $v) => $v ? substr($v, 0, 4) . str_repeat('*', max(0, strlen($v) - 8)) . substr($v, -4) : null;

        return Inertia::render('WhatsApp/Settings', [
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
                return response()->json([
                    'ok' => false,
                    'error' => $response->json('error.message') ?? 'Send failed',
                    'raw' => $response->json(),
                ], 502);
            }

            // Log the outbound row so the delivery-status webhook can update
            // it, and so it shows up on the WhatsApp activity page.
            $wamid = $response->json('messages.0.id');
            if ($wamid) {
                WhatsAppLog::create([
                    'phone_number' => $to,
                    'message' => $data['message'],
                    'direction' => 'outbound',
                    'status' => 'sent',
                    'message_id' => $wamid,
                    'timestamp' => now(),
                ]);
            }

            // Meta's API returning "ok" only means the message was accepted
            // for delivery, not that WhatsApp actually delivered it. In test
            // mode Meta silently drops messages to numbers not on the app's
            // test recipient list. Be honest about that.
            $testMode = (bool) config('services.meta.test_mode', true);
            $note = $testMode
                ? 'Accepted by Meta. In test mode, WhatsApp only delivers to numbers on your Meta app\'s test recipient list. Check the WhatsApp activity page for the actual delivery status.'
                : 'Accepted by Meta. Watch the WhatsApp activity page for delivery status callbacks.';

            return response()->json([
                'ok' => true,
                'note' => $note,
                'wamid' => $wamid,
                'response' => $response->json(),
            ]);
        } catch (\Throwable $e) {
            Log::error('WhatsApp test send exception: ' . $e->getMessage());
            return response()->json(['ok' => false, 'error' => $e->getMessage()], 500);
        }
    }
}
