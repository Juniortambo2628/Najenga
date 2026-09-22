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
 *   chit_chat       - Anything else (incl. voice notes, stickers, unreadable documents)
 *
 * Deterministic (no LLM). Cheap signals first (media type, keywords),
 * expensive last (OCR-based text scoring). Keywords are matched on word
 * boundaries so "private" doesn't count as "vat" and "exchange" as "change".
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
        'mpesa ref', 'm-pesa ref', 'bank ref', 'transferred to', 'sent to', 'paid to',
        'you have received', 'account has been credited', 'has been credited',
        'confirmed', 'transaction successful', 'processed successfully', 'was successful',
        // Swahili M-PESA
        'imethibitishwa', 'imetumwa kwa', 'umepokea', 'umelipa',
    ];

    /** keyword => weight. Weight 2 = only appears on unpaid documents. */
    private const INVOICE_KEYWORDS = [
        'bill to' => 2, 'billed to' => 2, 'due date' => 2, 'proforma' => 2, 'pro forma' => 2,
        'quotation' => 2, 'payment terms' => 2, 'invoice no' => 2, 'invoice number' => 2,
        'invoice #' => 2, 'amount due' => 2, 'balance due' => 2, 'bank details' => 2,
        'account name' => 2, 'valid until' => 2, 'validity' => 2, 'lpo' => 2,
        'invoice' => 1, 'tax invoice' => 1, 'quote' => 1, 'sub total' => 1, 'subtotal' => 1,
        'grand total' => 1, 'terms' => 1, 'deposit' => 1,
    ];

    /** keyword => weight. Weight 2 = only appears once money has changed hands. */
    private const RECEIPT_KEYWORDS = [
        'receipt' => 2, 'cash sale' => 2, 'change' => 2, 'tendered' => 2, 'cashier' => 2,
        'served by' => 2, 'till no' => 2, 'cu serial' => 2, 'cu invoice' => 2, 'etr' => 2,
        'received from' => 2, 'received with thanks' => 2, 'the sum of' => 2,
        'being payment' => 2, 'amount paid' => 2,
        'paid' => 1, 'cash' => 1, 'thank you' => 1, 'vat' => 1, 'kra pin' => 1,
    ];

    private const COST_REQUEST_KEYWORDS = [
        'need to pay', 'need', 'needs', 'pending', 'to pay', 'owed', 'balance',
        'pay them', 'send to', 'please send', 'send', 'we owe', 'wants', 'require',
        'required', 'requesting', 'budget',
        // Swahili
        'tunahitaji', 'nahitaji', 'inahitajika', 'lipa', 'kulipa', 'tulipe', 'alipwe',
        'walipwe', 'deni', 'tuma', 'bado',
    ];

    /** A number is never the payment amount when its label is one of these. */
    private const AMOUNT_EXCLUDE_ANYWHERE = '/(?:m-?pesa|account|new|avail(?:able)?\.?|actual|book|opening|closing|running|a\/c)\s+bal(?:ance)?\b|\bbalance\s+was\b|\bsalio\b|transaction\s+cost|\bgharama\b|within\s+the\s+day|\bfuliza\b|\blimit\b/';
    private const AMOUNT_EXCLUDE_LABEL = '/\b(?:cash|tendered|change|chenji|bal)\s*[:\-]?\s*$/';
    private const AMOUNT_TOTAL_LABEL = '/\b(?:grand\s+total|sub\s*total|total(?:\s+(?:due|amount|payable))?|amount(?:\s+(?:due|paid|payable))?|net\s+(?:total|amount)|balance\s+due|sum\s+of|debited(?:\s+with)?|transfer\s+of)\s*[:\-=]?\s*$/';

    /** A bare number followed by one of these is a quantity, not money: "1,200 bags", "3,000 sq ft". */
    private const QUANTITY_UNITS = '/^\s*(?:sq\.?\s*(?:ft|m)|square|acres?|kgs?|tonnes?|tons?|lit(?:re|er)s?|bags?|pcs|pieces|blocks?|bricks?|m2|m²|met(?:re|er)s?|ft|feet|mm|cm|km|units?|lorr(?:y|ies)|trips?|loads?|trucks?)\b/iu';

    /** Verbs after which a bare number ("need 45000") is money. */
    private const MONEY_VERBS = 'pay|paid|need|needs|costs?|charges?|charged|wants|budget|deposit|price|kulipa|lipa|tunahitaji|nahitaji';

    /**
     * @param  array{
     *   media_type: string|null,   // 'image' | 'video' | 'document' | 'text' | 'audio' | 'sticker' | ... | null
     *   text: string|null,         // message body (if text) or media caption
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

        // 1. Free signals
        if ($mediaType === 'video') {
            return $this->result('progress_video', 1.0, []);
        }

        // 2. Text-only path
        if ($mediaType === 'text' || ($text !== '' && $ocrText === '' && $mediaType === null)) {
            return $this->classifyText($text);
        }

        // Voice notes, stickers, locations, contacts... carry nothing we can file
        if (! in_array($mediaType, ['image', 'document', null], true)) {
            return $this->classifyText($text);
        }

        // 3. Image / document path - combine any caption with OCR text
        $haystack = trim($text . "\n" . $ocrText);

        if ($haystack === '') {
            if ($mediaType === 'document') {
                // PDF/doc we couldn't read - never a site photo, needs a human
                return $this->result('chit_chat', 0.3, []);
            }
            // Image with no OCR text at all → progress photo
            return $this->result('progress_photo', 0.75, []);
        }

        if ($ocrText === '' && $mediaType !== 'document') {
            // Caption only ("Foundation slab done today") - same as a bare photo
            // unless the caption itself talks money.
            $extracted = $this->extract($text);
            if ($extracted['amount'] === null) {
                return $this->result('progress_photo', 0.75, $extracted);
            }
        }

        return $this->classifyExtractedText($haystack, $mediaType);
    }

    private function classifyText(string $text): array
    {
        if ($text === '') {
            return $this->result('chit_chat', 0.9, []);
        }

        $lower = mb_strtolower($text);
        $extracted = $this->extract($text);
        $hasAmount = $extracted['amount'] !== null;

        // Forwarded MPESA / bank SMS. Checked before cost requests because every
        // MPESA confirmation mentions "balance".
        if ($hasAmount && $extracted['reference_number'] && $this->countMatches($lower, self::PAYMENT_KEYWORDS) > 0) {
            return $this->result('payment_sms', 0.9, $extracted);
        }

        if ($hasAmount && $this->countMatches($lower, self::COST_REQUEST_KEYWORDS) > 0) {
            return $this->result('cost_request', 0.85, $extracted);
        }

        if ($hasAmount) {
            // Amount but no explicit "need to pay" - low-confidence cost request
            return $this->result('cost_request', 0.55, $extracted);
        }

        return $this->result('chit_chat', 0.9, []);
    }

    private function classifyExtractedText(string $haystack, ?string $mediaType): array
    {
        $lower = mb_strtolower($haystack);
        $extracted = $this->extract($haystack);
        $hasAmount = $extracted['amount'] !== null;

        // Payment SMS screenshots have very distinctive markers
        $paymentScore = $this->countMatches($lower, self::PAYMENT_KEYWORDS)
            + $this->countMatches($lower, self::BANK_SENDERS)
            + $this->findReference($haystack)[1];

        // "CU INVOICE NO" is printed on every KRA ETR till receipt - it's not an invoice
        $invoiceScore = $this->weightedScore(preg_replace('/\bcu\s+invoice/', 'cu', $lower), self::INVOICE_KEYWORDS);
        $receiptScore = $this->weightedScore($lower, self::RECEIPT_KEYWORDS);

        // Payment SMS wins if 3+ signals present
        if ($paymentScore >= 3 && $hasAmount && $paymentScore >= $receiptScore) {
            $conf = min(0.95, 0.6 + 0.08 * $paymentScore);
            return $this->result('payment_sms', $conf, $extracted);
        }

        // Unpaid-document wording outweighs paid-document wording → invoice
        if ($invoiceScore >= 2 && $invoiceScore > $receiptScore) {
            $conf = min(0.9, 0.5 + 0.08 * $invoiceScore);
            return $this->result('invoice', $conf, $extracted);
        }

        // Receipt wins with receipt keywords + amount
        if ($receiptScore >= 2 && $hasAmount && $receiptScore >= $invoiceScore) {
            $conf = min(0.9, 0.5 + 0.08 * $receiptScore);
            return $this->result('receipt_paper', $conf, $extracted);
        }

        // Single strong signal → medium confidence
        if ($paymentScore >= 1 && $hasAmount && $extracted['reference_number']) {
            return $this->result('payment_sms', 0.65, $extracted);
        }
        if ($invoiceScore >= 1 && $hasAmount) {
            return $this->result('invoice', 0.55, $extracted);
        }
        if ($receiptScore >= 1 && $hasAmount) {
            return $this->result('receipt_paper', 0.55, $extracted);
        }

        // Screenshot of a chat asking for money
        if ($hasAmount && $this->countMatches($lower, self::COST_REQUEST_KEYWORDS) > 0) {
            return $this->result('cost_request', 0.6, $extracted);
        }

        if (! $hasAmount) {
            // Fallback: image with some text but no financial signals → progress photo.
            // A document with no financial signals is not a photo.
            return $mediaType === 'document'
                ? $this->result('chit_chat', 0.4, $extracted)
                : $this->result('progress_photo', 0.65, $extracted);
        }

        // Amount without any classifying signal → low-confidence receipt
        return $this->result('receipt_paper', 0.35, $extracted);
    }

    /**
     * Best-effort field extraction (amount, currency, ref, date, phone, recipient).
     */
    public function extract(string $text): array
    {
        [$amount, $currency] = $this->extractAmount($text);

        $extracted = [
            'amount' => $amount,
            'currency' => $currency,
            'reference_number' => $this->findReference($text)[0],
            'date' => $this->extractDate($text),
            'phone' => null,
            'recipient' => null,
        ];

        // Phone: +254 / 254 / 0 followed by 7XX or 1XX (Safaricom 011x), spaces allowed
        if (preg_match('/(?<![\d+])(?:\+?254\s?|0)[17]\d{2}\s?\d{3}\s?\d{3}(?!\d)/', $text, $m)) {
            $extracted['phone'] = preg_replace('/\s+/', '', $m[0]);
        }

        // Recipient: text after "to " / "kwa " up to the next clause
        if (preg_match('/\b(?:to|kwa)\s+([A-Z][A-Za-z0-9 &\'.,-]{2,60}?)(?=\s+(?i:has\s+been|bank\s+ref|mpesa\s+ref|for|on|tarehe|was)\b|\s*[.,\n]|\s*$)/', $text, $m)) {
            // "sent to JOHN KAMAU 0712345678 on ..." → drop the trailing phone number
            $recipient = trim(preg_replace('/\s+\+?\d[\d\s]{6,}$/', '', $m[1]));
            $extracted['recipient'] = $recipient !== '' ? $recipient : null;
        }

        return $extracted;
    }

    /**
     * Pick the amount that was actually paid / requested out of every
     * money-looking number in the text.
     *
     * Numbers labelled as MPESA balance, transaction cost, daily limit, cash
     * tendered or change are dropped. Numbers labelled as a total win over
     * unlabelled ones. Otherwise the largest remaining number is taken.
     *
     * @return array{0: float|null, 1: string}
     */
    private function extractAmount(string $text): array
    {
        $num = '\d[\d,]*(?:\.\d{1,2})?';
        $candidates = []; // number offset => [value, currency|null, label offset]

        $add = function (string $raw, int $offset, ?int $labelOffset = null, ?string $currency = null, float $multiplier = 1.0) use (&$candidates, $text) {
            $value = (float) str_replace(',', '', rtrim($raw, ',')) * $multiplier;
            if ($value <= 0) return;
            if ($currency === null && preg_match(self::QUANTITY_UNITS, substr($text, $offset + strlen($raw), 20))) return;
            if (isset($candidates[$offset]) && $candidates[$offset]['currency'] !== null) return;
            $candidates[$offset] = ['value' => $value, 'currency' => $currency, 'label_at' => $labelOffset ?? $offset];
        };

        // 1. Currency-prefixed: KES 1,200 / Ksh1200 / Kshs.8500 / Sh 500 / USD 20
        if (preg_match_all('/\b(KES|KSHS|KSH|SHS|SH|USD|UGX|TZS)(?![A-Za-z])\.?\s*(' . $num . ')/i', $text, $mm, PREG_SET_ORDER | PREG_OFFSET_CAPTURE)) {
            foreach ($mm as $m) {
                $cur = strtoupper($m[1][0]);
                $cur = in_array($cur, ['USD', 'UGX', 'TZS'], true) ? $cur : 'KES';
                $add($m[2][0], $m[2][1], $m[0][1], $cur);
            }
        }
        // 2. Thousands-separated numbers anywhere (comma required, so we don't
        //    capture account or phone numbers)
        if (preg_match_all('/(?<![\d,.])(\d{1,3}(?:,\d{3})+(?:\.\d{1,2})?)(?![\d,])/', $text, $mm, PREG_OFFSET_CAPTURE)) {
            foreach ($mm[1] as $m) $add($m[0], $m[1]);
        }
        // 3. Receipt-style decimals: 4350.00
        if (preg_match_all('/(?<![\d,.])(\d{3,}\.\d{2})(?![\d.])/', $text, $mm, PREG_OFFSET_CAPTURE)) {
            foreach ($mm[1] as $m) $add($m[0], $m[1]);
        }
        // 4. Kenyan shilling notation: 15000/= or 15,000/-
        if (preg_match_all('/(?<![\d,.\/])(\d[\d,]*)\s*\/[=-]/', $text, $mm, PREG_OFFSET_CAPTURE)) {
            foreach ($mm[1] as $m) $add($m[0], $m[1]);
        }
        // 5. Shorthand: 50k, 2.5K
        if (preg_match_all('/(?<![\d.,])(\d+(?:\.\d+)?)\s?k(?![a-z])/i', $text, $mm, PREG_OFFSET_CAPTURE)) {
            foreach ($mm[1] as $m) $add($m[0], $m[1], null, null, 1000.0);
        }
        // 6. Bare number straight after a total label: "TOTAL 4350"
        if (preg_match_all('/\b(?:grand\s+total|total|amount\s+due|amount\s+paid)\s*[:\-=]?\s*(\d{3,}(?:\.\d{1,2})?)(?![\d,.])/i', $text, $mm, PREG_OFFSET_CAPTURE)) {
            foreach ($mm[1] as $m) $add($m[0], $m[1]);
        }
        // 7. Bare number after a money verb, one filler word allowed: "need 45000", "pay fundi 15000"
        if (preg_match_all('/\b(?:' . self::MONEY_VERBS . ')\s+(?:[a-z]+\s+)?(\d{3,7})(?![\d,.\/])/i', $text, $mm, PREG_OFFSET_CAPTURE)) {
            foreach ($mm[1] as $m) {
                if (preg_match('/^(19|20)\d{2}$/', $m[0])) continue; // a year, not money
                $add($m[0], $m[1]);
            }
        }

        $labelled = [];
        $other = [];
        foreach ($candidates as $c) {
            $context = $this->labelContext($text, $c['label_at']);
            if (preg_match(self::AMOUNT_EXCLUDE_ANYWHERE, $context) || preg_match(self::AMOUNT_EXCLUDE_LABEL, $context)) {
                continue;
            }
            if (preg_match(self::AMOUNT_TOTAL_LABEL, $context)) {
                $labelled[] = $c;
            } else {
                $other[] = $c;
            }
        }

        $pool = $labelled ?: $other;
        if (! $pool) return [null, 'KES'];

        usort($pool, fn ($a, $b) => $b['value'] <=> $a['value']);

        return [$pool[0]['value'], $pool[0]['currency'] ?? 'KES'];
    }

    /**
     * The words leading up to a number, within the same line / sentence.
     */
    private function labelContext(string $text, int $offset): string
    {
        $before = substr($text, max(0, $offset - 60), min($offset, 60));
        // Cut at the last line break or sentence-ending period (not a decimal point)
        $parts = preg_split('/\n|(?<!\d)\.|\.(?!\d)/', $before);
        return mb_strtolower(end($parts) ?: '');
    }

    /**
     * @return array{0: string|null, 1: int}  reference + signal strength (0-2)
     */
    private function findReference(string $text): array
    {
        // Labelled: "Bank Ref: FTX26251KBTJA", "MPESA REF. UI8SG6DDPR", "Ref No: 123456"
        if (preg_match('/\b(?:bank\s*ref|m-?pesa\s*ref|ref(?:erence)?)(?:\s*(?:no|number|#))?\.?\s*[:#.\-]?\s*((?=[A-Z]*\d)[A-Z0-9]{6,20})\b/i', $text, $m)) {
            return [strtoupper($m[1]), 2];
        }
        // MPESA transaction code opening a confirmation: "SJ12ABC3DE Confirmed."
        if (preg_match('/\b((?=[A-Z]*\d)[A-Z][A-Z0-9]{9})\s*(?:Confirmed|Imethibitishwa)\b/', $text, $m)) {
            return [$m[1], 2];
        }
        // Bank FT reference
        if (preg_match('/\b(FT(?=[A-Z]*\d)[A-Z0-9]{8,15})\b/', $text, $m)) {
            return [$m[1], 2];
        }
        // Bare MPESA-shaped code: 10 chars, starts with a letter, has digits and letters.
        // Weak - plain uppercase words (SHILLINGS, SUBTOTAL) no longer qualify.
        if (preg_match('/\b(?=[A-Z0-9]{10}\b)(?=(?:[A-Z]*\d){2})(?=(?:\d*[A-Z]){4})([A-Z][A-Z0-9]{9})\b/', $text, $m)) {
            return [$m[1], 1];
        }

        return [null, 0];
    }

    private function extractDate(string $text): ?string
    {
        $found = []; // offset => Y-m-d

        // ISO: 2026-09-08
        if (preg_match_all('/(?<!\d)(\d{4})-(\d{1,2})-(\d{1,2})(?!\d)/', $text, $mm, PREG_SET_ORDER | PREG_OFFSET_CAPTURE)) {
            foreach ($mm as $m) {
                $date = $this->normalizeDate("{$m[3][0]}/{$m[2][0]}/{$m[1][0]}");
                if ($date) $found[$m[0][1]] = $date;
            }
        }
        // DD/MM/YYYY, DD-MM-YY, DD.MM.YYYY
        if (preg_match_all('/(?<![\d\/.-])(\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4}|\d{1,2}\.\d{1,2}\.\d{4})(?![\d\/-])/', $text, $mm, PREG_OFFSET_CAPTURE)) {
            foreach ($mm[1] as $m) {
                $date = $this->normalizeDate($m[0]);
                if ($date) $found[$m[1]] = $date;
            }
        }
        // 8 Sep 2026 / 8-Sep-26 / Sep 8, 2026
        if (preg_match_all('/\b(\d{1,2}[\s-]*(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?[\s-]*\d{2,4}|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{1,2},?\s+\d{4})\b/i', $text, $mm, PREG_OFFSET_CAPTURE)) {
            foreach ($mm[1] as $m) {
                $ts = strtotime(str_replace('-', ' ', $m[0]));
                if ($ts) $found[$m[1]] = date('Y-m-d', $ts);
            }
        }

        if (! $found) return null;
        ksort($found);
        return reset($found);
    }

    private function countMatches(string $haystack, array $needles): int
    {
        $count = 0;
        foreach ($needles as $n) {
            if (preg_match($this->keywordPattern($n), $haystack)) $count++;
        }
        return $count;
    }

    private function weightedScore(string $haystack, array $weights): int
    {
        $score = 0;
        foreach ($weights as $kw => $weight) {
            if (preg_match($this->keywordPattern($kw), $haystack)) $score += $weight;
        }
        return $score;
    }

    /**
     * Whole-word, case-insensitive, any whitespace (incl. OCR line breaks) between words.
     */
    private function keywordPattern(string $keyword): string
    {
        $body = preg_replace('/\\\\ /', '\s+', preg_quote(mb_strtolower($keyword), '/'));
        $start = preg_match('/^[\p{L}\p{N}]/u', $keyword) ? '(?<![\p{L}\p{N}])' : '';
        $end = preg_match('/[\p{L}\p{N}]$/u', $keyword) ? '(?![\p{L}\p{N}])' : '';
        return '/' . $start . $body . $end . '/iu';
    }

    private function normalizeDate(string $raw): ?string
    {
        $parts = preg_split('/[\/.-]/', $raw);
        if (! $parts || count($parts) !== 3) return null;
        [$d, $m, $y] = $parts;
        if (strlen($y) === 2) $y = ((int) $y < 50 ? '20' : '19') . $y;
        if (strlen($y) !== 4) return null;
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
