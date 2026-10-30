<?php

namespace App\Policies;

use App\Models\User;

class UserPolicy
{
    public function viewAny(User $user): bool
    {
        return (bool) $user->is_superadmin;
    }

    public function view(User $user, User $model): bool
    {
        return (bool) $user->is_superadmin || $user->id === $model->id;
    }

    public function create(User $user): bool
    {
        return (bool) $user->is_superadmin;
    }

    public function update(User $user, User $model): bool
    {
        return (bool) $user->is_superadmin;
    }

    public function delete(User $user, User $model): bool
    {
        return (bool) $user->is_superadmin;
    }
}
