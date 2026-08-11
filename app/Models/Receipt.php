<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Receipt extends Model
{
    use HasFactory;

    protected $fillable = [
        'expense_id',
        'filename',
        'original_name',
        'file_path',
        'file_size',
        'mime_type',
        'ocr_data',
        'ocr_confidence',
        'extracted_text',
        'extracted_amount',
        'extracted_date',
        'extracted_merchant',
        'extracted_receipt_id',
        'ocr_language',
        'ocr_provider',
        'processed_at',
        'amount_confidence',
        'date_confidence',
        'merchant_confidence',
        'receipt_id_confidence',
        'needs_verification',
        'verification_status',
    ];

    protected function casts(): array
    {
        return [
            'ocr_data' => 'json',
            'ocr_confidence' => 'decimal:2',
            'extracted_amount' => 'decimal:2',
            'extracted_date' => 'date',
        ];
    }

    /**
     * Get the expense this receipt belongs to.
     */
    public function expense(): BelongsTo
    {
        return $this->belongsTo(Expense::class);
    }
}
