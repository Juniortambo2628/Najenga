<?php

namespace App\Services;

class ReceiptParser
{
    public function parse(string $text): array
    {
        $data = [
            'merchant'         => null,
            'recipient'        => null,
            'date'             => null,
            'time'             => null,
            'total'            => null,
            'reference_number' => null,
            'payment_method'   => null,
            'purpose'          => null,
        ];

        $normalized = str_replace(["\r\n", "\r"], "\n", $text);
        $lines = explode("\n", $normalized);
        $fullText = implode(' ', $lines);

        // 1. Amount: "KES 90,000.00" or "Ksh 218,400.00" or "218400.00 sent to"
        if (preg_match('/(?:Ksh|KES|UGX|USD|\$|EUR|GBP)\s*([\d,]+\.?\d{0,2})/i', $fullText, $m)) {
            $data['total'] = (float) str_replace(',', '', $m[1]);
        } elseif (preg_match('/([\d,]+\.\d{2})\s*(?:sent|paid)\s/i', $fullText, $m)) {
            $data['total'] = (float) str_replace(',', '', $m[1]);
        }

        // 2. Recipient: text after "paid to" or "sent to"
        if (preg_match('/(?:paid|sent)\s+to\s+(.+?)(?:\s*\(|\s+for\s+account|\s+has\s+been|\s+on\s+)/i', $fullText, $m)) {
            $data['recipient'] = trim($m[1]);
        } elseif (preg_match('/(?:paid|sent)\s+to\s+(.+?)(?:\s*,|\s+Ref)/i', $fullText, $m)) {
            $data['recipient'] = trim($m[1]);
        } elseif (preg_match('/(?:paid|sent)\s+to\s+(.+?)$/i', $fullText, $m)) {
            $data['recipient'] = trim($m[1]);
        }

        // 3. Date: DD/MM/YYYY or DD/MM/YY (Kenyan format)
        if (preg_match('/(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/', $fullText, $m)) {
            $parts = preg_split('/[\/\-\.]/', $m[1]);
            if (count($parts) === 3) {
                $day = str_pad($parts[0], 2, '0', STR_PAD_LEFT);
                $month = str_pad($parts[1], 2, '0', STR_PAD_LEFT);
                $year = $parts[2];
                if (strlen($year) === 2) {
                    $year = ((int) $year < 50 ? '20' : '19') . $year;
                }
                if ((int) $month >= 1 && (int) $month <= 12 && (int) $day >= 1 && (int) $day <= 31) {
                    $data['date'] = "{$year}-{$month}-{$day}";
                }
            }
        }

        // 4. Time: "at 08:31 PM" or "20:31" or "03:41 PM"
        if (preg_match('/at\s+(\d{1,2}:\d{2}\s*(?:AM|PM|am|pm))/i', $fullText, $m)) {
            $data['time'] = trim($m[1]);
        } elseif (preg_match('/(\d{1,2}:\d{2}\s*(?:AM|PM|am|pm))/i', $fullText, $m)) {
            $data['time'] = trim($m[1]);
        } elseif (preg_match('/(\d{1,2}:\d{2})(?!\s*[:\-\/])/', $fullText, $m)) {
            $data['time'] = trim($m[1]);
        }

        // 5. Reference: "Ref: UGGSG3I38V" or "ref XXXXXXXX"
        if (preg_match('/ref(?:erence)?[:\s]+([A-Z0-9]{6,20})/i', $fullText, $m)) {
            $data['reference_number'] = strtoupper($m[1]);
        } elseif (preg_match('/\b([A-Z0-9]{10,20})\b/', $fullText, $m)) {
            $data['reference_number'] = $m[1];
        }

        // 6. Payment method
        $lowerText = strtolower($fullText);
        if (str_contains($lowerText, 'cash')) {
            $data['payment_method'] = 'cash';
        } elseif (str_contains($lowerText, 'bank transfer') || str_contains($lowerText, 'bank transfer')) {
            $data['payment_method'] = 'bank_transfer';
        } elseif (str_contains($lowerText, 'card') || str_contains($lowerText, 'visa') || str_contains($lowerText, 'mastercard')) {
            $data['payment_method'] = 'card';
        } elseif (str_contains($lowerText, 'cheque') || str_contains($lowerText, 'check')) {
            $data['payment_method'] = 'check';
        } elseif (str_contains($lowerText, 'm-pesa') || str_contains($lowerText, 'mpesa') || str_contains($lowerText, 'lipa na')) {
            $data['payment_method'] = 'mobile_money';
        } elseif (str_contains($lowerText, 'pay bill') || str_contains($lowerText, 'paybill')) {
            $data['payment_method'] = 'mobile_money';
        } elseif (preg_match('/KES\s+[\d,.]+\s+paid\s+to/i', $fullText)) {
            $data['payment_method'] = 'mobile_money';
        }

        // 7. Purpose: left empty — receipts don't contain purpose info

        // 8. Merchant fallback: use recipient if no merchant found
        if (!$data['merchant'] && $data['recipient']) {
            $data['merchant'] = $data['recipient'];
        }

        return $data;
    }
}
