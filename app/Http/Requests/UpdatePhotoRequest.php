<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePhotoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('update', $this->route('photo'));
    }

    public function rules(): array
    {
        return [
            'title' => 'sometimes|string|max:255',
            'location' => 'nullable|string|max:255',
            'project_id' => 'sometimes|exists:projects,id',
            'description' => 'nullable|string',
        ];
    }
}
