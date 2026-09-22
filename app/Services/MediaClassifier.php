<?php

namespace App\Services;

/**
 * Classifies an inbound WhatsApp message into one of:
 *   payment_sms     - MPESA / bank SMS confirmation (proof of payment)
 *   receipt_paper   - Photo/PDF of a supplier receipt (paid)
 *   invoice         - Invoice / quotation / proforma (not yet paid)
 *   progress_photo  - Site photo, no financial content
 *   progress_video  - Any WhatsApp video message
 *   cost_request    - Text with an amount + "need/pay/pending"
 *   chit_chat       - Anything else
 *
 * Deterministic (no LLM). Cheap signals first (media type, keywords),
 * expensive last (OCR-based text scoring).
 */
class MediaClassifier
{
    private const AUTO_FILE_THRESHOLD = 0.7;

    private const BANK_SENDERS = [
        'NCBA', 'EQUITY', 'KCB', 'STANBIC', 'ABSA', 'DTB', 'COOP', 'FAMILY', 'IM BANK',
        'M-PESA', 'MPESA', 'MPESA-KENYA', 'MPESA_KE',
    ];

    private const PAYMENT_KEYWORDS = [
        'debited with', 'has been debited', 'paybill transfer', 'till transfer',
        'mpesa ref', 'bank ref', 'transferred to', 'sent to', 'received',
        'account has been credited', 'confirmed', 'transaction successful',
        'processed successfully',
    ];

    private const INVOICE_KEYWORDS = [
        'invoice', 'quotation', 'quote', 'proforma', 'bill to', 'due date',
        'terms', 'sub total', 'grand total', 'tax invoice',
    ];

    private const RECEIPT_KEYWORDS = [
        'receipt', 'thank you', 'change', 'cashier', 'till no', 'served by',
        'vat', 'kra pin',
    ];

    private const COST_REQUEST_KEYWORDS = [
        'need to pay', 'we need', 'pending', 'to pay', 'owed', 'balance',
        'pay them', 'send to', 'we owe',
    ];

    /**
     * @param  array{
     *   media_type: string|null,   // 'image' | 'video' | 'document' | 'text' | null
     *   text: string|null,         // message body (if text)
     *   ocr_text: string|null,     // OCR extracted text (if image/document)
     *   mime: string|null,
     * } $input
     * @return array{class: string, confidence: float, extracted: array, auto_file: bool}
     */
    public function classify(array $input): array
    {
        $mediaType = $input['media_type'] ?? null;
        $text = trim((string) ($input['text'] ?? ''));
        $ocrText = trim((string) ($input['ocr_text'] ?? ''));
        $mime = $input['mime'] ?? null;

        // 1. Free signals
        if ($mediaType === 'video') {
            return $this->result('progress_video', 1.0, []);
        }

        // 2. Text-only path
        if ($mediaType === 'text' || ($text !== '' && $ocrText === '' && $mediaType === null)) {
            return $this->classifyText($text);
        }

        // 3. Image / document path - combine any caption with OCR text
        $haystack = trim($text . "\n" . $ocrText);

        if ($haystack === '') {
            // Image with no OCR text at all → progress photo
            return $this->result('progress_photo', 0.75, []);
        }

        return $this->classifyExtractedText($haystack, $mime);
    }

    private function classifyText(string $text): array
    {
        if ($text === '') {
            return $this->result('chit_chat', 0.9, []);
        }

        $lower = mb_strtolower($text);
        $extracted = $this->extract($text);
        $hasAmount = $extracted['amount'] !== null;

        if ($hasAmount && $this->containsAny($lower, self::COST_REQUEST_KEYWORDS)) {
            return $this->result('cost_request', 0.85, $extracted);
        }

        if ($this->containsAny($lower, self::PAYMENT_KEYWORDS) && $extracted['reference_number']) {
            return $this->result('payment_sms', 0.9, $extracted);
        }

        if ($hasAmount) {
            // Amount but no explicit "need to pay" - low-confidence cost request
            return $this->result('cost_request', 0.55, $extracted);
        }

        return $this->result('chit_chat', 0.9, []);
    }

