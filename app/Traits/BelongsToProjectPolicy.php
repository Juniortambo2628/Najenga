<?php

namespace App\Traits;

trait BelongsToProjectPolicy
{
    /**
     * Check if the user is the client of the parent project.
     */
    protected function userIsProjectClient($user, $model): bool
    {
        return (int) optional($model->project)->client_id === (int) $user->id;
    }

    /**
     * Authorize view if user is the project client.
     *
     * Mirrors update() deliberately: ProjectTimelineController::index scopes
     * with whereHas('project', client_id = user), so a direct URL may never
     * reveal more than the list already does.
     */
    public function view($user, $model): bool
    {
        return $this->userIsProjectClient($user, $model);
    }

    /**
     * Authorize update if user is the project client.
     */
    public function update($user, $model): bool
    {
        return $this->userIsProjectClient($user, $model);
    }

    /**
     * Authorize delete if user is the project client.
     */
    public function delete($user, $model): bool
    {
        return $this->userIsProjectClient($user, $model);
    }
}
