<?php

namespace App\Services\Receipts;

/**
 * Invoices and quotations: what a supplier asks to be paid (or would
 * charge), not proof of a payment. They're filed as documents, not
 * expenses; the payment that settles one is the expense.
 *
 * An invoice that says it has been paid in full (balance 0, or paid equal
 * to the total) is a receipt after all.
 */
class BillingDocument
{
    private const NUM = '(\d[\d,]*(?:\.\d{1,2})?)';

    private const CURRENCY = '(?:KES|Kshs?|KSH|USD|\$)\.?\s*';

    /** keyword => weight, quotations only. */
    private const QUOTE_WORDS = [
        'quotation' => 3, 'pro-?\s?forma(?:\s+invoice)?' => 3, 'quote\s*(?:no|number|#|ref)' => 3, 'estimate\s*(?:no|number|#)' => 3,
        'valid\s*(?:until|till|for)' => 2, 'validity' => 2, 'quoted' => 1, 'estimate' => 1, '\bquote\b' => 1,
    ];

    /** keyword => weight, invoices. */
    private const INVOICE_WORDS = [
        'tax\s*invoice' => 3, 'invoice\s*(?:no|number|#|date)' => 3, 'bill(?:ed)?\s*to' => 2, 'due\s*date' => 2, '\bdue\s*:' => 2,
        'balance\s*due' => 2, 'amount\s*due' => 2, 'payment\s*terms' => 2, '\bterms\s*:' => 1, '\binvoice\b' => 1,
    ];

    /**
     * 'quote', 'invoice', 'paid_invoice', or null when this isn't one.
     */
    public function kind(string $text): ?string
    {
        $text = $this->withoutTillWords($text);
        $quote = $this->score($text, self::QUOTE_WORDS);
        $invoice = $this->score($text, self::INVOICE_WORDS);

        if ($quote >= 3 && $quote >= $invoice) {
            return 'quote';
        }
        if ($invoice >= 3 || ($invoice >= 2 && $this->total($text) !== null)) {
            return $this->isPaid($text) ? 'paid_invoice' : 'invoice';
        }
        if ($quote >= 2 && $this->total($text) !== null) {
            return 'quote';
        }

        return null;
    }

    /** @return array<string, mixed> */
    public function parse(string $text, string $type): array
    {
        $text = $this->withoutTillWords($text);
        [$total, $currency] = $this->total($text) ?? [null, 'KES'];

        return [
            'type'        => $type === 'quote' ? 'quote' : 'invoice',
            'number'      => $this->number($text, $type),
            'issuer'      => $this->issuer($text),
            'bill_to'     => $this->line($text, 'bill(?:ed)?\s*to|customer|client'),
            'date'        => $this->labelledDate($text, '(?<!due\s)(?:invoice\s*|quote\s*|quotation\s*)?date'),
            'due_date'    => $this->labelledDate($text, 'due(?:\s*date)?'),
            'valid_until' => $this->labelledDate($text, 'valid\s*(?:until|till)'),
            'total'       => $total,
            'paid'        => $this->amountAfter($text, '(?<!un)paid|amount\s*paid'),
            'balance'     => $this->amountAfter($text, 'balance\s*due|amount\s*due|balance'),
            'currency'    => $currency,
            'items'       => $this->items($text),
        ];
    }

    /** A paid invoice as the expense it records. */
    public function asExpense(array $doc): array
    {
        $issuer = $doc['issuer'];

        return [
            'title'            => $issuer ?? 'Invoice',
            'amount'           => $doc['paid'] ?: $doc['total'],
            'currency'         => $doc['currency'],
            'date'             => $doc['date'],
            'time'             => null,
            'recipient'        => $issuer,
            'account'          => null,
            'phone'            => null,
            'payment_method'   => 'other',
            'reference_number' => $doc['number'],
            'purpose'          => $doc['items'] ? implode(', ', array_column($doc['items'], 'description')) : null,
            'category'         => ExpenseCategory::guess($issuer . ' ' . implode(' ', array_column($doc['items'], 'description'))),
            'source'           => 'paid_invoice',
            'needs_check'      => $doc['total'] === null,
        ];
    }

    private function isPaid(string $text): bool
    {
        if (preg_match('/\b(?:paid\s+in\s+full|fully\s+paid|payment\s+received)\b/i', $text)) {
            return true;
        }
        $total = $this->total($text)[0] ?? null;
        $paid = $this->amountAfter($text, '(?<!un)paid|amount\s*paid');
        $balance = $this->amountAfter($text, 'balance\s*due|amount\s*due');

        if ($total && $paid !== null && $paid + 0.01 >= $total) {
            return true;
        }

        return $total && $balance !== null && $balance < 0.01 && ($paid === null || $paid > 0);
    }

    /** "CU INVOICE NO" is on every KRA till receipt; it doesn't make one an invoice. */
    private function withoutTillWords(string $text): string
    {
        return preg_replace('/\bcu\s*invoice\s*(?:no|number)/i', 'CU NO', $text);
    }

    private function score(string $text, array $words): int
    {
        $score = 0;
        foreach ($words as $pattern => $weight) {
            if (preg_match('/' . $pattern . '/i', $text)) {
                $score += $weight;
            }
        }

        return $score;
    }

