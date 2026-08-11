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
