<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AnalyzeBulkReceiptRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'receipts'   => 'required|array|max:20',
            'receipts.*' => 'required|file|mimes:jpg,jpeg,png,pdf|max:102400',
        ];
    }
}