    /** @return array{0: float, 1: string}|null */
    private function total(string $text): ?array
    {
        foreach (['grand\s*total', 'total\s*(?:amount|due|payable)', 'amount\s*due', 'balance\s*due', 'total'] as $label) {
            if (preg_match('/\b' . $label . '\b\s*[:\-]?\s*(KES|Kshs?|KSH|USD|\$)?\.?\s*' . self::NUM . '/i', $text, $m)) {
                $value = (float) str_replace(',', '', $m[2]);
                if ($value > 0) {
                    return [$value, preg_match('/usd|\$/i', $m[1] ?? '') ? 'USD' : 'KES'];
                }
            }
        }

        return null;
    }

    private function amountAfter(string $text, string $label): ?float
    {
        if (preg_match('/\b(?:' . $label . ')\b\s*[:\-]?\s*(?:' . self::CURRENCY . ')?' . self::NUM . '/i', $text, $m)) {
            return (float) str_replace(',', '', $m[1]);
        }

        return null;
    }

    private function number(string $text, string $type): ?string
    {
        $label = $type === 'quote' ? '(?:quotation|quote|pro-?\s?forma|estimate)' : '(?:tax\s*)?invoice';
        if (preg_match('/\b' . $label . '\s*(?:no\.?|number|#|ref)\s*[:#]?\s*([A-Z0-9][A-Z0-9\/\-]{1,30})/i', $text, $m)) {
            return strtoupper($m[1]);
        }

        return null;
    }

    /**
     * Who sent it: the first line that names a business, else the first line.
     */
    private function issuer(string $text): ?string
    {
        $lines = array_values(array_filter(array_map(fn ($l) => trim(preg_replace('/\s{2,}.*/', '', trim($l))), explode("\n", $text))));
        foreach (array_slice($lines, 0, 8) as $line) {
            if (preg_match('/\b(?:ltd|limited|enterprises?|company|co\.|hardware|supplies|suppliers|traders|contractors|agencies|services|investments|plc|llc|inc)\b/i', $line)
                && !preg_match('/\b(?:bill|invoice\s*no|date|to:)\b/i', $line)) {
                return $line;
            }
        }
        foreach (array_slice($lines, 0, 3) as $line) {
            if (!preg_match('/invoice|quotation|quote|receipt|^\d|date/i', $line) && preg_match_all('/\p{L}/u', $line) >= 3) {
                return $line;
            }
        }

        return null;
    }

    private function line(string $text, string $label): ?string
    {
        if (preg_match('/\b(?:' . $label . ')\s*:?\s*([^\n]+)/i', $text, $m)) {
            $value = trim(preg_replace('/\s{2,}.*/', '', $m[1]));

            return $value !== '' ? $value : null;
        }

        return null;
    }

    private function labelledDate(string $text, string $label): ?string
    {
        $months = 'Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec';
        $patterns = [
            '/\b(?:' . $label . ')\s*:?\s*((?:' . $months . ')[a-z]*\.?\s+\d{1,2},?\s+\d{4})/i',
            '/\b(?:' . $label . ')\s*:?\s*(\d{1,2}\s+(?:' . $months . ')[a-z]*\.?,?\s+\d{4})/i',
            '/\b(?:' . $label . ')\s*:?\s*(\d{4}-\d{1,2}-\d{1,2})/i',
            '/\b(?:' . $label . ')\s*:?\s*(\d{1,2}[\/.\-]\d{1,2}[\/.\-]\d{2,4})/i',
        ];
        foreach ($patterns as $i => $pattern) {
            if (!preg_match($pattern, $text, $m)) {
                continue;
            }
            if ($i === 3) {
                // East African paperwork writes day/month/year.
                [$d, $mo, $y] = preg_split('/[\/.\-]/', $m[1]);
                $y = strlen($y) === 2 ? 2000 + (int) $y : (int) $y;

                return checkdate((int) $mo, (int) $d, $y) ? sprintf('%04d-%02d-%02d', $y, $mo, $d) : null;
            }
            $ts = strtotime(str_replace(',', '', $m[1]));

            return $ts ? date('Y-m-d', $ts) : null;
        }

        return null;
    }

    /**
     * Item lines: a description followed by numbers, the last being its total.
     *
     * @return array<int, array{description: string, quantity: float|null, total: float}>
     */
    private function items(string $text): array
    {
        $items = [];
        foreach (explode("\n", $text) as $line) {
            if (!preg_match('/^\s*([A-Za-z][^\d\n]*?(?:\d+\s*(?:kg|g|l|m|mm|ft|pcs?)\b[^\d\n]*?)?)\s+(\d[\d,]*(?:\.\d+)?)\s+(?:.*\s)?(\d[\d,]*\.\d{2})\s*$/i', $line, $m)) {
                continue;
            }
            $description = trim(preg_replace('/\s*[·•|].*$/u', '', $m[1]));
            if ($description === '' || preg_match('/total|balance|paid|tax|vat|subtotal|description/i', $description)) {
                continue;
            }
            $items[] = [
                'description' => $description,
                'quantity'    => (float) str_replace(',', '', $m[2]),
                'total'       => (float) str_replace(',', '', $m[3]),
            ];
        }

        return $items;
    }
}
