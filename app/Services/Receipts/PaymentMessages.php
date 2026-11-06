<?php

namespace App\Services\Receipts;

/**
 * Payment confirmations (M-PESA, and bank SMS that use the same wording)
 * in a piece of text: one forwarded SMS, or a screenshot of a chat with
 * several of them.
 *
 * Each confirmation opens with its transaction code ("UK1K80CPUM
 * Confirmed.") and runs to the next one. The short chat messages around
 * them ("Fuel", "Transport Truck") say what a payment was for: a label
 * applies to the payments after it, until the next label; a label that
 * starts with "For" ("For Cement and Glue") right after a payment belongs
 * to that payment.
 *
 * OCR gets some characters wrong in each reading of an image, so the text
 * can come with other readings: every field is taken from the first
 * reading where it is valid (a 10-character code, a real date).
 */
class PaymentMessages
{
    /** Opening of an M-PESA confirmation: the code, then "Confirmed". */
    private const OPENING = '/(?<![A-Za-z0-9])([A-Z0-9][A-Z0-9\'‘’`´|]{7,12})\s*[.,:;]?\s*(?:Confirmed|Imethibitishwa)\b/u';

    private const MONEY = '(?:Ksh|KSh|KSH|Kshs|KES)\.?\s?(\d[\d,]*(?:\.\d{1,2})?)';

    /**
     * @param  array<int, string>  $readings  the same text read more than once (first is preferred)
     * @return array<int, array<string, mixed>>  one entry per payment, in order
     */
    public function parse(array $readings): array
    {
        $parsed = array_values(array_filter(array_map(fn ($text) => $this->parseOne((string) $text), $readings)));
        if ($parsed === []) {
            return [];
        }

        // The reading with the most complete payments leads; the others fill gaps.
        usort($parsed, fn ($a, $b) => $this->completeness($b) <=> $this->completeness($a));
        $payments = array_shift($parsed);

        foreach ($parsed as $other) {
            $payments = $this->merge($payments, $other);
        }

        // The same confirmation twice in one image (it scrolled): keep one.
        $seen = [];
        $unique = [];
        foreach ($payments as $payment) {
            $key = $payment['reference_valid'] ? $payment['reference_number'] : null;
            if ($key !== null && isset($seen[$key])) {
                continue;
            }
            if ($key !== null) {
                $seen[$key] = true;
            }
            $unique[] = $payment;
        }

        return array_map(fn ($p) => $this->finish($p), $this->borrowDates($unique));
    }

    /**
     * A payment whose date OCR lost takes the date of the payment next to
     * it when both were made the same minute (two sends to the same person).
     */
    private function borrowDates(array $payments): array
    {
        foreach ($payments as $i => $payment) {
            if ($payment['date'] !== null || $payment['time'] === null) {
                continue;
            }
            foreach ([$i - 1, $i + 1] as $j) {
                $near = $payments[$j] ?? null;
                if ($near && $near['date'] !== null && $near['time'] === $payment['time']) {
                    $payments[$i]['date'] = $near['date'];
                    $payments[$i]['date_borrowed'] = true;
                    break;
                }
            }
        }

        return $payments;
    }

    /**
     * Payments in one reading, with their labels.
     *
     * @return array<int, array<string, mixed>>
     */
    private function parseOne(string $text): array
    {
        $text = str_replace(["\r\n", "\r"], "\n", $text);
        if (!preg_match_all(self::OPENING, $text, $openings, PREG_OFFSET_CAPTURE)) {
            return [];
        }

        // What comes before the first confirmation: chat, and maybe its label.
        $items = $this->labelItems(substr($text, 0, $openings[0][0][1]));

        $count = count($openings[0]);
        for ($i = 0; $i < $count; $i++) {
            $start = $openings[0][$i][1];
            $end = $i + 1 < $count ? $openings[0][$i + 1][1] : strlen($text);
            $block = substr($text, $start, $end - $start);

            [$details, $tail] = $this->splitBlock($block);
            $payment = $this->paymentFrom($openings[1][$i][0], $details);
            if ($payment !== null) {
                $items[] = ['payment' => $payment];
            }
            array_push($items, ...$this->labelItems($tail));
        }

        return $this->assignLabels($items);
    }

