<?php

namespace App\Models\Concerns;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Prunable;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Deleting moves the record to the trash (SoftDeletes): it leaves every list
 * but can be restored, files included. After TRASH_DAYS it is deleted for
 * good by the daily model:prune, and only then are its files removed (media
 * library keeps media while a model is soft-deleted).
 */
trait TrashedForThirtyDays
{
    use Prunable, SoftDeletes;

    public const TRASH_DAYS = 30;

    public function prunable(): Builder
    {
        return static::onlyTrashed()->where('deleted_at', '<=', now()->subDays(self::TRASH_DAYS));
    }
}
