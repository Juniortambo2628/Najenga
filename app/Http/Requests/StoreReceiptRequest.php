<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreReceiptRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title'            => 'required|string|max:255',
            'amount'           => 'nullable|numeric|min:0',
            'expense_date'     => 'required|date',
            'time'             => 'nullable|string|max:20',
            'recipient'        => 'nullable|string|max:255',
            'payment_method'   => 'nullable|string|max:50',
            'reference_number' => 'nullable|string|max:100',
            'purpose'          => 'nullable|string',
            'category'         => 'nullable|string|max:50',
            'project_id'       => 'nullable|exists:projects,id',
            'temp_path'        => 'required|string',
        ];
    }
}
