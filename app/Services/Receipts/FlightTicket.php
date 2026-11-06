<?php

namespace App\Services\Receipts;

/**
 * An airline's booking confirmation or e-ticket (Jambojet, Kenya Airways,
 * Safarilink…): one expense for what was paid, with the booking reference,
 * the route and the flights.
 */
class FlightTicket
{
    private const AIRLINES = [
        'Jambojet', 'Kenya Airways', 'Safarilink', 'Skyward Express', 'AirKenya', 'Air Kenya', 'Fly540',
        'Ethiopian Airlines', 'RwandAir', 'Uganda Airlines', 'Air Tanzania', 'Precision Air', 'Qatar Airways',
        'Emirates', 'Turkish Airlines', 'KLM', 'British Airways', 'flydubai', 'Airlink', 'Kenya Airways',
    ];

    private const MONTHS = 'Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?';

    private const CURRENCY = '(KES|Ksh|KSH|USD|US\$|\$)';

    public function matches(string $text): bool
    {
        $airline = $this->airline($text) !== null || preg_match('/\b(?:flight|airline|boarding\s*pass)\b/i', $text);
        $booking = preg_match('/\b(?:PNR|booking\s*(?:reference|ref|code)|e-?ticket|itinerary|reservation\s*(?:code|number))\b/i', $text);

        return $airline && $booking && $this->total($text) !== null;
    }

    /** @return array<string, mixed> */
    public function parse(string $text): array
    {
        $airline = $this->airline($text);
        [$total, $currency] = $this->total($text) ?? [null, 'KES'];
        $routes = $this->routes($text);
        $flights = $this->flights($text);
        $travelDates = $this->travelDates($text);

        $route = $this->routeLabel($routes);
        $purpose = implode(', ', array_filter([
            $route ? 'Flights ' . $route : 'Flights',
            $travelDates ? $this->dateRange($travelDates) : null,
        ])) . ($flights ? ' (' . implode(', ', $flights) . ')' : '');

        return [
            'title'            => trim(($airline ?? 'Flight') . ' ' . ($route ?? 'tickets')),
            'amount'           => $total,
            'currency'         => $currency,
            'date'             => $this->paymentDate($text) ?? ($travelDates[0] ?? null),
            'time'             => null,
            'recipient'        => $airline,
            'account'          => null,
            'phone'            => null,
            'payment_method'   => $this->paymentMethod($text),
            'reference_number' => $this->bookingReference($text),
            'purpose'          => $purpose,
            'category'         => 'Transport',
            'source'           => 'flight',
            'needs_check'      => $total === null,
        ];
    }

    private function airline(string $text): ?string
    {
        foreach (self::AIRLINES as $name) {
            if (preg_match('/' . str_replace('\ ', '\s*', preg_quote($name, '/')) . '/i', $text)) {
                return $name;
            }
        }
        if (preg_match('/travell?ing\s+with\s+([A-Z][\w\-]+(?:\s+[A-Z][\w\-]+)?)/', $text, $m)) {
            return $m[1];
        }

        return null;
    }

    /** @return array{0: float, 1: string}|null */
    private function total(string $text): ?array
    {
        $num = '(\d[\d,]*(?:\.\d{1,2})?)';
        // A labelled total: "Total Paid: KES 35,100", "Amount paid KES 12,500.00".
        foreach (['total\s*paid', 'amount\s*paid', 'total\s*amount', 'grand\s*total', 'total\s*fare', 'total\s*price', 'total'] as $label) {
            if (preg_match('/\b' . $label . '\b\s*[:\-]?\s*' . self::CURRENCY . '\s*' . $num . '/i', $text, $m)) {
                return [(float) str_replace(',', '', $m[2]), $this->currency($m[1])];
            }
        }
        // Columns read apart (the label far from its figure): the largest figure.
        if (preg_match_all('/' . self::CURRENCY . '\s*' . $num . '/i', $text, $mm, PREG_SET_ORDER)) {
            usort($mm, fn ($a, $b) => (float) str_replace(',', '', $b[2]) <=> (float) str_replace(',', '', $a[2]));

            return [(float) str_replace(',', '', $mm[0][2]), $this->currency($mm[0][1])];
        }

        return null;
    }

    private function currency(string $raw): string
    {
        return in_array(strtoupper($raw), ['USD', 'US$', '$'], true) ? 'USD' : 'KES';
    }

