<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreExpenseRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => 'required|string|max:255',
            'amount' => 'required|numeric|min:0',
            'category' => 'required|string',
            'project_id' => 'required|exists:projects,id',
            'expense_date' => 'required|date',
            'description' => 'nullable|string',
            'payment_method' => 'nullable|string',
        ];
    }
}
