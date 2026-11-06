<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/** Filing an uploaded invoice or quotation under Documents. */
class FileReceiptDocumentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'temp_path'     => ['required', 'string', 'regex:' . StoreReceiptRequest::TEMP_PATH],
            'original_name' => 'nullable|string|max:255',
            'project_id'    => 'required|exists:projects,id,deleted_at,NULL',
            'category'      => 'required|in:invoice,quote',
            'title'         => 'required|string|max:255',
            'description'   => 'nullable|string|max:2000',
            'document_date' => 'nullable|date',
        ];
    }

    public function messages(): array
    {
        return ['project_id.required' => 'Choose the project to file it under.'];
    }
}
