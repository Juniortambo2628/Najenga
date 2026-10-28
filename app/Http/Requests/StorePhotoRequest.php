<?php

namespace App\Http\Requests;

use App\Models\Project;
use Illuminate\Foundation\Http\FormRequest;

class StorePhotoRequest extends FormRequest
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
            'photos' => 'required|array',
            'photos.*' => 'required|image|max:20480',
            'project_id' => 'nullable|exists:projects,id,deleted_at,NULL',
            'relative_paths' => 'nullable|array',
            'relative_paths.*' => 'nullable|string|max:500',
            'last_modified' => 'nullable|array',
            'last_modified.*' => 'nullable|integer|min:0',
            'taken_at' => 'nullable|array',
            'taken_at.*' => 'nullable|date',
        ];
    }
}
