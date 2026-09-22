<?php

namespace App\Jobs;

use App\Models\Expense;
use App\Models\Photo;
use App\Models\User;
use App\Models\WhatsAppLog;
use App\Services\MediaClassifier;
use App\Services\OcrService;
use App\Services\PaymentMatcher;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ProcessWhatsAppMedia implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;
    public int $backoff = 20;
    public int $timeout = 240;

    /**
     * @param array $payload  {media_type, media_id?, text?, mime?, caption?}
     */
    public function __construct(
        public array $payload,
        public int $userId,
    ) {}

    public function handle(
        MediaClassifier $classifier,
        OcrService $ocr,
        PaymentMatcher $matcher,
    ): void {
        $user = User::find($this->userId);
        if (! $user) return;

        $projectId = $this->defaultProjectId($user);

        $mediaType = $this->payload['media_type'] ?? 'text';
        $text = $this->payload['text'] ?? $this->payload['caption'] ?? '';
        $ocrText = '';
        $localPath = null;

        if (in_array($mediaType, ['image', 'document'], true) && ! empty($this->payload['media_id'])) {
            [$localPath, $ocrText] = $this->downloadAndOcr($this->payload['media_id'], $mediaType, $ocr);
        }

        $decision = $classifier->classify([
            'media_type' => $mediaType,
            'text' => $text,
            'ocr_text' => $ocrText,
            'mime' => $this->payload['mime'] ?? null,
        ]);

        Log::info('WhatsApp media classified', [
            'user_id' => $user->id,
            'class' => $decision['class'],
            'confidence' => $decision['confidence'],
            'auto_file' => $decision['auto_file'],
        ]);

        $summary = $this->route($decision, $user, $projectId, $localPath, $matcher, $text, $ocrText);
        $this->notifyAdmin($user, $decision, $summary);
        $this->replyToClient($user, $decision, $summary);
    }

    private function defaultProjectId(User $user): ?int
    {
        // Any active project the user owns; otherwise null.
        return $user->projects()->where('status', 'active')->value('id')
            ?? \App\Models\Project::where('client_id', $user->id)->where('status', 'active')->value('id');
    }

    private function route(array $decision, User $user, ?int $projectId, ?string $localPath, PaymentMatcher $matcher, string $text, string $ocrText): string
    {
        $class = $decision['class'];
        $extracted = $decision['extracted'] ?? [];

        switch ($class) {
            case 'progress_video':
            case 'progress_photo':
                $photo = $localPath ? $this->createPhoto($user, $projectId, $localPath, $class === 'progress_video' ? 'video' : 'image') : null;
                return $photo ? "Filed to Photos gallery (#{$photo->id})" : 'Photo received (no file stored)';

            case 'payment_sms':
            case 'receipt_paper':
                $match = $matcher->findMatch($extracted, $projectId ?? 0, $user->id);
                $expense = $match ?? new Expense();
                $expense->fill([
                    'user_id' => $user->id,
                    'project_id' => $projectId,
                    'title' => $extracted['recipient'] ?? ($match?->title ?? Str::limit($text ?: $ocrText, 60, '')),
                    'amount' => $extracted['amount'] ?? $match?->amount ?? 0,
                    'currency' => $extracted['currency'] ?? 'KES',
                    'reference_number' => $extracted['reference_number'] ?? $match?->reference_number,
                    'expense_date' => $extracted['date'] ?? $match?->expense_date ?? now()->toDateString(),
                    'recipient' => $extracted['recipient'] ?? $match?->recipient,
                    'payment_method' => 'mobile_money',
                    'payment_source' => $class === 'payment_sms' ? 'mpesa_or_bank_sms' : 'paper_receipt',
                    'status' => $decision['auto_file'] ? 'confirmed' : 'draft',
                    'confidence' => $decision['confidence'],
                    'source_channel' => 'whatsapp',
                ]);
                $expense->save();
                $verb = $match ? 'Merged into' : 'Created';
                return "{$verb} expense #{$expense->id} — KES " . number_format((float) $expense->amount, 2);

            case 'invoice':
                $expense = new Expense([
                    'user_id' => $user->id,
                    'project_id' => $projectId,
                    'title' => $extracted['recipient'] ?? 'Invoice',
                    'amount' => $extracted['amount'] ?? 0,
                    'currency' => 'KES',
                    'reference_number' => $extracted['reference_number'],
                    'expense_date' => $extracted['date'] ?? now()->toDateString(),
                    'recipient' => $extracted['recipient'],
                    'payment_method' => 'other',
                    'payment_source' => 'invoice',
                    'status' => 'draft',
                    'confidence' => $decision['confidence'],
                    'source_channel' => 'whatsapp',
                ]);
                $expense->save();
                return "Invoice queued as pending expense #{$expense->id}";

            case 'cost_request':
                $expense = new Expense([
                    'user_id' => $user->id,
                    'project_id' => $projectId,
                    'title' => 'Cost request',
                    'description' => Str::limit($text, 500, '…'),
                    'amount' => $extracted['amount'] ?? 0,
                    'currency' => 'KES',
                    'expense_date' => $extracted['date'] ?? now()->toDateString(),
                    'payment_method' => 'other',
                    'payment_source' => 'cost_request',
                    'status' => 'draft',
                    'confidence' => $decision['confidence'],
                    'source_channel' => 'whatsapp',
                ]);
                $expense->save();
                return "Cost request logged as pending expense #{$expense->id}";

            case 'chit_chat':
            default:
                return 'Logged (no action)';
        }
    }

    private function downloadAndOcr(string $mediaId, string $mediaType, OcrService $ocr): array
    {
        $accessToken = config('services.meta.whatsapp_access_token');
        $meta = Http::withToken($accessToken)->get("https://graph.facebook.com/v18.0/{$mediaId}");
        if ($meta->failed()) return [null, ''];

        $downloadUrl = $meta->json('url');
        if (! $downloadUrl) return [null, ''];

        $binary = Http::withToken($accessToken)->get($downloadUrl);
        if ($binary->failed()) return [null, ''];

        $ext = $this->guessExtension($this->payload['mime'] ?? null, $mediaType);
        $name = 'whatsapp/' . now()->format('Y/m/d') . '/' . Str::random(24) . '.' . $ext;
        Storage::disk('public')->put($name, $binary->body());
        $fullPath = Storage::disk('public')->path($name);

        $ocrText = '';
        try {
            $result = $ocr->extractText($fullPath);
            if ($result['success'] ?? false) {
                $ocrText = (string) ($result['text'] ?? '');
            }
        } catch (\Throwable $e) {
            Log::warning('OCR failed on WhatsApp media: ' . $e->getMessage());
        }

        return [$name, $ocrText];
    }

    private function guessExtension(?string $mime, string $mediaType): string
    {
        return match ($mime) {
            'image/jpeg' => 'jpg',
            'image/png' => 'png',
            'application/pdf' => 'pdf',
            'video/mp4' => 'mp4',
            default => $mediaType === 'video' ? 'mp4' : ($mediaType === 'document' ? 'bin' : 'jpg'),
        };
    }

    private function createPhoto(User $user, ?int $projectId, string $storagePath, string $mediaType): ?Photo
    {
        if (! $projectId) return null;
        try {
            return Photo::create([
                'project_id' => $projectId,
                'user_id' => $user->id,
                'title' => 'WhatsApp ' . ($mediaType === 'video' ? 'video' : 'photo') . ' — ' . now()->format('d M Y'),
                'filename' => basename($storagePath),
                'original_name' => basename($storagePath),
                'file_path' => $storagePath,
                'mime_type' => $this->payload['mime'] ?? ($mediaType === 'video' ? 'video/mp4' : 'image/jpeg'),
                'photo_date' => now()->toDateString(),
            ]);
        } catch (\Throwable $e) {
            Log::warning('Failed to create Photo from WhatsApp: ' . $e->getMessage());
            return null;
        }
    }

    private function notifyAdmin(User $sender, array $decision, string $summary): void
    {
        $adminWaId = config('services.meta.admin_wa_id') ?: env('NAJENGA_ADMIN_WA_ID');
        if (! $adminWaId) return;

        $msg = sprintf(
            "🆕 %s (%s)\nClass: %s (%.0f%%)\n%s",
            $sender->first_name ?? $sender->name ?? 'User',
            $sender->phone ?? $sender->whatsapp_wa_id ?? '?',
            $decision['class'],
            $decision['confidence'] * 100,
            $summary,
        );

        $this->sendWhatsAppText($adminWaId, $msg);
    }

    private function replyToClient(User $user, array $decision, string $summary): void
    {
        $to = $user->whatsapp_wa_id ?? $user->phone;
        if (! $to) return;
        $to = preg_replace('/[^\d]/', '', $to);
        if (! $to) return;

        $body = match ($decision['class']) {
            'progress_video', 'progress_photo' => 'Got it — filed to the gallery.',
            'payment_sms', 'receipt_paper' => 'Got it — ' . $summary,
            'invoice' => 'Invoice noted, pending payment confirmation.',
            'cost_request' => 'Noted, pending confirmation.',
            default => null,
        };
        if ($body) $this->sendWhatsAppText($to, $body);
    }

    private function sendWhatsAppText(string $to, string $text): void
    {
        $phoneNumberId = config('services.meta.whatsapp_phone_number_id');
        $accessToken = config('services.meta.whatsapp_access_token');
        if (! $phoneNumberId || ! $accessToken) return;

        WhatsAppLog::create([
            'phone_number' => $to,
            'message' => $text,
            'direction' => 'outbound',
            'status' => 'queued',
            'timestamp' => now(),
        ]);

        Http::withToken($accessToken)->post(
            "https://graph.facebook.com/v18.0/{$phoneNumberId}/messages",
            ['messaging_product' => 'whatsapp', 'to' => $to, 'type' => 'text', 'text' => ['body' => $text]]
        );
    }
}
