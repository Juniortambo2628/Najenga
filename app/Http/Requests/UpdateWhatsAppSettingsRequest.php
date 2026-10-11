<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateWhatsAppSettingsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'key' => ['required', 'string', Rule::in([
                'expense_notifications',
                'project_notifications',
                'document_notifications',
            ])],
            'enabled' => ['required', 'boolean'],
        ];
    }
}
