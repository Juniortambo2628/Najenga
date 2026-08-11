<?php

namespace App\Policies;

use App\Models\Document;
use App\Models\User;
use App\Traits\BelongsToUserPolicy;

class DocumentPolicy
{
    use BelongsToUserPolicy;
}
