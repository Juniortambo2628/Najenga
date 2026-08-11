<?php

namespace App\Policies;

use App\Models\Photo;
use App\Models\User;
use App\Traits\BelongsToUserPolicy;

class PhotoPolicy
{
    use BelongsToUserPolicy;
}
