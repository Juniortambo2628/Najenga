<?php

namespace App\Traits;

use App\Models\Project;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;

/**
 * For records that belong to a user and, optionally, a project: everyone in
 * the project sees the project's records, whoever added them.
 */
trait VisibleToProjectMembers
{
    /**
     * Records the user can see: their own, and every record under a project
     * they own or are a member of.
     */
    public function scopeVisibleTo(Builder $query, User $user): Builder
    {
        return $query->where(fn (Builder $q) => $q
            ->where($this->qualifyColumn('user_id'), $user->id)
            ->orWhereIn($this->qualifyColumn('project_id'), Project::accessibleBy($user)->select('id')));
    }
}
