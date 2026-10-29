<?php

namespace App\Http\Requests;

use App\Models\Project;
use Illuminate\Foundation\Http\FormRequest;

class UpdateExpenseRequest extends FormRequest
{
    public function authorize(): bool
    {
        $expense = $this->route('expense');
        if (! $this->user()->can('update', $expense)) {
            return false;
        }

        // Moving it to another project needs edit rights there too.
        $projectId = $this->input('project_id');
        if ($projectId && (int) $projectId !== (int) $expense->project_id) {
            $project = Project::find($projectId);

            return $project && $this->user()->can('update', $project);
        }

        return true;
    }

    public function rules(): array
    {
        return [
            'title' => 'sometimes|required|string|max:255',
            'amount' => 'sometimes|required|numeric|min:0',
            'category' => 'sometimes|nullable|string',
            'project_id' => 'sometimes|nullable|exists:projects,id,deleted_at,NULL',
            'expense_date' => 'sometimes|required|date',
            'description' => 'nullable|string',
            'payment_method' => 'nullable|string',
            'recipient' => 'nullable|string|max:255',
            'reference_number' => 'nullable|string|max:255',
            'currency' => 'nullable|string|max:8',
            'purpose' => 'nullable|string',
            'time' => 'nullable|string',
        ];
    }
}
