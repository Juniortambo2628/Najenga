<?php

namespace App\Policies;

use App\Models\Folder;
use App\Models\User;
use App\Traits\BelongsToProjectPolicy;

class FolderPolicy
{
    use BelongsToProjectPolicy;
}
