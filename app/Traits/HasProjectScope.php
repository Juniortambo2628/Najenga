<?php

namespace App\Traits;

use App\Models\Project;

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
}
