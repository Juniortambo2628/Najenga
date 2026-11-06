<?php

namespace App\Http\Requests;

use App\Models\Project;
use Illuminate\Foundation\Http\FormRequest;

class StoreReceiptRequest extends FormRequest
{
    /** A file uploaded for reading (ReceiptController::analyze), and nothing else. */
    public const TEMP_PATH = '/^temp_receipts\/[A-Za-z0-9_\-]+(?:\.[A-Za-z0-9]+)?$/';

    public function authorize(): bool
    {
        $projectId = $this->input('project_id');

        if (! $projectId) {
            return true;
        }

        $project = Project::find($projectId);

        return $project && $this->user()->can('update', $project);
    }

    public function rules(): array
    {
        return [
            'title'            => 'required|string|max:255',
            'amount'           => 'nullable|numeric|min:0',
            'expense_date'     => 'required|date',
            'time'             => 'nullable|string|max:20',
            'recipient'        => 'nullable|string|max:255',
            'payment_method'   => 'nullable|string|max:50',
            'reference_number' => 'nullable|string|max:100',
            'purpose'          => 'nullable|string',
            'category'         => 'nullable|string|max:50',
            'project_id'       => 'nullable|exists:projects,id,deleted_at,NULL',
            'temp_path'        => ['required', 'string', 'regex:' . self::TEMP_PATH],
        ];
    }
}
