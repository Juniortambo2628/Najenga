<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateReceiptRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'verification_status' => 'required|in:pending,verified,rejected,auto_verified',
            'needs_verification' => 'boolean',
        ];
    }
}
