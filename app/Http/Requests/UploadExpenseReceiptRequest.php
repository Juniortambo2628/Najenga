<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UploadExpenseReceiptRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('update', $this->route('expense'));
    }

    public function rules(): array
    {
        return [
            'receipt' => 'required|file|mimes:jpg,jpeg,png,webp,pdf|max:10240',
        ];
    }
}
