<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Expense;
use App\Models\WhatsAppContact;
use App\Models\WhatsAppLog;
use App\Models\WhatsAppSetting;
use App\Models\WhatsAppWebhookEvent;
use App\Services\ReceiptProcessingService;
use App\Services\WhatsAppMessageService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class WhatsAppController extends Controller
{
    public function __construct(
        protected ReceiptProcessingService $receiptService,
        protected WhatsAppMessageService $whatsappMessageService,
    ) {
    }

    /**
     * Display the WhatsApp integration page.
     */
    public function index(): Response
    {
        $missing = [];

        if (! config('services.meta.whatsapp_phone_number_id')) {
            $missing[] = 'whatsapp_phone_number_id';
        }

        if (! config('services.meta.whatsapp_access_token')) {
            $missing[] = 'whatsapp_access_token';
        }

        return Inertia::render('WhatsApp', [
            'connection' => [
                'configured' => $missing === [],
                'missing' => $missing,
            ],
            'settings' => WhatsAppSetting::current(),
        ]);
    }

    /**
     * Test the configured WhatsApp API credentials against Meta.
     */
    public function testConnection(Request $request): JsonResponse
    {
        $phoneNumberId = config('services.meta.whatsapp_phone_number_id');
        $accessToken = config('services.meta.whatsapp_access_token');

        if (! $phoneNumberId || ! $accessToken) {
            return response()->json([
                'ok' => false,
                'message' => 'WhatsApp API credentials are not configured.',
            ]);
        }

        try {
            $response = Http::withToken($accessToken)
                ->get("https://graph.facebook.com/v18.0/{$phoneNumberId}", [
                    'fields' => 'display_phone_number',
                ]);

            if ($response->failed()) {
                Log::error('WhatsApp connection test failed: ' . $response->body());

                return response()->json([
                    'ok' => false,
                    'message' => 'Meta rejected the configured credentials.',
                ]);
            }

            return response()->json([
                'ok' => true,
                'message' => 'Connected to ' . ($response->json('display_phone_number') ?: 'WhatsApp') . '.',
            ]);
        } catch (\Exception $e) {
            Log::error('WhatsApp connection test failed: ' . $e->getMessage());

            return response()->json([
                'ok' => false,
                'message' => 'The connection test failed. Please try again.',
            ]);
        }
    }

    /**
     * Persist a notification toggle from the WhatsApp page.
     */
    public function updateSettings(Request $request)
    {
        $validated = $request->validate([
            'key' => ['required', 'string', Rule::in([
                'expense_notifications',
                'project_notifications',
                'document_notifications',
            ])],
            'enabled' => ['required', 'boolean'],
        ]);

        WhatsAppSetting::current()->update([
            $validated['key'] => $validated['enabled'],
        ]);

        return back()->with('success', 'WhatsApp notification settings updated.');
    }

    /**
     * Handle GET request for Meta webhook verification.
     * Meta sends this once when you configure the webhook in Business Suite.
     */
    public function verifyWebhook(Request $request)
    {
        $mode = $request->query('hub.mode');
        $token = $request->query('hub.verify_token');
        $challenge = $request->query('hub.challenge');

        if ($mode === 'subscribe' && $token === config('services.meta.whatsapp_verify_token')) {
            Log::info('WhatsApp webhook verified successfully');
            return response($challenge, 200)->header('Content-Type', 'text/plain');
        }

        Log::warning('WhatsApp webhook verification failed', ['mode' => $mode, 'token' => $token]);
        return response('Forbidden', 403);
    }

    /**
     * Handle incoming WhatsApp messages from Meta Cloud API.
     */
    public function handleWebhook(Request $request)
    {
        // Log the raw webhook event
        $event = WhatsAppWebhookEvent::create([
            'payload' => $request->all(),
            'signature' => $request->header('x-hub-signature-256'),
        ]);

        // Verify signature if app secret is configured
        if (config('services.meta.whatsapp_app_secret')) {
            if (!$this->verifySignature($request)) {
                Log::warning('WhatsApp webhook signature verification failed');
                $event->update(['error_message' => 'Invalid signature']);
                return response('Invalid signature', 401);
            }
        }

        // Meta sends a GET for verification and POST for messages
        if ($request->method() !== 'POST') {
            $event->update(['processed' => true]);
            return response('OK', 200);
        }

        try {
            $payload = $request->all();

            // Validate this is a WhatsApp message event
            if (($payload['object'] ?? '') !== 'whatsapp_business_account') {
                $event->update(['processed' => true]);
                return response('OK', 200);
            }

            $entry = $payload['entry'][0] ?? null;
            $changes = $entry['changes'][0] ?? null;
            $value = $changes['value'] ?? null;

            if (!$value) {
                $event->update(['processed' => true]);
                return response('OK', 200);
            }

            $messages = $value['messages'] ?? [];
            $contacts = $value['contacts'] ?? [];

            foreach ($messages as $message) {
                $this->processMessage($message, $contacts, $value['metadata'] ?? []);
            }

            $event->update(['processed' => true]);
            return response('OK', 200);
        } catch (\Exception $e) {
            Log::error('WhatsApp webhook processing error: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);
            $event->update(['error_message' => $e->getMessage()]);
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
        $log = WhatsAppLog::create([
            'user_id' => $user->id,
            'phone_number' => $from,
            'message' => $message['text']['body'] ?? ($type === 'image' ? '[Image]' : '[' . ucfirst($type) . ']'),
            'direction' => 'inbound',
            'status' => 'received',
            'message_id' => $messageId,
            'timestamp' => isset($message['timestamp']) ? date('Y-m-d H:i:s', (int) $message['timestamp']) : now(),
        ]);

        // Handle image messages (receipts)
        if ($type === 'image' && isset($message['image']['id'])) {
            $expense = $this->processReceipt($message['image']['id'], $user);

            if ($expense) {
                $log->update([
                    'filed_type' => $expense->getMorphClass(),
                    'filed_id' => $expense->id,
                ]);
            }
        }
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
     * Process a receipt image from WhatsApp.
     */
    private function processReceipt(string $mediaId, User $user): ?Expense
    {
        try {
            // Download media from Meta Graph API
            $accessToken = config('services.meta.whatsapp_access_token');
            $mediaUrl = "https://graph.facebook.com/v18.0/{$mediaId}";

            $response = Http::withToken($accessToken)->get($mediaUrl);

            if ($response->failed()) {
                Log::error('Failed to fetch WhatsApp media: ' . $response->body());
                return null;
            }

            $mediaData = $response->json();
            $downloadUrl = $mediaData['url'] ?? null;

            if (!$downloadUrl) {
                Log::error('No download URL in WhatsApp media response');
                return null;
            }

            // Download the actual image
            $imageResponse = Http::withToken($accessToken)->get($downloadUrl);

            if ($imageResponse->failed()) {
                Log::error('Failed to download WhatsApp image');
                return null;
            }

            // Use ReceiptProcessingService for consistent OCR processing.
            // The bytes are handed over rather than the URL: the media URL is
            // only retrievable with the access token, and processReceiptFromUrl
            // would have fetched the whole image again without it.
            $expense = $this->receiptService->processReceiptFromContents($imageResponse->body(), $user);

            if ($expense) {
                $this->sendWhatsAppMessage(
                    $user->phone,
                    "Receipt processed successfully! Amount: {$expense->currency} " . number_format($expense->amount, 2) .
                    "\nTitle: {$expense->title}" .
                    "\nStatus: {$expense->status}"
                );
            } else {
                $this->sendWhatsAppMessage(
                    $user->phone,
                    "Receipt received but could not be processed. Please try again or upload manually."
                );
            }

            return $expense;
        } catch (\Exception $e) {
            Log::error('WhatsApp receipt processing error: ' . $e->getMessage());
            $this->sendWhatsAppMessage(
                $user->phone,
                "Sorry, there was an error processing your receipt. Please try again later."
            );

            return null;
        }
    }

    /**
     * Send a WhatsApp message via Meta Cloud API.
     */
    private function sendWhatsAppMessage(?string $to, string $text): void
    {
        $this->whatsappMessageService->send($to, $text);
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
