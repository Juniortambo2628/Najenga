<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePhotoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'photos.*' => 'required|image|max:20480',
            'project_id' => 'nullable|exists:projects,id',
        ];
    }
}
