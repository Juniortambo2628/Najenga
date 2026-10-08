<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CommentQueryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'commentable_id' => 'required|integer',
            'commentable_type' => 'required|string',
        ];
    }
}
