<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateExpenseRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('update', $this->route('expense'));
    }

    public function rules(): array
    {
        return [
            'title' => 'sometimes|required|string|max:255',
            'amount' => 'sometimes|required|numeric|min:0',
            'category' => 'sometimes|required|string',
            'project_id' => 'sometimes|required|exists:projects,id',
            'expense_date' => 'sometimes|required|date',
            'description' => 'nullable|string',
            'payment_method' => 'nullable|string',
        ];
    }
}
