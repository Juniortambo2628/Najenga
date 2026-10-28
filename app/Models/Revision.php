<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\MassPrunable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Support\Str;

/**
 * One version of a record: its fields before and after a change, so any
 * version can be shown and brought back. Recorded by the RecordsRevisions
 * trait on projects, expenses, receipts, documents, photos and milestones.
 */
class Revision extends Model
{
    use MassPrunable;

    /** Rapid edits by the same person to the same record merge into one version. */
    public const COALESCE_MINUTES = 10;

    /** Versions older than this are pruned (model:prune). */
    public const KEEP_DAYS = 180;

    /** Columns that never make a change worth a version on their own. */
    public const NOISE = ['created_at', 'updated_at', 'deleted_at'];

    protected $fillable = [
        'revisionable_type', 'revisionable_id', 'project_id', 'user_id',
        'event', 'before', 'after', 'changed', 'batch',
    ];

    protected $casts = [
        'before' => 'array',
        'after' => 'array',
        'changed' => 'array',
    ];

    /** Recording is paused while migrations and seeders run. */
    private static bool $paused = false;

    /** Set while a version is being restored, so its changes are labelled "restored". */
    private static bool $restoring = false;

    public static function pause(): void
    {
        self::$paused = true;
    }

    public static function resume(): void
    {
        self::$paused = false;
    }

    public static function isPaused(): bool
    {
        return self::$paused;
    }

    public static function isRestoring(): bool
    {
        return self::$restoring;
    }

    /**
     * Run `$callback` with every change it makes recorded as "restored".
     *
     * @template T
     *
     * @param  callable(): T  $callback
     * @return T
     */
    public static function restoring(callable $callback): mixed
    {
        self::$restoring = true;
        try {
            return $callback();
        } finally {
            self::$restoring = false;
        }
    }

    public function revisionable(): MorphTo
    {
        return $this->morphTo()->withoutGlobalScopes();
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function prunable(): Builder
    {
        return static::where('created_at', '<', now()->subDays(self::KEEP_DAYS));
    }

    /** Groups every version one request wrote (e.g. a bulk delete). */
    public static function batchId(): string
    {
        $attributes = request()->attributes;
        if (! $attributes->has('revision_batch')) {
            $attributes->set('revision_batch', (string) Str::uuid());
        }

        return $attributes->get('revision_batch');
    }

    /**
     * Record a version of `$model` for `$event` (created, updated, deleted,
     * restored). Returns null when nothing worth a version changed.
     */
    public static function record(Model $model, string $event): ?self
    {
        if (self::$paused) {
            return null;
        }

        $after = $event === 'deleted' ? null : $model->getAttributes();
        $before = match ($event) {
            'created' => null,
            'deleted' => $model->getAttributes(),
            default => $model->getRawOriginal(),
        };

        $changed = null;
        if ($event === 'updated') {
            $ignored = array_merge(self::NOISE, $model->revisionIgnored());
            $changed = array_values(array_diff(array_keys($model->getChanges()), $ignored));
            if (! $changed) {
                return null;
            }
        }

        if (self::$restoring) {
            $event = 'restored';
        }

        $userId = auth()->id();

        if ($event === 'updated' && $userId && ($merged = self::coalesce($model, $userId, $after, $changed))) {
            return $merged;
        }

        return self::create([
            'revisionable_type' => $model->getMorphClass(),
            'revisionable_id' => $model->getKey(),
            'project_id' => $model->revisionProjectId(),
            'user_id' => $userId,
            'event' => $event,
            'before' => $before,
            'after' => $after,
            'changed' => $changed,
            'batch' => self::batchId(),
        ]);
    }

    /** Fold a quick follow-up edit into the same person's previous version of the record. */
    private static function coalesce(Model $model, int $userId, array $after, array $changed): ?self
    {
        $latest = self::where('revisionable_type', $model->getMorphClass())
            ->where('revisionable_id', $model->getKey())
            ->latest('id')
            ->first();

        if (! $latest || $latest->event !== 'updated' || (int) $latest->user_id !== $userId
            || $latest->created_at->lt(now()->subMinutes(self::COALESCE_MINUTES))) {
            return null;
        }

        $latest->after = $after;
        $latest->changed = array_values(array_unique(array_merge($latest->changed ?? [], $changed)));
        $latest->save();

        return $latest;
    }

    /** The changed fields with short before/after values, for the history list. */
    public function diff(): array
    {
        $before = $this->before ?? [];
        $after = $this->after ?? [];
        $short = fn ($value) => $value === null ? null : Str::limit(is_scalar($value) ? (string) $value : json_encode($value), 140);

        return collect($this->changed ?? [])
            ->map(fn ($field) => ['field' => $field, 'before' => $short($before[$field] ?? null), 'after' => $short($after[$field] ?? null)])
            ->all();
    }
}