    /**
     * A confirmation's own text (up to "on <date> at <time>.") and what
     * follows it before the next one (chat times, labels).
     *
     * @return array{0: string, 1: string}
     */
    private function splitBlock(string $block): array
    {
        if (preg_match('/\bat\s*[^\d\n]{0,3}\d{1,2}\s*[:.°]\s*\d{2}\s*[AaPp]\.?\s*[Mm]\.?[^\n]*/u', $block, $m, PREG_OFFSET_CAPTURE)) {
            // The rest of that line is the chat's own time: not a label.
            $cut = $m[0][1] + strlen($m[0][0]);
            // M-PESA goes on with balance and cost sentences: they belong to it.
            $rest = substr($block, $cut);
            if (preg_match('/^(?:[^\n]*?(?:balance|bal\.|transaction\s+cost|cost,|amount\s+you\s+can|daily\s+limit)[^\n]*\n?)+/i', ltrim($rest), $more)) {
                $cut += strlen($rest) - strlen(ltrim($rest)) + strlen($more[0]);
            }

            return [substr($block, 0, $cut), substr($block, $cut)];
        }

        // No time (cut off, or misread): the confirmation is its first few lines.
        $lines = explode("\n", $block);

        return [implode("\n", array_slice($lines, 0, 5)), implode("\n", array_slice($lines, 5))];
    }

    /** @return array<string, mixed>|null */
    private function paymentFrom(string $rawCode, string $details): ?array
    {
        $flat = trim(preg_replace('/\s+/u', ' ', $details));
        $code = preg_replace('/[^A-Z0-9]/', '', strtoupper($rawCode));

        // Money coming in, or a reversal, isn't something the project paid.
        if (preg_match('/\b(?:you\s+have\s+received|received\s+' . self::MONEY . '|reversal|has\s+been\s+reversed)/i', $flat)) {
            return null;
        }

        $amount = null;
        if (preg_match('/' . self::MONEY . '\s*(?:sent|paid|transferred|withdrawn)/i', $flat, $m)
            || preg_match('/' . self::MONEY . '/i', $flat, $m)) {
            $amount = (float) str_replace(',', '', $m[1]);
        }
        if (!$amount) {
            return null;
        }

        $recipient = null;
        $account = null;
        $phone = null;
        $method = 'mobile_money';

        if (preg_match('/\bsent\s*to\s*(.+?)\s+for\s+account\s+([A-Za-z0-9\-\/]+)/i', $flat, $m)) {
            $recipient = $m[1];
            $account = $m[2];
        } elseif (preg_match('/\b(?:sent|transferred)\s*to\s*(.+?)\s+[o0]n\b/i', $flat, $m)
            || preg_match('/\b(?:sent|transferred)\s*to\s*(.+?)(?:\.|$)/i', $flat, $m)) {
            $recipient = $m[1];
        } elseif (preg_match('/\bpaid\s*to\s*(.+?)\.?\s+[^\w\s]{0,2}\s*[o0]n\b/i', $flat, $m)
            || preg_match('/\bpaid\s*to\s*(.+?)(?:\.\s|$)/i', $flat, $m)) {
            $recipient = $m[1];
        } elseif (preg_match('/\bwithdraw\S*\s+' . self::MONEY . '\s+from\s+(.+?)(?:\s+New|\.\s|$)/i', $flat, $m)) {
            $recipient = $m[2];
            $method = 'cash';
        }

        if ($recipient !== null) {
            if (preg_match('/\s+((?:\+?254|0)\s?[17]\d{2}\s?\d{3}\s?\d{3})\s*$/', $recipient, $pm)) {
                $phone = preg_replace('/\s+/', '', $pm[1]);
                $recipient = substr($recipient, 0, -strlen($pm[0]));
            }
            $recipient = preg_replace('/[^\p{L}\p{N}&\-.\'() ]+/u', ' ', $recipient);
            $recipient = trim(preg_replace('/\s+/', ' ', $recipient), " .,-:");
        }

        return [
            'reference_number' => $code,
            'reference_valid'  => self::validCode($code),
            'amount'           => $amount,
            'recipient'        => $recipient !== '' ? $recipient : null,
            'account'          => $account,
            'phone'            => $phone,
            'date'             => $this->date($flat),
            'time'             => $this->time($flat),
            'payment_method'   => $method,
            'purpose'          => null,
        ];
    }

