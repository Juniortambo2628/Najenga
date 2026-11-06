<?php

namespace App\Jobs;

use App\Models\Document;
use App\Models\Expense;
use App\Models\Photo;
use App\Models\User;
use App\Models\WhatsAppLog;
use App\Services\MediaClassifier;
use App\Services\OcrService;
use App\Services\PaymentMatcher;
use App\Services\PhotoDateResolver;
use App\Services\Receipts\ReceiptReader;
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
        $ocrAlternatives = [];
        $localPath = null;

        if (in_array($mediaType, ['image', 'video', 'document'], true) && ! empty($this->payload['media_id'])) {
            $localPath = $this->downloadMedia($this->payload['media_id'], $mediaType);

            // Videos are filed as-is; only stills and documents carry text worth reading.
            if ($localPath && $mediaType !== 'video') {
                [$ocrText, $ocrAlternatives] = $this->ocr($localPath, $ocr);
            }
        }

        // Several payments in one screenshot or message, a flight ticket, or
        // an invoice / quotation (a document, not an expense): filed as such.
        if (in_array($mediaType, ['image', 'document', 'text'], true)) {
            $read = $mediaType === 'text'
                ? app(ReceiptReader::class)->read($text)
                : app(ReceiptReader::class)->read($ocrText, $ocrAlternatives);
            $filed = $this->fileReading($read, $user, $projectId, $mediaType === 'text' ? null : $localPath, $matcher);
            if ($filed !== null) {
                [$decision, $result] = $filed;
                Log::info('WhatsApp media read', ['user_id' => $user->id, 'kind' => $read['kind'], 'records' => count($result['records'])]);
                if (! empty($result['records']) && ! empty($this->payload['wamid'])) {
                    $this->linkFiledToLog($this->payload['wamid'], $result['records'][0]);
                }
                $this->notifyAdmin($user, $decision, $result['summary']);
                $this->replyToClient($user, $decision, $result['summary']);

                return;
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
     * File what ReceiptReader found, when it found something the classifier
     * can't: every payment in a screenshot (not just one), a flight ticket,
     * or an invoice / quotation, which goes under Documents and is not an
     * expense. Null leaves the message to the classifier, as before.
     *
     * @return array{0: array, 1: array{summary: string, records: array}}|null
     */
    private function fileReading(array $read, User $user, ?int $projectId, ?string $localPath, PaymentMatcher $matcher): ?array
    {
        if (in_array($read['kind'], ['payments', 'flight'], true) && $read['expenses']) {
            $records = [];
            $merged = 0;
            foreach ($read['expenses'] as $found) {
                $match = $matcher->findMatch([
                    'amount' => $found['amount'],
                    'reference_number' => $found['reference_number'],
                    'date' => $found['date'],
                    'recipient' => $found['recipient'],
                ], $projectId ?? 0, $user->id);
                $merged += $match ? 1 : 0;

                $expense = $match ?? new Expense();
                $expense->fill([
                    'user_id' => $user->id,
                    'project_id' => $projectId,
                    'title' => $found['title'],
                    'amount' => $found['amount'],
                    'currency' => $found['currency'] ?? 'KES',
                    'reference_number' => $found['reference_number'] ?? $match?->reference_number,
                    'expense_date' => $found['date'] ?? $match?->expense_date ?? now()->toDateString(),
                    'time' => $found['time'],
                    'recipient' => $found['recipient'] ?? $match?->recipient,
                    'purpose' => $found['purpose'] ?? $match?->purpose,
                    'category' => $found['category'],
                    'payment_method' => $found['payment_method'],
                    'payment_source' => $found['source'] === 'flight' ? 'flight_ticket' : 'mpesa_or_bank_sms',
                    'status' => $found['needs_check'] ? 'draft' : 'confirmed',
                    'confidence' => $found['needs_check'] ? 0.6 : 0.9,
                    'source_channel' => 'whatsapp',
                ]);
                $expense->save();
                $records[] = $expense;
            }

            $total = array_sum(array_map(fn ($e) => (float) $e->amount, $records));
            $count = count($records);
            $summary = $count === 1
                ? ($merged ? 'Merged into' : 'Created') . " expense #{$records[0]->id} — KES " . number_format($total, 2)
                : sprintf('Created %d expenses — KES %s in all (%s)', $count, number_format($total, 2), implode(', ', array_unique(array_map(fn ($e) => $e->title, $records))))
                    . ($merged ? sprintf('; %d matched ones already recorded', $merged) : '');

            $class = $read['kind'] === 'flight' ? 'flight_ticket' : 'payment_sms';

            return [['class' => $class, 'confidence' => 0.9, 'extracted' => [], 'auto_file' => true], ['summary' => $summary, 'records' => $records]];
        }

        if (in_array($read['kind'], ['invoice', 'quote'], true) && $localPath !== null) {
            $document = $this->createDocument($user, $projectId, $localPath, $read['document']);
            $what = $read['kind'] === 'quote' ? 'Quotation' : 'Invoice';
            $summary = $document
                ? sprintf('%s filed under Documents (#%d) — not an expense until it is paid', $what, $document->id)
                : "{$what} received — no active project to file it under";

            return [['class' => $read['kind'], 'confidence' => 0.85, 'extracted' => [], 'auto_file' => true], ['summary' => $summary, 'records' => $document ? [$document] : []]];
        }

        return null;
    }

    /** An invoice or quotation from WhatsApp, under the project's documents. */
    private function createDocument(User $user, ?int $projectId, string $storagePath, ?array $doc): ?Document
    {
        if (! $projectId) return null;

        try {
            $what = ($doc['type'] ?? 'invoice') === 'quote' ? 'Quotation' : 'Invoice';
            $total = isset($doc['total']) ? ($doc['currency'] ?? 'KES') . ' ' . number_format((float) $doc['total'], 2) : null;
            $document = Document::create([
                'project_id' => $projectId,
                'user_id' => $user->id,
                'title' => trim(implode(' ', array_filter([$what, $doc['number'] ?? null, isset($doc['issuer']) ? '— ' . $doc['issuer'] : null]))),
                'description' => implode(', ', array_filter([$total, isset($doc['due_date']) ? 'due ' . $doc['due_date'] : null, isset($doc['valid_until']) ? 'valid until ' . $doc['valid_until'] : null, 'from WhatsApp'])),
                'category' => ($doc['type'] ?? 'invoice') === 'quote' ? 'quote' : 'invoice',
                'document_date' => $doc['date'] ?? null,
                'original_name' => basename($storagePath),
                'filename' => basename($storagePath),
                'file_path' => '',
                'file_size' => Storage::disk('public')->size($storagePath),
                'mime_type' => $this->payload['mime'] ?? 'application/pdf',
            ]);
            $media = $document->addMediaFromDisk($storagePath, 'public')->toMediaCollection('files', 'public');
            $document->update(['file_path' => Str::after($media->getUrl(), '/storage/')]);

            return $document;
        } catch (\Throwable $e) {
            Log::warning('Failed to file a WhatsApp document: ' . $e->getMessage());

            return null;
        }
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
                // Not paid yet: a document, not an expense.
                $document = $localPath ? $this->createDocument($user, $projectId, $localPath, [
                    'type' => 'invoice',
                    'number' => $extracted['reference_number'] ?? null,
                    'issuer' => $extracted['recipient'] ?? null,
                    'total' => $extracted['amount'] ?? null,
                    'currency' => $extracted['currency'] ?? 'KES',
                    'date' => $extracted['date'] ?? null,
                ]) : null;
                return [
                    'summary' => $document ? "Invoice filed under Documents (#{$document->id}) — not an expense until it is paid" : 'Invoice received — not filed',
                    'filed' => $document,
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

    /** @return array{0: string, 1: array<int, string>} the text, and other readings of it */
    private function ocr(string $storagePath, OcrService $ocr): array
    {
        try {
            $result = $ocr->extractText(Storage::disk('public')->path($storagePath));
            if ($result['success'] ?? false) {
                return [(string) ($result['text'] ?? ''), $result['alternatives'] ?? []];
            }
        } catch (\Throwable $e) {
            Log::warning('OCR failed on WhatsApp media: ' . $e->getMessage());
        }

        return ['', []];
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
                'taken_at' => app(PhotoDateResolver::class)->now(),
                'date_source' => PhotoDateResolver::SOURCE_UPLOAD,
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
            'payment_sms', 'receipt_paper', 'flight_ticket' => 'Got it — ' . $summary,
            'invoice' => 'Invoice noted and filed under Documents. Send the payment confirmation once it is paid.',
            'quote' => 'Quotation filed under Documents.',
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
