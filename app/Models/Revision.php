<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\MassPrunable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Database\Eloquent\Relations\Relation;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
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

    /** Record types with history, by the short name the API and the UI use. */
    public const TYPES = [
        'project' => Project::class,
        'expense' => Expense::class,
        'receipt' => Receipt::class,
        'document' => Document::class,
        'photo' => Photo::class,
        'milestone' => ProjectTimeline::class,
    ];

    /** The short type name of this version's record (see TYPES). */
    public function type(): ?string
    {
        $class = Relation::getMorphedModel($this->revisionable_type) ?? $this->revisionable_type;

        return array_search($class, self::TYPES, true) ?: null;
    }

    /**
     * The record this version belongs to, trashed or not; null once it is
     * deleted for good.
     */
    public function subject(): ?Model
    {
        $class = self::TYPES[$this->type()] ?? null;

        return $class ? $class::withTrashed()->find($this->revisionable_id) : null;
    }

    /**
     * The fields this version brings back: after the change, or before a
     * deletion. With `$undo`, the fields before the change (undoing it).
     */
    public function snapshot(bool $undo = false): ?array
    {
        return $undo || $this->event === 'deleted' ? $this->before : $this->after;
    }

    public function isRestorable(bool $undo = false): bool
    {
        return $this->type() !== null && $this->snapshot($undo) !== null;
    }

    /**
     * Make the record look as it did in this version: the fields after the
     * change, or for a deletion the record as it was before it. A trashed
     * record is brought back first; one deleted for good is recreated with
     * its old id. Recorded as a "restored" version. With `$undo`, the record
     * goes back to how it was before this change.
     */
    public function restoreVersion(bool $undo = false): Model
    {
        if (! $this->isRestorable($undo)) {
            throw new \RuntimeException('This version cannot be restored.');
        }

        $class = self::TYPES[$this->type()];
        $values = Arr::except($this->snapshot($undo), self::NOISE);

        return DB::transaction(fn () => self::restoring(function () use ($class, $values) {
            $model = $class::withTrashed()->find($this->revisionable_id);

            if (! $model) {
                $model = new $class;
                $model->setRawAttributes($values);
                $model->save();

                return $model;
            }

            // Raw values, as stored: casts (dates, JSON) must not apply twice.
            $model->setRawAttributes(array_merge($model->getAttributes(), Arr::except($values, [$model->getKeyName()])));

            // One save either way, so at most one "restored" version; back from
            // the trash with no field changed, the save alone records none.
            $latest = self::max('id');
            $model->trashed() ? $model->restore() : $model->save();
            if (self::max('id') === $latest) {
                self::create([
                    'revisionable_type' => $model->getMorphClass(),
                    'revisionable_id' => $model->getKey(),
                    'project_id' => $model->revisionProjectId(),
                    'user_id' => auth()->id(),
                    'event' => 'restored',
                    'after' => $model->getAttributes(),
                    'batch' => self::batchId(),
                ]);
            }

            return $model;
        }));
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
