<?php

namespace App\Http\Requests;

use App\Models\Project;
use Illuminate\Foundation\Http\FormRequest;

class StoreExpenseRequest extends FormRequest
{
    public function authorize(): bool
    {
        $projectId = $this->input('project_id');

        if (! $projectId) {
            return true;
        }

        $project = Project::find($projectId);

        if (! $project) {
            return true;
        }

        return $this->user()->can('update', $project);
    }

    public function rules(): array
    {
        return [
            'title' => 'required|string|max:255',
            'amount' => 'required|numeric|min:0',
            'category' => 'required|string',
            'project_id' => 'nullable|exists:projects,id,deleted_at,NULL',
            'expense_date' => 'required|date',
            'description' => 'nullable|string',
            'payment_method' => 'nullable|string',
        ];
    }
}
