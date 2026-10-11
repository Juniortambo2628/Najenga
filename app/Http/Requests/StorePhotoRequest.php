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
            'photos.*' => 'required|image|max:20480',
            'project_id' => 'nullable|exists:projects,id',
        ];
    }
}
