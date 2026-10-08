<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreBulkReceiptRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'expenses'   => 'required|array|max:20',
            'expenses.*' => 'required|array',
            'expenses.*.title'           => 'required|string',
            'expenses.*.amount'          => 'nullable|numeric|min:0',
            'expenses.*.expense_date'    => 'required|date',
            'expenses.*.time'            => 'nullable|string',
            'expenses.*.recipient'       => 'nullable|string',
            'expenses.*.payment_method'  => 'nullable|string',
            'expenses.*.reference_number'=> 'nullable|string',
            'expenses.*.purpose'         => 'nullable|string',
            'expenses.*.category'        => 'nullable|string',
            'expenses.*.project_id'      => 'nullable|exists:projects,id',
            'expenses.*.temp_path'       => 'required|string',
        ];
    }
}
