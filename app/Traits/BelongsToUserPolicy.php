<?php

namespace App\Traits;

use App\Support\ProjectRole;
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
     * The user's role in the model's project, or null (no project, or not a member).
     */
    protected function projectRole($user, $model): ?string
    {
        return optional($model->project)->roleFor($user);
    }

    /**
     * Owners, managers and editors of the project change every record under
     * it; anyone else only their own, and never as a viewer of its project.
     */
    protected function userCanChange($user, $model): bool
    {
        $role = $this->projectRole($user, $model);

        if (ProjectRole::canEdit($role)) {
            return true;
        }

        return $this->userOwns($user, $model) && $role === null;
    }

    /**
     * Authorize view for the owner and every member of the model's project.
     *
     * Mirrors the lists (scopeVisibleTo), so a direct URL never reveals more
     * than the list already does.
     */
    public function view($user, $model): bool
    {
        return $this->userOwns($user, $model) || $this->projectRole($user, $model) !== null;
    }

    /**
     * Authorize update if the user can change the model (see userCanChange).
     */
    public function update($user, $model): bool
    {
        return $this->userCanChange($user, $model);
    }

    /**
     * Authorize delete if the user can change the model (see userCanChange).
     */
    public function delete($user, $model): bool
    {
        return $this->userCanChange($user, $model);
    }
}
