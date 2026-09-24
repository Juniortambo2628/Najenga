<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\WhatsAppLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\RateLimiter;

class WhatsAppLinkController extends Controller
{
    private const CODE_TTL_SECONDS = 600; // 10 minutes
    private const RESEND_INTERVAL_SECONDS = 60;
    private const MAX_ATTEMPTS = 5;

    public function sendCode(Request $request)
    {
        $data = $request->validate([
            'phone' => 'required|string|min:7|max:20',
        ]);

        $user = $request->user();
        $normalized = $this->normalize($data['phone']);

        if (User::where('whatsapp_wa_id', $normalized)
            ->whereNotNull('whatsapp_verified_at')
            ->where('id', '!=', $user->id)
            ->exists()
        ) {
            return response()->json(['ok' => false, 'error' => 'This number is already linked to another account.'], 409);
        }

        $rateKey = 'wa-link-send:' . $user->id;
        if (RateLimiter::tooManyAttempts($rateKey, 1)) {
            $wait = RateLimiter::availableIn($rateKey);
            return response()->json(['ok' => false, 'error' => "Please wait {$wait}s before requesting another code."], 429);
        }
        RateLimiter::hit($rateKey, self::RESEND_INTERVAL_SECONDS);

        $code = str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        Cache::put($this->codeKey($user->id), ['code' => $code, 'phone' => $normalized, 'attempts' => 0], self::CODE_TTL_SECONDS);

        $wamid = $this->sendWhatsAppMessage($normalized, "Your Najenga verification code is {$code}. It expires in 10 minutes.");
        if (! $wamid) {
            return response()->json(['ok' => false, 'error' => 'Could not send WhatsApp message. Check WhatsApp settings.'], 502);
        }

        // Log the outbound so it shows on the /whatsapp activity page and the
        // delivery-status webhook can update its status.
        if (is_string($wamid)) {
            WhatsAppLog::create([
                'user_id' => $user->id,
                'phone_number' => $normalized,
                'message' => 'Verification code sent',
                'direction' => 'outbound',
                'status' => 'sent',
                'message_id' => $wamid,
                'timestamp' => now(),
            ]);
        }

        return response()->json(['ok' => true, 'phone_masked' => $this->mask($normalized), 'expires_in' => self::CODE_TTL_SECONDS]);
    }

    public function verifyCode(Request $request)
    {
        $data = $request->validate([
            'code' => 'required|string|size:6',
        ]);

        $user = $request->user();
        $key = $this->codeKey($user->id);
        $entry = Cache::get($key);

        if (! $entry) {
            return response()->json(['ok' => false, 'error' => 'Code expired. Request a new one.'], 410);
        }

        if (($entry['attempts'] ?? 0) >= self::MAX_ATTEMPTS) {
            Cache::forget($key);
            return response()->json(['ok' => false, 'error' => 'Too many attempts. Request a new code.'], 429);
        }

        if (! hash_equals((string) $entry['code'], $data['code'])) {
            $entry['attempts'] = ($entry['attempts'] ?? 0) + 1;
            Cache::put($key, $entry, self::CODE_TTL_SECONDS);
            return response()->json(['ok' => false, 'error' => 'Incorrect code.'], 422);
        }

        Cache::forget($key);
        $user->forceFill([
            'whatsapp_wa_id' => $entry['phone'],
            'whatsapp_verified_at' => now(),
            'phone' => $user->phone ?: '+' . $entry['phone'],
        ])->save();

        return response()->json([
            'ok' => true,
            'whatsapp_wa_id' => $entry['phone'],
            'verified_at' => $user->whatsapp_verified_at?->toIso8601String(),
        ]);
    }

    public function unlink(Request $request)
    {
        $user = $request->user();
        $user->forceFill(['whatsapp_wa_id' => null, 'whatsapp_verified_at' => null])->save();
        Cache::forget($this->codeKey($user->id));
        return response()->json(['ok' => true]);
    }

    private function codeKey(int $userId): string
    {
        return "wa-link-code:{$userId}";
    }

    private function normalize(string $phone): string
    {
        return ltrim(preg_replace('/[^\d+]/', '', $phone), '+');
    }

    private function mask(string $digits): string
    {
        if (strlen($digits) < 4) return $digits;
        return substr($digits, 0, 3) . str_repeat('*', max(0, strlen($digits) - 5)) . substr($digits, -2);
    }

    /**
     * @return string|false wamid on success, false on failure.
     */
    private function sendWhatsAppMessage(string $to, string $text): string|false
    {
        $phoneNumberId = config('services.meta.whatsapp_phone_number_id');
        $accessToken = config('services.meta.whatsapp_access_token');
        if (! $phoneNumberId || ! $accessToken) {
            Log::warning('WhatsApp linking attempted without configuration');
            return false;
        }

        try {
            $response = Http::withToken($accessToken)->post(
                "https://graph.facebook.com/v18.0/{$phoneNumberId}/messages",
                ['messaging_product' => 'whatsapp', 'to' => $to, 'type' => 'text', 'text' => ['body' => $text]]
            );
            if ($response->failed()) {
                Log::warning('WhatsApp verification message failed', ['status' => $response->status(), 'body' => $response->body()]);
                return false;
            }
            return (string) ($response->json('messages.0.id') ?? '') ?: 'sent';
        } catch (\Throwable $e) {
            Log::error('WhatsApp verification message exception: ' . $e->getMessage());
            return false;
        }
    }
}
