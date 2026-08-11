<?php

namespace App\Traits;

use App\Models\Project;
use Illuminate\Database\Eloquent\Builder;

trait HasProjectScope
{
    /**
     * Scope: projects where the authenticated user is the client.
     */
    public function scopeClientProjects(Builder $query): Builder
    {
        return $query->where('client_id', auth()->id());
    }

    /**
     * Get projects where the authenticated user is the client.
     */
    protected function getClientProjects()
    {
        return Project::where('client_id', auth()->id())->get(['id', 'name']);
    }
}
