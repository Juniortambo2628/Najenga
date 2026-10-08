<?php

namespace App\Http\Requests;

use App\Models\Project;
use App\Rules\FolderInProject;
use Illuminate\Foundation\Http\FormRequest;

class StoreDocumentRequest extends FormRequest
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

        if (! $this->user()->can('update', $project)) {
            return false;
        }

        return FolderInProject::matches($this->input('folder_id'), $project->id);
    }

    public function rules(): array
    {
        return [
            'documents.*' => 'required|file|max:51200',
            'project_id' => 'nullable|exists:projects,id',
            'folder_id' => ['nullable', 'exists:folders,id', new FolderInProject($this->input('project_id'))],
        ];
    }
}
