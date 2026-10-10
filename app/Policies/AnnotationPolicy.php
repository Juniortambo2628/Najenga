<?php

namespace App\Policies;

use App\Policies\Concerns\AuthorizesOwnedRecord;

class AnnotationPolicy
{
    use AuthorizesOwnedRecord;
}
