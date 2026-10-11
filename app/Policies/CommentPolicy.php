<?php

namespace App\Policies;

use App\Policies\Concerns\AuthorizesOwnedRecord;

class CommentPolicy
{
    use AuthorizesOwnedRecord;
}