    private function classifyExtractedText(string $haystack, ?string $mime): array
    {
        $lower = mb_strtolower($haystack);
        $extracted = $this->extract($haystack);

        // Payment SMS screenshots have very distinctive markers
        $paymentScore = 0;
        foreach (self::PAYMENT_KEYWORDS as $kw) {
            if (str_contains($lower, $kw)) $paymentScore++;
        }
        foreach (self::BANK_SENDERS as $sender) {
            if (str_contains($lower, mb_strtolower($sender))) $paymentScore++;
        }
        if (preg_match('/\b(?:FT[A-Z0-9]{8,}|UI[A-Z0-9]{6,}|S[A-Z][A-Z0-9]{6,})\b/', $haystack)) {
            $paymentScore += 2; // MPESA / bank refs
        }

        $invoiceScore = 0;
        foreach (self::INVOICE_KEYWORDS as $kw) {
            if (str_contains($lower, $kw)) $invoiceScore++;
        }

        $receiptScore = 0;
        foreach (self::RECEIPT_KEYWORDS as $kw) {
            if (str_contains($lower, $kw)) $receiptScore++;
        }

        // Payment SMS wins if 3+ signals present
        if ($paymentScore >= 3 && $extracted['amount']) {
            $conf = min(0.95, 0.6 + 0.08 * $paymentScore);
            return $this->result('payment_sms', $conf, $extracted);
        }

        // Invoice wins with 2+ invoice keywords
        if ($invoiceScore >= 2) {
            $conf = min(0.9, 0.55 + 0.1 * $invoiceScore);
            return $this->result('invoice', $conf, $extracted);
        }

        // Receipt wins with receipt keywords + amount
        if ($receiptScore >= 2 && $extracted['amount']) {
            $conf = min(0.9, 0.55 + 0.1 * $receiptScore);
            return $this->result('receipt_paper', $conf, $extracted);
        }

        // Single strong signal → medium confidence
        if ($paymentScore >= 1 && $extracted['amount'] && $extracted['reference_number']) {
            return $this->result('payment_sms', 0.65, $extracted);
        }
        if ($invoiceScore >= 1 && $extracted['amount']) {
            return $this->result('invoice', 0.55, $extracted);
        }
        if ($receiptScore >= 1 && $extracted['amount']) {
            return $this->result('receipt_paper', 0.55, $extracted);
        }

        // Fallback: image with some text but no financial signals → progress photo
        if (! $extracted['amount']) {
            return $this->result('progress_photo', 0.65, $extracted);
        }

        // Amount without any classifying signal → low-confidence receipt
        return $this->result('receipt_paper', 0.35, $extracted);
    }

    /**
     * Best-effort field extraction (amount, ref, date, phone, recipient).
     */
    public function extract(string $text): array
    {
        $extracted = [
            'amount' => null,
            'currency' => 'KES',
            'reference_number' => null,
            'date' => null,
            'phone' => null,
            'recipient' => null,
        ];

        // Amount extraction:
        //  1. currency-prefixed (KES/Ksh/USD/UGX) followed by any digit run
        //  2. thousands-separated numbers anywhere (comma required, so we don't
        //     capture account or phone numbers). Take the max of everything.
        $amounts = [];
        if (preg_match_all('/(?:KES|Ksh|USD|UGX)\s*([\d,]+(?:\.\d{1,2})?)/i', $text, $m)) {
            foreach ($m[1] as $v) $amounts[] = (float) str_replace(',', '', $v);
        }
        if (preg_match_all('/\b(\d{1,3}(?:,\d{3})+(?:\.\d{1,2})?)\b/', $text, $m)) {
            foreach ($m[1] as $v) $amounts[] = (float) str_replace(',', '', $v);
        }
        if ($amounts) $extracted['amount'] = max($amounts);

        // Reference (MPESA style: alnum 10+, all upper or mixed) or bank Ref: XXXX
        if (preg_match('/(?:Bank\s*Ref|MPESA\s*REF|Ref(?:erence)?)[:\s]+([A-Z0-9]{6,20})/i', $text, $m)) {
            $extracted['reference_number'] = strtoupper($m[1]);
        } elseif (preg_match('/\b(FT[A-Z0-9]{8,15}|UI[A-Z0-9]{6,12}|S[A-Z][A-Z0-9]{6,12}|T[A-Z][A-Z0-9]{7,12})\b/', $text, $m)) {
            $extracted['reference_number'] = $m[1];
        }

        // Date: DD/MM/YYYY or DD-MMM-YYYY
        if (preg_match('/(\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4})/', $text, $m)) {
            $extracted['date'] = $this->normalizeDate($m[1]);
        } elseif (preg_match('/(\d{1,2}\s*(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s*\d{2,4})/i', $text, $m)) {
            $ts = strtotime($m[1]);
            if ($ts) $extracted['date'] = date('Y-m-d', $ts);
        }

        // Phone: +254... or 07XXXXXXXX or 254XXXXXXXXX
        if (preg_match('/(?:\+?254|0)7\d{8}/', $text, $m)) {
            $extracted['phone'] = $m[0];
        }

        // Recipient: text between "to " and (bank ref / newline / period)
        if (preg_match('/\bto\s+([A-Z][A-Za-z0-9 &\'.,-]{2,60}?)(?=\s+(?:has been|Bank Ref|BANK REF|MPESA REF|for|on|\.|\n|,))/', $text, $m)) {
            $extracted['recipient'] = trim($m[1]);
        }

        return $extracted;
    }

    private function containsAny(string $haystack, array $needles): bool
    {
        foreach ($needles as $n) {
            if (str_contains($haystack, mb_strtolower($n))) return true;
        }
        return false;
    }

    private function normalizeDate(string $raw): ?string
    {
        $parts = preg_split('/[\/-]/', $raw);
        if (! $parts || count($parts) !== 3) return null;
        [$d, $m, $y] = $parts;
        if (strlen($y) === 2) $y = ((int) $y < 50 ? '20' : '19') . $y;
        $d = str_pad($d, 2, '0', STR_PAD_LEFT);
        $m = str_pad($m, 2, '0', STR_PAD_LEFT);
        if ((int) $m < 1 || (int) $m > 12 || (int) $d < 1 || (int) $d > 31) return null;
        return "{$y}-{$m}-{$d}";
    }

    private function result(string $class, float $confidence, array $extracted): array
    {
        return [
            'class' => $class,
            'confidence' => round($confidence, 3),
            'extracted' => $extracted,
            'auto_file' => $confidence >= self::AUTO_FILE_THRESHOLD,
        ];
    }
}
