<?php

namespace App\Traits;

use App\Support\ProjectRole;

trait BelongsToProjectPolicy
{
    /**
     * The user's role in the model's project, or null when not a member.
     */
    protected function projectRole($user, $model): ?string
    {
        return optional($model->project)->roleFor($user);
    }

    /**
     * Authorize view for every member of the parent project.
     *
     * Mirrors ProjectTimelineController::index, which lists the timelines of
     * every project the user can see (Project::accessibleBy).
     */
    public function view($user, $model): bool
    {
        return $this->projectRole($user, $model) !== null;
    }

    /**
     * Authorize update for the project's owner, managers and editors.
     */
    public function update($user, $model): bool
    {
        return ProjectRole::canEdit($this->projectRole($user, $model));
    }

    /**
     * Authorize delete for the project's owner, managers and editors.
     */
    public function delete($user, $model): bool
    {
        return ProjectRole::canEdit($this->projectRole($user, $model));
    }
}
