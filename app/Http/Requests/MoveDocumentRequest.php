<?php

namespace App\Http\Requests;

use App\Rules\FolderInProject;
use Illuminate\Foundation\Http\FormRequest;

class MoveDocumentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('update', $this->route('document'));
    }

    public function rules(): array
    {
        return [
            'folder_id' => ['nullable', 'exists:folders,id', new FolderInProject($this->route('document')->project_id)],
        ];
    }
}
