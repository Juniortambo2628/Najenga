<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Expense;
use App\Models\WhatsAppContact;
use App\Models\WhatsAppLog;
use App\Models\WhatsAppWebhookEvent;
use App\Jobs\ProcessWhatsAppMedia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class WhatsAppController extends Controller
{

    /**
     * Handle GET request for Meta webhook verification.
     * Meta sends this once when you configure the webhook in Business Suite.
     */
    public function verifyWebhook(Request $request)
    {
        // Meta sends the query params as `hub.mode`, `hub.verify_token`,
        // `hub.challenge`. PHP silently rewrites `.` to `_` in $_GET keys, and
        // Laravel's $request->query('a.b') is a nested-array accessor, not a
        // literal key lookup. Go through the ParameterBag with the underscored
        // key (with a fall-through in case a future runtime keeps the dots).
        $mode = $request->query->get('hub_mode', $request->query('hub.mode'));
        $token = $request->query->get('hub_verify_token', $request->query('hub.verify_token'));
        $challenge = $request->query->get('hub_challenge', $request->query('hub.challenge'));

        if ($mode === 'subscribe' && hash_equals((string) config('services.meta.whatsapp_verify_token'), (string) $token)) {
            Log::info('WhatsApp webhook verified successfully');
            return response($challenge, 200)->header('Content-Type', 'text/plain');
        }

        Log::warning('WhatsApp webhook verification failed', [
            'mode' => $mode,
            'token_present' => $token !== null,
            'token_len' => is_string($token) ? strlen($token) : null,
            'expected_len' => strlen((string) config('services.meta.whatsapp_verify_token')),
        ]);
        return response('Forbidden', 403);
    }

    /**
     * Handle incoming WhatsApp messages from Meta Cloud API.
     */
    public function handleWebhook(Request $request)
    {
        // Log the raw webhook event
        WhatsAppWebhookEvent::create([
            'payload' => $request->all(),
            'signature' => $request->header('x-hub-signature-256'),
        ]);

        // Verify signature if app secret is configured
        if (config('services.meta.whatsapp_app_secret')) {
            if (!$this->verifySignature($request)) {
                Log::warning('WhatsApp webhook signature verification failed');
                return response('Invalid signature', 401);
            }
        }

        // Meta sends a GET for verification and POST for messages
        if ($request->method() !== 'POST') {
            return response('OK', 200);
        }

        try {
            $payload = $request->all();

            // Validate this is a WhatsApp message event
            if (($payload['object'] ?? '') !== 'whatsapp_business_account') {
                return response('OK', 200);
            }

            $entry = $payload['entry'][0] ?? null;
            $changes = $entry['changes'][0] ?? null;
            $value = $changes['value'] ?? null;

            if (!$value) {
                return response('OK', 200);
            }

            $messages = $value['messages'] ?? [];
            $contacts = $value['contacts'] ?? [];

            foreach ($messages as $message) {
                $this->processMessage($message, $contacts, $value['metadata'] ?? []);
            }

            return response('OK', 200);
        } catch (\Exception $e) {
            Log::error('WhatsApp webhook processing error: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);
            return response('OK', 200); // Return 200 to prevent Meta retries for app errors
        }
    }

    /**
     * Process a single incoming WhatsApp message.
     */
    private function processMessage(array $message, array $contacts, array $metadata): void
    {
        $from = $message['from'] ?? null;
        $messageId = $message['id'] ?? null;
        $type = $message['type'] ?? null;

        if (!$from || !$messageId) {
            return;
        }

        // Find user by phone number
        $user = $this->findUserByPhone($from);

        if (!$user) {
            Log::info('WhatsApp message from unknown number: ' . $from);
            return;
        }

        // Log the inbound message
        WhatsAppLog::create([
            'user_id' => $user->id,
            'phone_number' => $from,
            'message' => $message['text']['body'] ?? ($type === 'image' ? '[Image]' : '[' . ucfirst($type) . ']'),
            'direction' => 'inbound',
            'status' => 'received',
            'message_id' => $messageId,
            'timestamp' => isset($message['timestamp']) ? date('Y-m-d H:i:s', (int) $message['timestamp']) : now(),
        ]);

        // Route every inbound message through the classifier job.
        ProcessWhatsAppMedia::dispatch($this->buildJobPayload($message, $type), $user->id);
    }

    private function buildJobPayload(array $message, ?string $type): array
    {
        $payload = ['media_type' => $type ?: 'text'];

        switch ($type) {
            case 'text':
                $payload['text'] = $message['text']['body'] ?? '';
                break;
            case 'image':
                $payload['media_id'] = $message['image']['id'] ?? null;
                $payload['mime'] = $message['image']['mime_type'] ?? 'image/jpeg';
                $payload['caption'] = $message['image']['caption'] ?? '';
                break;
            case 'video':
                $payload['media_id'] = $message['video']['id'] ?? null;
                $payload['mime'] = $message['video']['mime_type'] ?? 'video/mp4';
                $payload['caption'] = $message['video']['caption'] ?? '';
                break;
            case 'document':
                $payload['media_id'] = $message['document']['id'] ?? null;
                $payload['mime'] = $message['document']['mime_type'] ?? null;
                $payload['caption'] = $message['document']['caption'] ?? '';
                break;
        }

        return $payload;
    }

    /**
     * Find a user by their phone number (E.164 format) or WhatsApp wa_id.
     */
    private function findUserByPhone(string $phone): ?User
    {
        // Normalize: remove any non-digit characters except leading +
        $normalized = preg_replace('/[^\d+]/', '', $phone);
        $digits = ltrim($normalized, '+');

        // Try WhatsApp wa_id first (most reliable for Meta Cloud API)
        $user = User::where('whatsapp_wa_id', $digits)->first();

        if (!$user) {
            // Try exact phone match
            $user = User::where('phone', $normalized)->first();
        }

        if (!$user) {
            // Try without leading +
            $user = User::where('phone', $digits)->first();
        }

        if (!$user) {
            // Try WhatsApp contacts table
            $contact = WhatsAppContact::where('phone_number', $normalized)
                ->orWhere('phone_number', $digits)
                ->first();

            if ($contact) {
                $user = $contact->user;
            }
        }

        return $user;
    }

    /**
     * Send a WhatsApp message via Meta Cloud API.
     */
    private function sendWhatsAppMessage(string $to, string $text): void
    {
        try {
            $phoneNumberId = config('services.meta.whatsapp_phone_number_id');
            $accessToken = config('services.meta.whatsapp_access_token');

            if (!$phoneNumberId || !$accessToken) {
                Log::warning('WhatsApp credentials not configured');
                return;
            }

            // Normalize phone number
            $to = preg_replace('/[^\d]/', '', $to);
            if (substr($to, 0, 1) !== '+') {
                $to = '+' . $to;
            }

            Http::withToken($accessToken)
                ->post("https://graph.facebook.com/v18.0/{$phoneNumberId}/messages", [
                    'messaging_product' => 'whatsapp',
                    'to' => $to,
                    'type' => 'text',
                    'text' => ['body' => $text],
                ]);

            // Log outbound message
            WhatsAppLog::create([
                'phone_number' => $to,
                'message' => $text,
                'direction' => 'outbound',
                'status' => 'sent',
                'timestamp' => now(),
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to send WhatsApp message: ' . $e->getMessage());
        }
    }

    /**
     * Verify the x-hub-signature-256 header from Meta.
     */
    private function verifySignature(Request $request): bool
    {
        $signature = $request->header('x-hub-signature-256');

        if (!$signature) {
            return false;
        }

        $expectedHash = 'sha256=' . hash_hmac(
            'sha256',
            $request->getContent(),
            config('services.meta.whatsapp_app_secret')
        );

        return hash_equals($expectedHash, $signature);
    }
}
