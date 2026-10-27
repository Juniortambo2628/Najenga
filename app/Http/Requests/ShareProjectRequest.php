<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ShareProjectRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('share', $this->route('project'));
    }

    public function rules(): array
    {
        return [
            'email' => 'required|email|exists:users,email',
            'role' => 'in:viewer,editor',
        ];
    }
}
