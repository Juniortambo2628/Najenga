<?php

namespace App\Services\Receipts;

/**
 * The expense category (resources/js/Config/expenses.js) words on a
 * receipt point to: "Fuel" or a petrol station → Transport, "cement" →
 * Materials. Materials when nothing does, as the upload form always did.
 */
final class ExpenseCategory
{
    /** category => words (whole words, any case). First match wins. */
    private const WORDS = [
        'Transport'   => ['fuel', 'petrol', 'diesel', 'shell', 'rubis', 'oilmak', 'total energies', 'totalenergies', 'transport', 'truck', 'lorry', 'delivery', 'fare', 'taxi', 'uber', 'bolt', 'matatu', 'boda', 'flight', 'flights', 'airline', 'jambojet', 'kenya airways', 'safarilink', 'skyward', 'airkenya', 'bus', 'parking', 'toll', 'travel'],
        'Labor'       => ['fundi', 'fundis', 'labour', 'labor', 'wages', 'wage', 'casual', 'casuals', 'mason', 'masons', 'carpenter', 'plumber', 'electrician', 'painter', 'welder', 'workers', 'salary', 'payroll'],
        'Equipment'   => ['hire', 'rental', 'mixer', 'generator', 'excavator', 'scaffold', 'scaffolding', 'tools', 'equipment', 'machine', 'vibrator'],
        'Utilities'   => ['kplc', 'token', 'tokens', 'electricity', 'water bill', 'nairobi water', 'internet', 'airtime', 'bundles'],
        'Permits'     => ['permit', 'permits', 'approval', 'nema', 'nca', 'county', 'licence', 'license', 'inspection'],
        'Materials'   => ['cement', 'glue', 'sand', 'ballast', 'stone', 'stones', 'blocks', 'bricks', 'timber', 'steel', 'rebar', 'nails', 'paint', 'tiles', 'gypsum', 'gyproc', 'hardware', 'plumbing', 'pipes', 'roofing', 'mabati', 'iron sheets', 'wire', 'aggregate', 'concrete', 'materials'],
        'General'     => ['accommodation', 'hotel', 'lodging', 'lodge', 'airbnb', 'meals', 'food', 'lunch', 'dinner', 'breakfast'],
    ];

    public static function guess(?string $text, string $fallback = 'Materials'): string
    {
        $text = mb_strtolower((string) $text);
        foreach (self::WORDS as $category => $words) {
            foreach ($words as $word) {
                if (preg_match('/(?<![\p{L}\p{N}])' . preg_quote($word, '/') . '(?![\p{L}\p{N}])/u', $text)) {
                    return $category;
                }
            }
        }

        return $fallback;
    }
}
