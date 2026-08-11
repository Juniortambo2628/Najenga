<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreBatchExpenseRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'expenses' => 'required|array|max:200',
            'expenses.*.title' => 'required|string|max:255',
            'expenses.*.amount' => 'required|numeric|min:0',
            'expenses.*.category' => 'required|string|max:50',
            'expenses.*.project_id' => 'nullable|exists:projects,id',
            'expenses.*.expense_date' => 'required|date',
            'expenses.*.description' => 'nullable|string',
            'expenses.*.payment_method' => 'nullable|string|max:50',
            'expenses.*.recipient' => 'nullable|string|max:255',
            'expenses.*.reference_number' => 'nullable|string|max:100',
            'expenses.*.purpose' => 'nullable|string',
            'expenses.*.time' => 'nullable|string|max:20',
            'expenses.*.currency' => 'nullable|string|max:3',
            'expenses.*.status' => 'nullable|in:draft,pending,approved,rejected,paid',
        ];
    }
}
