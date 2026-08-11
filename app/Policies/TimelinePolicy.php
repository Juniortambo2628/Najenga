<?php

namespace App\Policies;

use App\Models\ProjectTimeline;
use App\Models\User;
use App\Traits\BelongsToProjectPolicy;

class TimelinePolicy
{
    use BelongsToProjectPolicy;
}
