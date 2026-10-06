<?php

namespace App\Policies;

use App\Models\Annotation;
use App\Policies\Concerns\AuthorizesOwnedRecord;

class AnnotationPolicy
{
    use AuthorizesOwnedRecord;
}
