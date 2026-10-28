<?php

namespace App\Http\Requests;

use App\Models\Project;
use Illuminate\Foundation\Http\FormRequest;

class UpdatePhotoRequest extends FormRequest
{
    public function authorize(): bool
    {
        $photo = $this->route('photo');
        if (! $this->user()->can('update', $photo)) {
            return false;
        }

        // Moving it to another project needs edit rights there too.
        $projectId = $this->input('project_id');
        if ($projectId && (int) $projectId !== (int) $photo->project_id) {
            $project = Project::find($projectId);

            return ! $project || $this->user()->can('update', $project);
        }

        return true;
    }

    public function rules(): array
    {
        return [
            'title' => 'sometimes|string|max:255',
            'location' => 'nullable|string|max:255',
            'project_id' => 'sometimes|exists:projects,id,deleted_at,NULL',
            'description' => 'nullable|string',
        ];
    }
}
