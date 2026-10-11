<?php

namespace App\Services;

use App\Models\Expense;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;

/**
 * Reconciles inbound payment signals with existing expenses to prevent
 * double-counting the same real-world payment.
 *
 * A single payment can produce up to 4 inbound WhatsApp messages:
 *   - The bank debit SMS (NCBA)
 *   - The MPESA transfer confirmation
 *   - The supplier invoice
 *   - A pre-existing cost request from the client
 *
 * Matching strategy:
 *   1. Exact reference_number match (highest confidence)
 *   2. Amount + date-within-24h + recipient fuzzy match (falls back)
 *   3. Otherwise a new expense is created.
 */
class PaymentMatcher
{
    private const RECIPIENT_FUZZY_THRESHOLD = 75; // similar_text percent
    private const DATE_WINDOW_HOURS = 36;

    /**
     * @param array{
     *   amount?: float|null,
     *   reference_number?: string|null,
     *   date?: string|null,
     *   recipient?: string|null,
     * } $signal
     */
    public function findMatch(array $signal, int $projectId, int $userId): ?Expense
    {
        $ref = $signal['reference_number'] ?? null;
        if ($ref) {
            $existing = Expense::where('project_id', $projectId)
                ->where('reference_number', $ref)
                ->first();
            if ($existing) return $existing;
        }

        $amount = $signal['amount'] ?? null;
        if (! $amount) return null;

        $date = $signal['date'] ?? null;
        $recipient = $signal['recipient'] ?? null;

        $query = Expense::where('project_id', $projectId)
            ->whereBetween('amount', [$amount * 0.999, $amount * 1.001]);

        if ($date) {
            $center = Carbon::parse($date);
            $query->whereBetween('expense_date', [
                $center->copy()->subHours(self::DATE_WINDOW_HOURS)->toDateString(),
                $center->copy()->addHours(self::DATE_WINDOW_HOURS)->toDateString(),
            ]);
        }

        $candidates = $query->limit(20)->get();
        if ($candidates->isEmpty()) return null;

        if (! $recipient) {
            // Amount + date alone with a single hit is safe; ambiguous otherwise
            return $candidates->count() === 1 ? $candidates->first() : null;
        }

        return $this->pickBestRecipientMatch($candidates, $recipient);
    }

    private function pickBestRecipientMatch(Collection $candidates, string $recipient): ?Expense
    {
        $best = null;
        $bestScore = 0;
        foreach ($candidates as $c) {
            $other = trim((string) ($c->recipient ?? $c->title ?? ''));
            if ($other === '') continue;
            similar_text(mb_strtolower($recipient), mb_strtolower($other), $percent);
            if ($percent > $bestScore) {
                $bestScore = $percent;
                $best = $c;
            }
        }
        return $bestScore >= self::RECIPIENT_FUZZY_THRESHOLD ? $best : null;
    }
}
