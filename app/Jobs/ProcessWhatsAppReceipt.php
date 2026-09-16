<?php

namespace App\Jobs;

use App\Models\User;
use App\Services\ReceiptProcessingService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ProcessWhatsAppReceipt implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;
    public int $backoff = 15;
    public int $timeout = 180;

    public function __construct(
        public string $mediaId,
        public int $userId,
    ) {}

    public function handle(ReceiptProcessingService $receiptService): void
    {
        $user = User::find($this->userId);
        if (! $user) {
            return;
        }

        $accessToken = config('services.meta.whatsapp_access_token');
        $mediaMeta = Http::withToken($accessToken)->get("https://graph.facebook.com/v18.0/{$this->mediaId}");

        if ($mediaMeta->failed()) {
            Log::error('WhatsApp media meta fetch failed', ['body' => $mediaMeta->body()]);
            return;
        }

        $downloadUrl = $mediaMeta->json('url');
        if (! $downloadUrl) {
            Log::error('No download URL in WhatsApp media response');
            return;
        }

        $expense = $receiptService->processReceiptFromUrl($downloadUrl, $user);

        $body = $expense
            ? "Receipt processed! Amount: {$expense->currency} " . number_format($expense->amount, 2) .
                "\nTitle: {$expense->title}\nStatus: {$expense->status}"
            : 'Receipt received but could not be processed. Please try again or upload manually.';

        $this->sendWhatsAppMessage($user->phone ?? '', $body);
    }

    private function sendWhatsAppMessage(string $to, string $text): void
    {
        $phoneNumberId = config('services.meta.whatsapp_phone_number_id');
        $accessToken = config('services.meta.whatsapp_access_token');
        if (! $phoneNumberId || ! $accessToken || ! $to) {
            return;
        }
        $to = preg_replace('/[^\d]/', '', $to);
        Http::withToken($accessToken)->post(
            "https://graph.facebook.com/v18.0/{$phoneNumberId}/messages",
            ['messaging_product' => 'whatsapp', 'to' => $to, 'type' => 'text', 'text' => ['body' => $text]]
        );
    }
}
