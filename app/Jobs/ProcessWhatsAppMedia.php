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
use Symfony\Component\Mime\MimeTypes;

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

        if (in_array($mediaType, ['image', 'video', 'document'], true) && ! empty($this->payload['media_id'])) {
            $localPath = $this->downloadMedia($this->payload['media_id'], $mediaType);

            // Videos are filed as-is; only stills and documents carry text worth reading.
            if ($localPath && $mediaType !== 'video') {
                $ocrText = $this->ocr($localPath, $ocr);
            }
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

        $result = $this->route($decision, $user, $projectId, $localPath, $matcher, $text, $ocrText);
        $summary = $result['summary'];
        if (! empty($result['filed']) && ! empty($this->payload['wamid'])) {
            $this->linkFiledToLog($this->payload['wamid'], $result['filed']);
        }
        $this->notifyAdmin($user, $decision, $summary);
        $this->replyToClient($user, $decision, $summary);
    }

    /**
     * Attach a polymorphic pointer from the inbound log row to the record
     * we just filed, so the activity feed can show "→ Expense #47" inline.
     */
    private function linkFiledToLog(string $wamid, object $filed): void
    {
        WhatsAppLog::where('message_id', $wamid)
            ->where('direction', 'inbound')
            ->update([
                'filed_type' => $filed->getMorphClass(),
                'filed_id' => $filed->getKey(),
            ]);
    }

    private function defaultProjectId(User $user): ?int
    {
        // Any active project the user owns; otherwise null.
        // Qualified: the pivot join makes a bare `id` ambiguous.
        return $user->projects()->where('projects.status', 'active')->value('projects.id')
            ?? \App\Models\Project::where('client_id', $user->id)->where('status', 'active')->value('id');
    }

    /**
     * @return array{summary: string, filed: ?object}
     */
    private function route(array $decision, User $user, ?int $projectId, ?string $localPath, PaymentMatcher $matcher, string $text, string $ocrText): array
    {
        $class = $decision['class'];
        $extracted = $decision['extracted'] ?? [];

        switch ($class) {
            case 'progress_video':
            case 'progress_photo':
                $photo = $localPath ? $this->createPhoto($user, $projectId, $localPath, $class === 'progress_video' ? 'video' : 'image') : null;
                return [
                    'summary' => $photo ? "Filed to Photos gallery (#{$photo->id})" : 'Photo received (no file stored)',
                    'filed' => $photo,
                ];

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
                return [
                    'summary' => "{$verb} expense #{$expense->id} — KES " . number_format((float) $expense->amount, 2),
                    'filed' => $expense,
                ];

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
                return [
                    'summary' => "Invoice queued as pending expense #{$expense->id}",
                    'filed' => $expense,
                ];

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
                return [
                    'summary' => "Cost request logged as pending expense #{$expense->id}",
                    'filed' => $expense,
                ];

            case 'chit_chat':
            default:
                return ['summary' => 'Logged (no action)', 'filed' => null];
        }
    }

    /**
     * Fetch a media object from the Graph API and store it on the public disk.
     * Returns the disk-relative path, or null when the download fails.
     */
    private function downloadMedia(string $mediaId, string $mediaType): ?string
    {
        $accessToken = config('services.meta.whatsapp_access_token');

        // Step 1: resolve the media id to a short-lived download URL.
        $meta = Http::withToken($accessToken)->get("https://graph.facebook.com/v18.0/{$mediaId}");
        $downloadUrl = $meta->successful() ? $meta->json('url') : null;
        if (! $downloadUrl) {
            Log::warning('WhatsApp media lookup failed', ['media_id' => $mediaId, 'status' => $meta->status()]);
            return null;
        }

        // Step 2: the URL needs the same bearer token to download.
        $binary = Http::withToken($accessToken)->get($downloadUrl);
        if ($binary->failed() || $binary->body() === '') {
            Log::warning('WhatsApp media download failed', ['media_id' => $mediaId, 'status' => $binary->status()]);
            return null;
        }

        $mime = $this->payload['mime'] ?? $meta->json('mime_type');
        $ext = $this->guessExtension($mime, $mediaType);
        $name = 'whatsapp/' . now()->format('Y/m/d') . '/' . Str::random(24) . '.' . $ext;
        Storage::disk('public')->put($name, $binary->body());

        return $name;
    }

    private function ocr(string $storagePath, OcrService $ocr): string
    {
        try {
            $result = $ocr->extractText(Storage::disk('public')->path($storagePath));
            if ($result['success'] ?? false) {
                return (string) ($result['text'] ?? '');
            }
        } catch (\Throwable $e) {
            Log::warning('OCR failed on WhatsApp media: ' . $e->getMessage());
        }

        return '';
    }

    private function guessExtension(?string $mime, string $mediaType): string
    {
        // Meta can append parameters, e.g. "audio/ogg; codecs=opus".
        $mime = $mime ? strtolower(trim(explode(';', $mime)[0])) : null;

        $ext = match ($mime) {
            'image/jpeg' => 'jpg',
            'image/png' => 'png',
            'application/pdf' => 'pdf',
            'video/mp4' => 'mp4',
            null => null,
            default => MimeTypes::getDefault()->getExtensions($mime)[0] ?? null,
        };

        return $ext ?? match ($mediaType) {
            'video' => 'mp4',
            'document' => 'bin',
            default => 'jpg',
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
                'file_size' => Storage::disk('public')->size($storagePath),
                'mime_type' => $this->payload['mime'] ?? ($mediaType === 'video' ? 'video/mp4' : 'image/jpeg'),
                'source_channel' => 'whatsapp',
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

        // A failed notification must not throw: the job would retry and file
        // the same expense again.
        try {
            $response = Http::withToken($accessToken)->post(
                "https://graph.facebook.com/v18.0/{$phoneNumberId}/messages",
                ['messaging_product' => 'whatsapp', 'to' => $to, 'type' => 'text', 'text' => ['body' => $text]]
            );

            // Keep the wamid so status callbacks can update this row.
            WhatsAppLog::create([
                'phone_number' => $to,
                'message' => $text,
                'direction' => 'outbound',
                'status' => $response->successful() ? 'sent' : 'failed',
                'error_message' => $response->successful() ? null : Str::limit((string) ($response->json('error.message') ?? $response->body()), 1000),
                'message_id' => $response->json('messages.0.id'),
                'timestamp' => now(),
            ]);
        } catch (\Throwable $e) {
            Log::error('WhatsApp outbound message failed: ' . $e->getMessage(), ['to' => $to]);
        }
    }
}
