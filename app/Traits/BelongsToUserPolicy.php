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
     * Check the user owns the model and is not a viewer of its project.
     */
    protected function userCanChange($user, $model): bool
    {
        return $this->userOwns($user, $model)
            && ! optional($model->project)->isReadOnlyFor($user);
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
     * Authorize update if user owns the model and can edit its project.
     */
    public function update($user, $model): bool
    {
        return $this->userCanChange($user, $model);
    }

    /**
     * Authorize delete if user owns the model and can edit its project.
     */
    public function delete($user, $model): bool
    {
        return $this->userCanChange($user, $model);
    }
}
