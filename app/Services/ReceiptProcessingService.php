<?php

namespace App\Services;

use App\Models\Expense;
use App\Models\Receipt;
use App\Models\User;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class ReceiptProcessingService
{
    public function __construct(
        protected OcrService $ocr,
        protected ReceiptParser $parser,
    ) {
    }

    public function processReceiptFromUrl(string $url, User $user, ?string $notifyCallback = null): ?Expense
    {
        try {
            $contents = file_get_contents($url);
        } catch (\Exception $e) {
            Log::error('Receipt download error: ' . $e->getMessage());

            return null;
        }

        if ($contents === false) {
            Log::error('Receipt download failed: ' . $url);

            return null;
        }

        return $this->processReceiptFromContents($contents, $user, $notifyCallback);
    }

    /**
     * Turn bytes that are already in hand into an expense.
     *
     * Callers that had to authenticate to fetch the file - the WhatsApp
     * media URL, for instance - pass the body here rather than the URL, so
     * the bytes are not downloaded a second time.
     */
    public function processReceiptFromContents(string $contents, User $user, ?string $notifyCallback = null): ?Expense
    {
        try {
            $name = 'receipt_' . time() . '_' . rand(1000, 9999) . '.jpg';
            $path = 'receipts/' . $name;
            Storage::disk('local')->put($path, $contents);

            $ocr = $this->readReceipt($path);

            if ($ocr === null) {
                return null;
            }

            return $this->createExpenseFromData($user, $ocr['data'], $path, $ocr);
        } catch (\Exception $e) {
            Log::error("Receipt processing error: " . $e->getMessage());
            return null;
        }
    }

    /**
     * Run OCR over a stored receipt file and return the raw text alongside the
     * parsed fields, or null when the file is missing or unreadable.
     *
     * @return array{text: string, confidence: float|null, provider: string, data: array}|null
     */
    public function readReceipt(string $diskPath, string $disk = 'local'): ?array
    {
        if (!Storage::disk($disk)->exists($diskPath)) {
            return null;
        }

        $result = $this->ocr->extractText(Storage::disk($disk)->path($diskPath));

        if (!($result['success'] ?? false)) {
            Log::error('OCR failed for receipt: ' . ($result['message'] ?? 'unknown'));

            return null;
        }

        $text = $result['text'] ?? '';

        return [
            'text'       => $text,
            'confidence' => $result['confidence'] ?? null,
            'provider'   => $result['source'] ?? 'unknown',
            'data'       => $this->parser->parse($text),
        ];
    }

    public function createExpenseFromData(User $user, array $data, ?string $receiptPath = null, ?array $ocr = null): Expense
    {
        $expense = Expense::create([
            'user_id'          => $user->id,
            'title'            => $data['merchant'] ?? $data['recipient'] ?? 'Receipt',
            'amount'           => $data['total'] ?? 0.00,
            'expense_date'     => $data['date'] ?? now()->toDateString(),
            'time'             => $data['time'] ?? null,
            'recipient'        => $data['recipient'] ?? null,
            'payment_method'   => $data['payment_method'] ?? 'other',
            'reference_number' => $data['reference_number'] ?? null,
            'purpose'          => $data['purpose'] ?? null,
            'category'         => 'Uncategorized',
            'currency'         => 'KES',
            'status'           => 'pending',
        ]);

        if ($receiptPath !== null) {
            $this->attachReceiptMedia(
                $expense,
                $receiptPath,
                $data['reference_number'] ?? null,
                $data['recipient'] ?? null,
                $ocr['provider'] ?? 'local-tesseract',
                $ocr,
            );
        }

        return $expense;
    }

    /**
     * Move a stored receipt file onto the expense's Spatie media collection and
     * mirror it into the receipts table.
     *
     * This is the single place receipts are attached: ReceiptController's
     * browser uploads and ReceiptProcessingService's chat uploads both funnel
     * through here, so the receipts table can never be left unpopulated.
     */
    public function attachReceiptMedia(
        Expense $expense,
        string $tempPath,
        ?string $referenceNumber = null,
        ?string $recipient = null,
        string $ocrSource = 'local-tesseract',
        ?array $ocr = null,
        string $disk = 'local',
        ?string $originalName = null,
    ): ?Receipt {
        if (!Storage::disk($disk)->exists($tempPath)) {
            return null;
        }

        $refPart = $referenceNumber ? preg_replace('/[^A-Za-z0-9]/', '_', $referenceNumber) : 'receipt';
        $recPart = $recipient ? preg_replace('/[^A-Za-z0-9]/', '_', $recipient) : 'unknown';
        $ext = pathinfo($tempPath, PATHINFO_EXTENSION) ?: 'jpg';
        $humanName = "{$refPart}_{$recPart}.{$ext}";

        $expense
            ->addMediaFromDisk($tempPath, $disk)
            ->usingName($humanName)
            ->usingFileName($humanName)
            ->withCustomProperties([
                'reference_number' => $referenceNumber,
                'recipient'        => $recipient,
                'ocr_source'       => $ocrSource,
            ])
            ->toMediaCollection('receipt');

        Storage::disk($disk)->delete($tempPath);

        return $this->recordReceipt($expense, $ocr, $originalName ?? $humanName);
    }

    /**
     * Read a stored receipt again: parse the text OCR already gave, or, when
     * there is none (it was never read), run OCR over its file first.
     * Returns false when there is nothing to read.
     */
    public function readAgain(Receipt $receipt): bool
    {
        $text = (string) $receipt->extracted_text;
        $ocr = null;

        if (trim($text) === '') {
            $media = $receipt->expense?->getFirstMedia('receipt');
            if (!$media || !is_file($media->getPath())) {
                return false;
            }

            $result = $this->ocr->extractText($media->getPath());
            if (!($result['success'] ?? false)) {
                Log::error('OCR failed for receipt: ' . ($result['message'] ?? 'unknown'));

                return false;
            }
            $text = $result['text'] ?? '';
            $ocr = $result;
        }

        $parsed = $this->parser->parse($text);

        // Every field comes from this reading, so a wrong one from before doesn't linger.
        $receipt->update([
            'ocr_data'             => $parsed,
            'extracted_text'       => $text,
            'extracted_amount'     => $parsed['total'],
            'extracted_date'       => $parsed['date'],
            'extracted_merchant'   => $parsed['merchant'] ?? $parsed['recipient'],
            'extracted_receipt_id' => $parsed['reference_number'],
            'ocr_confidence'       => $ocr['confidence'] ?? $receipt->ocr_confidence,
            'ocr_provider'         => $ocr['source'] ?? $receipt->ocr_provider,
            'processed_at'         => now(),
        ]);

        return true;
    }

    /**
     * Write the receipts row that mirrors the expense's first receipt media.
     */
    public function recordReceipt(Expense $expense, ?array $ocr = null, string $originalName = ''): ?Receipt
    {
        $media = $expense->getFirstMedia('receipt');

        if (!$media) {
            return null;
        }

        $parsed = $ocr['data'] ?? [];
        $confidence = $ocr['confidence'] ?? null;

        $attributes = [
            'filename'             => $media->file_name,
            'original_name'        => $originalName !== '' ? $originalName : $media->file_name,
            'file_path'            => $media->getPathRelativeToRoot(),
            'file_size'            => $media->size,
            'mime_type'            => $media->mime_type,
            'ocr_data'             => $parsed ?: null,
            'ocr_confidence'       => $confidence,
            'extracted_text'       => $ocr['text'] ?? null,
            'extracted_amount'     => $parsed['total'] ?? null,
            'extracted_date'       => $parsed['date'] ?? null,
            'extracted_merchant'   => $parsed['merchant'] ?? null,
            'extracted_receipt_id' => $parsed['reference_number'] ?? null,
            'ocr_provider'         => $ocr['provider'] ?? null,
            'processed_at'         => now(),
            'needs_verification'   => $confidence !== null && $confidence < 0.7,
            'verification_status'  => 'pending',
        ];

        // Read through the relation query rather than $expense->receipt: Eloquent
        // caches a null hasOne result, which would make every later upload look
        // like the first and duplicate the row.
        $existing = $expense->receipt()->first();

        if ($existing) {
            $existing->update($attributes);
        } else {
            $existing = $expense->receipt()->create($attributes);
        }

        $expense->setRelation('receipt', $existing);

        return $existing;
    }
}
