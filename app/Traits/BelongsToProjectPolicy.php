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
