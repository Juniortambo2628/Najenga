<?php

namespace App\Http\Requests;

use App\Models\Project;
use Illuminate\Foundation\Http\FormRequest;

class StoreBatchExpenseRequest extends FormRequest
{
    public function authorize(): bool
    {
        foreach ((array) $this->input('expenses', []) as $row) {
            $projectId = is_array($row) ? ($row['project_id'] ?? null) : null;

            if (! $projectId) {
                continue;
            }

            $project = Project::find($projectId);

            if ($project && ! $this->user()->can('update', $project)) {
                return false;
            }
        }

        return true;
    }

    public function rules(): array
    {
        return [
            'expenses' => 'required|array|max:200',
            'expenses.*.title' => 'required|string|max:255',
            'expenses.*.amount' => 'required|numeric|min:0',
            'expenses.*.category' => 'required|string|max:50',
            'expenses.*.project_id' => 'nullable|exists:projects,id',
            'expenses.*.expense_date' => 'required|date',
            'expenses.*.description' => 'nullable|string',
            'expenses.*.payment_method' => 'nullable|string|max:50',
            'expenses.*.recipient' => 'nullable|string|max:255',
            'expenses.*.reference_number' => 'nullable|string|max:100',
            'expenses.*.purpose' => 'nullable|string',
            'expenses.*.time' => 'nullable|string|max:20',
            'expenses.*.currency' => 'nullable|string|max:3',
            'expenses.*.payment_source' => 'nullable|string|max:32',
            'expenses.*.confidence' => 'nullable|numeric|between:0,1',
            'expenses.*.source_channel' => 'nullable|string|max:32',
            'expenses.*.status' => 'nullable|in:draft,pending,confirmed,approved,rejected,paid',
        ];
    }
}
