<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\WhatsAppContact;
use App\Models\WhatsAppLog;
use App\Models\WhatsAppWebhookEvent;
use App\Jobs\ProcessWhatsAppMedia;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class WhatsAppController extends Controller
{
    /** Order of Meta's delivery states; a status only ever moves forward. */
    private const STATUS_RANK = ['sent' => 1, 'delivered' => 2, 'read' => 3, 'failed' => 4];

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
     * Handle incoming WhatsApp messages and status callbacks from Meta Cloud API.
     */
    public function handleWebhook(Request $request)
    {
        // Authenticate before touching the database so unsigned traffic can't
        // fill the events table.
        if (! $this->verifySignature($request)) {
            Log::warning('WhatsApp webhook signature verification failed');
            return response('Invalid signature', 401);
        }

        $payload = $request->all();

        $event = WhatsAppWebhookEvent::create([
            'payload' => $payload,
            'signature' => $request->header('x-hub-signature-256'),
        ]);

        try {
            if (($payload['object'] ?? '') === 'whatsapp_business_account') {
                // Meta may batch several entries and changes into one delivery.
                foreach ($payload['entry'] ?? [] as $entry) {
                    foreach ($entry['changes'] ?? [] as $change) {
                        if (($change['field'] ?? 'messages') !== 'messages') {
                            continue;
                        }

                        $value = $change['value'] ?? [];

                        foreach ($value['statuses'] ?? [] as $status) {
                            $this->processStatus($status);
                        }

                        foreach ($value['messages'] ?? [] as $message) {
                            $this->processMessage($message);
                        }
                    }
                }
            }

            $event->update(['processed' => true]);
        } catch (\Throwable $e) {
            Log::error('WhatsApp webhook processing error: ' . $e->getMessage(), [
                'event_id' => $event->id,
                'trace' => $e->getTraceAsString(),
            ]);
            $event->update(['error_message' => Str::limit($e->getMessage(), 1000)]);
        }

        return response('OK', 200); // Return 200 to prevent Meta retries for app errors
    }

    /**
     * Process a single incoming WhatsApp message.
     */
    private function processMessage(array $message): void
    {
        $from = $message['from'] ?? null;
        $messageId = $message['id'] ?? null;
        $type = $message['type'] ?? null;

        if (!$from || !$messageId) {
            return;
        }

        // Find user by phone number. When no user matches we still log the
        // inbound row (user_id=null) so admins can see the message landed and
        // spot phone-format mismatches on the /whatsapp page — otherwise a
        // number that isn't linked yet just silently vanishes.
        $user = $this->findUserByPhone($from);

        if (!$user) {
            Log::info('WhatsApp message from unknown number: ' . $from);
        }

        // The unique index on message_id makes redelivered messages a no-op.
        try {
            WhatsAppLog::create([
                'user_id' => $user?->id,
                'phone_number' => $from,
                'message' => $message['text']['body']
                    ?? ($type === 'image' ? '[Image]' : '[' . ucfirst((string) $type) . ']')
                    . ($user ? '' : ' (unmatched sender)'),
                'direction' => 'inbound',
                'status' => 'received',
                'message_id' => $messageId,
                'timestamp' => isset($message['timestamp']) ? date('Y-m-d H:i:s', (int) $message['timestamp']) : now(),
            ]);
        } catch (UniqueConstraintViolationException) {
            Log::info('Duplicate WhatsApp message delivery ignored', ['message_id' => $messageId]);
            return;
        }

        if (!$user) {
            return;
        }

        // Route every inbound message from a known user through the classifier job.
        ProcessWhatsAppMedia::dispatch($this->buildJobPayload($message, $type), $user->id);
    }

    /**
     * Apply a delivery status callback (sent, delivered, read, failed) to the
     * outbound message it refers to.
     */
    private function processStatus(array $status): void
    {
        $messageId = $status['id'] ?? null;
        $state = $status['status'] ?? null;

        if (!$messageId || !isset(self::STATUS_RANK[$state])) {
            return;
        }

        $log = WhatsAppLog::where('message_id', $messageId)
            ->where('direction', 'outbound')
            ->first();

        if (!$log) {
            return;
        }

        if ($state === 'failed') {
            $error = $status['errors'][0] ?? [];
            $log->update([
                'status' => 'failed',
                'error_message' => Str::limit(trim(($error['code'] ?? '') . ' ' . ($error['title'] ?? $error['message'] ?? '')), 1000) ?: null,
            ]);
            Log::warning('WhatsApp outbound message failed', ['message_id' => $messageId, 'errors' => $status['errors'] ?? []]);
            return;
        }

        // Callbacks can arrive out of order, so never move a message backwards
        // (e.g. a late "delivered" after "read").
        if (self::STATUS_RANK[$state] > (self::STATUS_RANK[$log->status] ?? 0)) {
            $log->update(['status' => $state]);
        }
    }

    private function buildJobPayload(array $message, ?string $type): array
    {
        $payload = [
            'media_type' => $type ?: 'text',
            // The job uses this to attach filed_type/filed_id to the same
            // WhatsAppLog row we just wrote for this inbound message.
            'wamid' => $message['id'] ?? null,
        ];

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
     * Verify the x-hub-signature-256 header from Meta.
     */
    private function verifySignature(Request $request): bool
    {
        $secret = (string) config('services.meta.whatsapp_app_secret');

        if ($secret === '') {
            // Without the app secret nothing proves the request came from Meta,
            // so only local and test environments may run unsigned.
            if (app()->environment('production')) {
                Log::error('META_WHATSAPP_APP_SECRET is not set; rejecting WhatsApp webhook');
                return false;
            }

            return true;
        }

        $signature = $request->header('x-hub-signature-256');

        if (!is_string($signature) || $signature === '') {
            return false;
        }

        $expectedHash = 'sha256=' . hash_hmac('sha256', $request->getContent(), $secret);

        return hash_equals($expectedHash, $signature);
    }
}
