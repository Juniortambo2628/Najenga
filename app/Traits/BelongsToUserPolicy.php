<?php

namespace App\Traits;

use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

trait BelongsToUserPolicy
{
    use AuthorizesRequests;

    /**
     * Check if the authenticated user owns the model via user_id.
     */
    protected function userOwns($user, $model): bool
    {
        return $model->user_id == $user->id;
    }

    /**
     * Authorize view if user owns the model.
     *
     * Mirrors update() deliberately: DocumentController::index and
     * PhotoController::index both scope to where('user_id', ...), so a direct
     * URL may never reveal more than the list already does.
     */
    public function view($user, $model): bool
    {
        return $this->userOwns($user, $model);
    }

    /**
     * Authorize update if user owns the model.
     */
    public function update($user, $model): bool
    {
        return $this->userOwns($user, $model);
    }

    /**
     * Authorize delete if user owns the model.
     */
    public function delete($user, $model): bool
    {
        return $this->userOwns($user, $model);
    }
}
