<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class MatchReceiptRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'reference_number' => 'required|string',
            'date' => 'nullable|date',
            'time' => 'nullable|string',
        ];
    }
}
