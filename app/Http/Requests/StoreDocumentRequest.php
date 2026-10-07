<?php

namespace App\Http\Requests;

use App\Models\Folder;
use App\Models\Project;
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

        $folderId = $this->input('folder_id');

        if ($folderId) {
            $folder = Folder::find($folderId);

            if ($folder && (int) $folder->project_id !== (int) $project->id) {
                return false;
            }
        }

        return true;
    }

    public function rules(): array
    {
        return [
            'documents.*' => 'required|file|max:51200',
            'project_id' => 'nullable|exists:projects,id',
            'folder_id' => 'nullable|exists:folders,id',
        ];
    }
}