    private function bookingReference(string $text): ?string
    {
        if (preg_match('/(?:PNR|booking\s*(?:reference|ref|code)|reservation\s*(?:code|number)|confirmation\s*(?:code|number))\s*[:\/#]?\s*(?:PNR)?\s*[:#]?\s*([A-Z0-9]{6})(?![A-Za-z0-9])/i', $text, $m)) {
            return strtoupper($m[1]);
        }

        return null;
    }

    /** @return array<int, array{0: string, 1: string}> airport code pairs, in order */
    private function routes(string $text): array
    {
        $routes = [];
        if (preg_match_all('/\b([A-Z]{3})\s*(?:-|–|—|→|>|to)\s*([A-Z]{3})\b/', $text, $mm, PREG_SET_ORDER)) {
            foreach ($mm as $m) {
                if (in_array($m[1], ['KES', 'USD', 'EUR'], true) || in_array($m[2], ['KES', 'USD', 'EUR'], true) || $m[1] === $m[2]) {
                    continue;
                }
                $routes[$m[1] . '-' . $m[2]] = [$m[1], $m[2]];
            }
        }

        return array_values($routes);
    }

    private function routeLabel(array $routes): ?string
    {
        if (!$routes) {
            return null;
        }
        [$from, $to] = $routes[0];
        if (count($routes) >= 2 && $routes[1] === [$to, $from]) {
            return "{$from} ⇄ {$to}";
        }

        return implode(', ', array_map(fn ($r) => "{$r[0]} → {$r[1]}", $routes));
    }

    /** @return array<int, string> */
    private function flights(string $text): array
    {
        preg_match_all('/\bflight\s*(?:no\.?|number|#)?\s*:?\s*([A-Z0-9]{2}\s?\d{2,4})\b/i', $text, $mm);

        return array_values(array_unique(array_map(fn ($f) => strtoupper(str_replace(' ', '', $f)), $mm[1] ?? [])));
    }

    /** @return array<int, string> Y-m-d, in order */
    private function travelDates(string $text): array
    {
        $dates = [];
        // "Friday 30, October 2026" / "30 Oct 2026", but not the payment date.
        if (preg_match_all('/(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun)[a-z]*\s*(\d{1,2}),?\s*(' . self::MONTHS . ')\s*,?\s*(\d{4})/i', $text, $mm, PREG_SET_ORDER)) {
            foreach ($mm as $m) {
                // The line it's on, up to the date: "Payment Date   Thursday 29 October".
                $at = strpos($text, $m[0]);
                $lineStart = strrpos(substr($text, 0, $at), "\n");
                $context = substr($text, $lineStart === false ? 0 : $lineStart, $at - ($lineStart === false ? 0 : $lineStart));
                if (preg_match('/payment\s*date|issued|booked|purchase/i', $context)) {
                    continue;
                }
                if ($date = $this->toDate($m[1], $m[2], $m[3])) {
                    $dates[] = $date;
                }
            }
        }

        return array_values(array_unique($dates));
    }

    private function paymentDate(string $text): ?string
    {
        if (preg_match('/(?:payment|booking|purchase|issue)\s*date[^0-9\n]{0,30}?(\d{1,2})\s*(' . self::MONTHS . ')\s*,?\s*(\d{4})/i', $text, $m)) {
            return $this->toDate($m[1], $m[2], $m[3]);
        }
        if (preg_match('/(?:payment|booking|purchase|issue)\s*date[^0-9\n]{0,30}?(' . self::MONTHS . ')\s*(\d{1,2}),?\s*(\d{4})/i', $text, $m)) {
            return $this->toDate($m[2], $m[1], $m[3]);
        }

        return null;
    }

    private function toDate(string $day, string $month, string $year): ?string
    {
        $ts = strtotime("{$day} {$month} {$year}");

        return $ts ? date('Y-m-d', $ts) : null;
    }

    private function dateRange(array $dates): string
    {
        $first = strtotime($dates[0]);
        $last = strtotime(end($dates));
        if ($first === $last) {
            return date('j M Y', $first);
        }

        return date('Y', $first) === date('Y', $last)
            ? date('j M', $first) . ' – ' . date('j M Y', $last)
            : date('j M Y', $first) . ' – ' . date('j M Y', $last);
    }

    private function paymentMethod(string $text): string
    {
        return match (true) {
            (bool) preg_match('/\b(?:visa|mastercard|master\s*card|amex|credit\s*card|debit\s*card|card)\b/i', $text) => 'card',
            (bool) preg_match('/\bm-?pesa\b/i', $text) => 'mobile_money',
            (bool) preg_match('/\bbank\s*transfer\b/i', $text) => 'bank_transfer',
            default => 'other',
        };
    }
}
