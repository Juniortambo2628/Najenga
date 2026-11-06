<?php

namespace App\Services\Receipts;

use App\Services\MediaClassifier;
use App\Services\ReceiptParser;

/**
 * What an uploaded receipt says: the expenses in it, or the invoice or
 * quotation it is.
 *
 *   payments  M-PESA / bank confirmations (one, or a chat screenshot with
 *             several): one expense each, with the chat label that says
 *             what it was for
 *   flight    an airline booking confirmation: one expense
 *   receipt   a till / paper receipt, or an invoice marked paid: one expense
 *   invoice   an invoice still to be paid: a document, no expense
 *   quote     a quotation / pro forma: a document, no expense
 *   unknown   nothing that looks like money
 *
 * Payment confirmations win over the rest: a chat screenshot often shows
 * the invoice it pays as an attachment ("invoice-INV-00066.pdf").
 */
class ReceiptReader
{
    public function __construct(
        protected PaymentMessages $payments = new PaymentMessages(),
        protected FlightTicket $flights = new FlightTicket(),
        protected BillingDocument $billing = new BillingDocument(),
        protected MediaClassifier $classifier = new MediaClassifier(),
        protected ReceiptParser $parser = new ReceiptParser(),
    ) {
    }

    /**
     * @param  string  $text  the text OCR (or the PDF) gave
     * @param  array<int, string>  $alternatives  other readings of the same image
     * @return array{kind: string, expenses: array<int, array<string, mixed>>, document: array<string, mixed>|null, summary: string}
     */
    public function read(string $text, array $alternatives = []): array
    {
        $readings = array_values(array_filter([$text, ...$alternatives], fn ($t) => trim((string) $t) !== ''));
        if ($readings === []) {
            return $this->result('unknown', [], null, 'No text could be read.');
        }

        $payments = $this->payments->parse($readings);
        if ($payments !== []) {
            $total = array_sum(array_column($payments, 'amount'));
            $summary = count($payments) === 1
                ? 'One payment found.'
                : sprintf('%d payments found, KES %s in all.', count($payments), number_format($total, 2));

            return $this->result('payments', $payments, null, $summary);
        }

        $text = $readings[0];

        if ($this->flights->matches($text)) {
            $ticket = $this->flights->parse($text);

            return $this->result('flight', [$ticket], null, 'Flight ticket: ' . $ticket['title'] . '.');
        }

        $billing = $this->billing->kind($text);
        if ($billing === 'invoice' || $billing === 'quote') {
            $document = $this->billing->parse($text, $billing);
            $what = $billing === 'quote' ? 'quotation' : 'invoice';
            $from = $document['issuer'] ? ' from ' . $document['issuer'] : '';

            return $this->result($billing, [], $document, ucfirst($what) . $from . ' — filed as a document, not an expense, until it is paid.');
        }
        if ($billing === 'paid_invoice') {
            $document = $this->billing->parse($text, 'invoice');

            return $this->result('receipt', [$this->billing->asExpense($document)], null, 'Invoice marked as paid: recorded as an expense.');
        }

        $expense = $this->receipt($text);
        if ($expense === null) {
            return $this->result('unknown', [], null, 'No amount found.');
        }

        return $this->result('receipt', [$expense], null, 'One receipt found.');
    }

    /** A till / paper receipt, or a single bank SMS in another wording. */
    private function receipt(string $text): ?array
    {
        $found = $this->classifier->extract($text);
        if ($found['amount'] === null) {
            return null;
        }
        $parsed = $this->parser->parse($text);
        $merchant = $this->merchant($text) ?? $found['recipient'] ?? $parsed['recipient'];

        return [
            'title'            => $merchant ?? 'Receipt',
            'amount'           => $found['amount'],
            'currency'         => $found['currency'] ?? 'KES',
            'date'             => $found['date'] ?? $parsed['date'],
            'time'             => $parsed['time'],
            'recipient'        => $found['recipient'] ?? $parsed['recipient'] ?? $merchant,
            'account'          => null,
            'phone'            => $found['phone'],
            'payment_method'   => $parsed['payment_method'] ?? 'other',
            'reference_number' => $found['reference_number'] ?? $parsed['reference_number'],
            'purpose'          => null,
            'category'         => ExpenseCategory::guess($text),
            'source'           => 'receipt',
            'needs_check'      => true,
        ];
    }

    /** The business a till receipt is from: an early line naming one. */
    private function merchant(string $text): ?string
    {
        foreach (array_slice(explode("\n", $text), 0, 6) as $line) {
            $line = trim($line);
            if (preg_match('/\b(?:ltd|limited|enterprises?|hardware|supermarket|stores?|traders|suppliers|services|petrol|station|hotel|restaurant)\b/i', $line)
                && preg_match_all('/\p{L}/u', $line) >= 4) {
                return trim(preg_replace('/[^\p{L}\p{N}&\-.\' ]+/u', ' ', $line));
            }
        }

        return null;
    }

    private function result(string $kind, array $expenses, ?array $document, string $summary): array
    {
        return ['kind' => $kind, 'expenses' => array_values($expenses), 'document' => $document, 'summary' => $summary];
    }
}
