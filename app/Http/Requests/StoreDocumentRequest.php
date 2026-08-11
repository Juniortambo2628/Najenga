<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreDocumentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'documents.*' => 'required|file|max:51200',
            'project_id' => 'nullable|exists:projects,id',
        ];
    }
}
