<?php

namespace App\Models\Concerns;

use App\Models\Revision;
use Illuminate\Database\Eloquent\Relations\MorphMany;

/**
 * Keeps a version history of the model in `revisions` (see Revision): one
 * version per create, update, delete and restore. Rapid edits by one person
 * merge into one version.
 *
 * Models may override revisionProjectId() (which project the version belongs
 * to, for project history) and revisionIgnored() (fields whose changes alone
 * don't warrant a version).
 */
trait RecordsRevisions
{
    public static function bootRecordsRevisions(): void
    {
        static::created(fn ($model) => Revision::record($model, 'created'));
        static::updated(fn ($model) => Revision::record($model, 'updated'));
        static::deleted(fn ($model) => Revision::record($model, 'deleted'));
        // Soft-deletable models: bringing a deleted record back is a version too.
        if (method_exists(static::class, 'restored')) {
            static::restored(fn ($model) => Revision::isRestoring() ? null : Revision::record($model, 'restored'));
        }
    }

    public function revisions(): MorphMany
    {
        return $this->morphMany(Revision::class, 'revisionable')->latest('id');
    }

    /** The project this record belongs to, for the project's history. */
    public function revisionProjectId(): ?int
    {
        return $this->getAttribute('project_id');
    }

    /** Attributes whose changes alone don't warrant a new version. */
    public function revisionIgnored(): array
    {
        return [];
    }
}
