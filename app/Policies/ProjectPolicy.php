<?php

namespace App\Policies;

use App\Models\Project;
use App\Models\User;

class ProjectPolicy
{
    public function view(User $user, Project $project): bool
    {
        return $project->client_id === $user->id
            || $project->users()->where('user_id', $user->id)->exists();
    }

    /**
     * Change the project or write records under it. Viewers are read-only.
     */
    public function update(User $user, Project $project): bool
    {
        return $project->userCanEdit($user);
    }

    /**
     * Add or remove members.
     */
    public function share(User $user, Project $project): bool
    {
        return in_array($project->roleFor($user), Project::MANAGE_ROLES, true);
    }

    public function delete(User $user, Project $project): bool
    {
        return $project->client_id === $user->id;
    }
}
