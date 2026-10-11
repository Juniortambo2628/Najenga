<?php

namespace App\Services;

use App\Models\WhatsAppLog;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class WhatsAppMessageService
{
    /**
     * Send a WhatsApp text message via the Meta Cloud API.
     *
     * Returns true only when Meta accepted the message.
     */
    public function send(?string $to, string $text): bool
    {
        try {
            $phoneNumberId = config('services.meta.whatsapp_phone_number_id');
            $accessToken = config('services.meta.whatsapp_access_token');

            if (!$phoneNumberId || !$accessToken) {
                Log::warning('WhatsApp credentials not configured');
                return false;
            }

            // Normalize phone number. A null/empty phone (users matched via
            // whatsapp_wa_id have no requirement to fill in phone) must skip
            // the send: the previous `string $to` signature turned that into
            // an uncaught TypeError that 500'd the webhook.
            $digits = preg_replace('/[^\d]/', '', (string) $to);
            if ($digits === '') {
                Log::info('WhatsApp message skipped: recipient has no usable phone number');
                return false;
            }

            $to = '+' . $digits;

            $response = Http::withToken($accessToken)
                ->post("https://graph.facebook.com/v18.0/{$phoneNumberId}/messages", [
                    'messaging_product' => 'whatsapp',
                    'to' => $to,
                    'type' => 'text',
                    'text' => ['body' => $text],
                ]);

            if ($response->failed()) {
                Log::error('Failed to send WhatsApp message: ' . $response->body());

                WhatsAppLog::create([
                    'phone_number' => $to,
                    'message' => $text,
                    'direction' => 'outbound',
                    'status' => 'failed',
                    'error_message' => $response->body(),
                    'timestamp' => now(),
                ]);

                return false;
            }

            WhatsAppLog::create([
                'phone_number' => $to,
                'message' => $text,
                'direction' => 'outbound',
                'status' => 'sent',
                'timestamp' => now(),
            ]);

            return true;
        } catch (\Exception $e) {
            Log::error('Failed to send WhatsApp message: ' . $e->getMessage());

            return false;
        }
    }
}