    /** An M-PESA code: 10 letters and digits, with both. */
    public static function validCode(?string $code): bool
    {
        return is_string($code)
            && preg_match('/^[A-Z0-9]{10}$/', $code)
            && preg_match('/\d/', $code)
            && preg_match('/[A-Z]/', $code);
    }

    private function date(string $flat): ?string
    {
        if (!preg_match('/\b[o0]n\s+(?:[^\d\s]{1,3}\s+)?(\d{1,2})\s*[\/.\-]\s*(\d{1,2})\s*[\/.\-]\s*(\d{2,4})\b/i', $flat, $m)) {
            return null;
        }
        $year = strlen($m[3]) === 2 ? 2000 + (int) $m[3] : (int) $m[3];
        // M-PESA writes day/month/year.
        if (!checkdate((int) $m[2], (int) $m[1], $year)) {
            return null;
        }

        return sprintf('%04d-%02d-%02d', $year, $m[2], $m[1]);
    }

    private function time(string $flat): ?string
    {
        if (!preg_match('/\bat\s*[^\d\s]{0,3}\s?(\d{1,2})\s*[:.°]\s*(\d{2})\s*([AaPp])\.?\s*[Mm]/u', $flat, $m)) {
            return null;
        }
        if ((int) $m[1] < 1 || (int) $m[1] > 12 || (int) $m[2] > 59) {
            return null;
        }

        return sprintf('%d:%s %sM', $m[1], $m[2], strtoupper($m[3]));
    }

    /**
     * The chat messages in a stretch of text that could say what a payment
     * was for: short, no full stop, not WhatsApp's own text.
     *
     * @return array<int, array{label: string, for: bool}>
     */
    private function labelItems(string $text): array
    {
        $items = [];
        foreach (explode("\n", $text) as $line) {
            $label = $this->label($line);
            if ($label !== null) {
                $items[] = ['label' => $label, 'for' => (bool) preg_match('/^for\s/i', $label)];
            }
        }

        return $items;
    }

    private function label(string $line): ?string
    {
        // Chat times ("13:41") and the junk OCR makes of bubble edges.
        $line = preg_replace('/\b\d{1,2}[:.]\d{2}\b(?!\s*[AaPp][Mm])/', ' ', $line);
        $line = trim(preg_replace('/[^\p{L}\p{N}&\'.,\- ]+/u', ' ', $line));
        $words = preg_split('/\s+/', $line, -1, PREG_SPLIT_NO_EMPTY);

        // Drop stray one- or two-letter fragments at either end ("a", "es").
        while ($words && mb_strlen(trim($words[0], '.,\'')) <= 2 && !preg_match('/^(?:&)$/', $words[0])) {
            array_shift($words);
        }
        while ($words && mb_strlen(trim(end($words), '.,\'')) <= 2) {
            array_pop($words);
        }
        $label = trim(implode(' ', $words), " ,-'");

        if ($label === '' || count($words) > 6 || preg_match_all('/\p{L}/u', $label) < 3) {
            return null;
        }
        // Labels are typed with a capital ("Fuel"); OCR junk ("vas") mostly isn't.
        if (!preg_match('/^\p{Lu}/u', $label)) {
            return null;
        }
        // A sentence ("We have boarded.") is chat, not a label.
        if (str_ends_with($label, '.')) {
            return null;
        }
        if (preg_match('/\d{3,}|ksh|kes\b|confirmed|balance|transaction|forwarded|\.pdf|\.jpe?g|\bkb\b|\bmb\b|\bpages?\b|^(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday|today|yesterday)$|deleted|missed|typing|online|encrypted|^you\b/i', $label)) {
            return null;
        }

        return $label;
    }

    /**
     * Give each payment the label that says what it was for.
     *
     * @param  array<int, array<string, mixed>>  $items  labels and payments, in order
     * @return array<int, array<string, mixed>>
     */
    private function assignLabels(array $items): array
    {
        $payments = [];
        $current = null;
        $lastWasPayment = false;

        foreach ($items as $item) {
            if (isset($item['payment'])) {
                $item['payment']['purpose'] = $current;
                $payments[] = $item['payment'];
                $lastWasPayment = true;
                continue;
            }

            if ($item['for'] && $lastWasPayment) {
                // "For Cement and Glue" right after a payment: that payment's.
                $payments[count($payments) - 1]['purpose'] = trim(preg_replace('/^for\s+/i', '', $item['label']));
                $current = null;
            } else {
                $current = trim(preg_replace('/^for\s+/i', '', $item['label']));
            }
            $lastWasPayment = false;
        }

        return $payments;
    }

