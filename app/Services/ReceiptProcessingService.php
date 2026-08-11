<?php

namespace App\Services;

use App\Models\Expense;
use App\Models\User;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class ReceiptProcessingService
{
    public function __construct(
        protected OcrService $ocr,
    ) {
    }

    public function processReceiptFromUrl(string $url, User $user, ?string $notifyCallback = null): ?Expense
    {
        try {
            $contents = file_get_contents($url);
            $name = 'receipt_' . time() . '_' . rand(1000, 9999) . '.jpg';
            $path = 'receipts/' . $name;
            Storage::put($path, $contents);

            $fullPath = storage_path('app/' . $path);
            $result = $this->ocr->extractText($fullPath);

            if (!($result['success'] ?? false)) {
                Log::error('OCR failed for receipt: ' . ($result['message'] ?? 'unknown'));
                return null;
            }

            $text = $result['text'] ?? '';
            $data = \App\Http\Controllers\Api\ReceiptController::parseReceiptText($text);

            return $this->createExpenseFromData($user, $data, $path);
        } catch (\Exception $e) {
            Log::error("Receipt processing error: " . $e->getMessage());
            return null;
        }
    }

    public function createExpenseFromData(User $user, array $data, ?string $receiptPath = null): Expense
    {
        return Expense::create([
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
    }
}
