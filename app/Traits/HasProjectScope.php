<?php

namespace App\Traits;

use App\Models\Project;

trait HasProjectScope
{
    /**
     * Get projects where the authenticated user is the client.
     */
    protected function getClientProjects()
    {
        return Project::where('client_id', auth()->id())->get(['id', 'name']);
    }
}