    /** How much of a reading is usable: payments with a valid code and date count most. */
    private function completeness(array $payments): int
    {
        $score = 0;
        foreach ($payments as $p) {
            $score += 1 + ($p['reference_valid'] ? 2 : 0) + ($p['date'] ? 1 : 0) + ($p['time'] ? 1 : 0) + ($p['recipient'] ? 1 : 0);
        }

        return $score;
    }

    /**
     * Fill what one reading got wrong or missed from another: payments are
     * paired by code, else by amount in order.
     */
    private function merge(array $payments, array $other): array
    {
        $used = [];
        foreach ($payments as &$payment) {
            $match = null;
            foreach ($other as $j => $candidate) {
                if (isset($used[$j])) {
                    continue;
                }
                $sameCode = $payment['reference_valid'] && $candidate['reference_valid'] && $candidate['reference_number'] === $payment['reference_number'];
                if ($sameCode || (abs($candidate['amount'] - $payment['amount']) < 0.01 && (!$payment['reference_valid'] || !$candidate['reference_valid'] || similar_text($payment['reference_number'], $candidate['reference_number']) >= 7))) {
                    $match = $j;
                    break;
                }
            }
            if ($match === null) {
                continue;
            }
            $used[$match] = true;
            $candidate = $other[$match];

            if (!$payment['reference_valid'] && $candidate['reference_valid']) {
                $payment['reference_number'] = $candidate['reference_number'];
                $payment['reference_valid'] = true;
            }
            foreach (['date', 'time', 'recipient', 'account', 'phone', 'purpose'] as $field) {
                if (($payment[$field] ?? null) === null && ($candidate[$field] ?? null) !== null) {
                    $payment[$field] = $candidate[$field];
                }
            }
        }
        unset($payment);

        // Payments only the other reading found.
        foreach ($other as $j => $candidate) {
            if (!isset($used[$j]) && $candidate['reference_valid']) {
                $known = array_filter($payments, fn ($p) => $p['reference_number'] === $candidate['reference_number']);
                if (!$known) {
                    $payments[] = $candidate;
                }
            }
        }

        return $payments;
    }

    private function finish(array $payment): array
    {
        $recipient = $payment['recipient'];
        $purpose = $payment['purpose'] !== null ? ucfirst($payment['purpose']) : null;

        return [
            'title'            => $purpose ?? ($recipient !== null ? self::tidyName($recipient) : 'M-PESA payment'),
            'amount'           => $payment['amount'],
            'currency'         => 'KES',
            'date'             => $payment['date'],
            'time'             => $payment['time'],
            'recipient'        => $recipient !== null ? self::tidyName($recipient) : null,
            'account'          => $payment['account'],
            'phone'            => $payment['phone'],
            'payment_method'   => $payment['payment_method'],
            'reference_number' => $payment['reference_number'],
            'purpose'          => $purpose,
            'category'         => ExpenseCategory::guess($purpose . ' ' . $recipient),
            'source'           => 'mpesa',
            // A code OCR couldn't read cleanly, or no date: someone should look.
            'needs_check'      => !$payment['reference_valid'] || $payment['date'] === null || !empty($payment['date_borrowed']),
        ];
    }

    /** "JOHN NGIGI" → "John Ngigi"; "OILMAK RETAIL LTD - SHELL BUSIA ROAD" keeps LTD. */
    public static function tidyName(string $name): string
    {
        $name = trim(preg_replace('/\s+/', ' ', $name));
        if ($name !== mb_strtoupper($name)) {
            return $name;
        }

        return preg_replace_callback('/\b(LTD|PLC|KCB|NCBA|ABSA|DTB|SACCO|PO|II|III)\b/i', fn ($m) => strtoupper($m[1]), mb_convert_case(mb_strtolower($name), MB_CASE_TITLE));
    }
}
