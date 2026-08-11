<?php

namespace App\Traits;

trait HasPolymorphicType
{
    /**
     * Resolve a model class from a short type string.
     */
    protected function getModelClass(string $type): ?string
    {
        return match ($type) {
            'project'  => \App\Models\Project::class,
            'photo'    => \App\Models\Photo::class,
            'document' => \App\Models\Document::class,
            default    => null,
        };
    }
}
