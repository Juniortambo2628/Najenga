<?php

namespace App\Http\Requests;

use App\Models\Project;
use Illuminate\Foundation\Http\FormRequest;

class StoreBulkReceiptRequest extends FormRequest
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
            'expenses'   => 'required|array|max:20',
            'expenses.*' => 'required|array',
            'expenses.*.title'           => 'required|string',
            'expenses.*.amount'          => 'nullable|numeric|min:0',
            'expenses.*.expense_date'    => 'required|date',
            'expenses.*.time'            => 'nullable|string',
            'expenses.*.recipient'       => 'nullable|string',
            'expenses.*.payment_method'  => 'nullable|string',
            'expenses.*.reference_number'=> 'nullable|string',
            'expenses.*.purpose'         => 'nullable|string',
            'expenses.*.category'        => 'nullable|string',
            'expenses.*.project_id'      => 'nullable|exists:projects,id,deleted_at,NULL',
            'expenses.*.temp_path'       => 'required|string',
        ];
    }
}
