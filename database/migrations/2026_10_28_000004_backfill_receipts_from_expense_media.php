<?php

use App\Models\Expense;
use App\Services\ReceiptProcessingService;
use Illuminate\Database\Migrations\Migration;

/**
 * Receipts attached on an expense's page were saved on the expense but never
 * listed under Receipts. Give each of them its receipts row. A receipt that
 * was deleted from Receipts (and sits in the trash) stays deleted.
 */
return new class extends Migration
{
    public function up(): void
    {
        $receipts = app(ReceiptProcessingService::class);

        Expense::withTrashed()
            ->whereHas('media', fn ($q) => $q->where('collection_name', 'receipt'))
            ->whereDoesntHave('receipt', fn ($q) => $q->withTrashed())
            ->chunkById(100, function ($expenses) use ($receipts) {
                foreach ($expenses as $expense) {
                    $receipts->recordReceipt($expense);
                }
            });
    }

    public function down(): void
    {
        // The rows mirror files that exist; nothing to undo.
    }
};
