<?php

namespace App\Policies;

use App\Models\Comment;
use App\Policies\Concerns\AuthorizesOwnedRecord;

class CommentPolicy
{
    use AuthorizesOwnedRecord;
}
