<?php

namespace App\Policies;

use App\Models\Annotation;
use App\Models\User;

class AnnotationPolicy
{
    public function view(User $user, Annotation $annotation): bool
    {
        return true;
    }

    public function update(User $user, Annotation $annotation): bool
    {
        return $annotation->user_id === $user->id;
    }

    public function delete(User $user, Annotation $annotation): bool
    {
        return $annotation->user_id === $user->id;
    }
}
