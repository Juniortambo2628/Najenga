<?php

namespace App\Traits;

use App\Models\Project;
use App\Support\ProjectRole;

trait HasProjectScope
{
    /**
     * Projects the authenticated user can see (their own and those they are a
     * member of), each with the user's role in it.
     */
    protected function getClientProjects()
    {
        $user = auth()->user();
        $roles = Project::rolesFor($user);

        return Project::accessibleBy($user)
            ->orderBy('name')
            ->get(['id', 'name'])
            ->map(fn (Project $project) => [
                'id' => $project->id,
                'name' => $project->name,
                'role' => $roles[$project->id] ?? null,
            ])
            ->values();
    }

    /**
     * The projects a create or edit form may file a record under: those
     * where the user is owner, manager or editor (not a viewer).
     */
    protected function getEditableProjects()
    {
        return $this->getClientProjects()
            ->filter(fn (array $project) => ProjectRole::canEdit($project['role']))
            ->values();
    }
}
