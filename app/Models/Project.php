<?php

namespace App\Models;

use App\Support\ProjectRole;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Project extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'client_id',
        'manager_id',
        'status',
        'start_date',
        'end_date',
        'budget',
        'currency',
        'location',
    ];

    protected static function booted(): void
    {
        static::deleting(function (Project $project) {
            $project->photos->each->delete();
            $project->documents->each->delete();
            $project->expenses->each->delete();
        });
    }

    protected function casts(): array
    {
        return [
            'start_date' => 'date',
            'end_date' => 'date',
            'budget' => 'decimal:2',
        ];
    }

    /**
     * Get the client that owns this project.
     */
    public function client(): BelongsTo
    {
        return $this->belongsTo(User::class, 'client_id');
    }

    /**
     * Get the manager for this project.
     */
    public function manager(): BelongsTo
    {
        return $this->belongsTo(User::class, 'manager_id');
    }

    /**
     * Get all expenses for this project.
     */
    public function expenses(): HasMany
    {
        return $this->hasMany(Expense::class);
    }

    /**
     * Get all photos for this project.
     */
    public function photos(): HasMany
    {
        return $this->hasMany(Photo::class);
    }

    /**
     * Get all annotations for photos and documents in this project.
     */
    public function annotations(): \Illuminate\Database\Eloquent\Relations\MorphMany
    {
        return $this->morphMany(Annotation::class, 'annotatable');
    }

    /**
     * Get all documents for this project.
     */
    public function documents(): HasMany
    {
        return $this->hasMany(Document::class);
    }

    /**
     * Get all folders for this project.
     */
    public function folders(): HasMany
    {
        return $this->hasMany(Folder::class);
    }

    /**
     * Get all timelines for this project.
     */
    public function timelines(): HasMany
    {
        return $this->hasMany(ProjectTimeline::class);
    }
    /**
     * Get all comments for this project.
     */
    public function comments(): \Illuminate\Database\Eloquent\Relations\MorphMany
    {
        return $this->morphMany(Comment::class, 'commentable');
    }

    /**
     * The user's role in this project: 'owner' for the client, the pivot role
     * for a member, null for anyone else.
     */
    public function roleFor(User $user): ?string
    {
        if ((int) $this->client_id === (int) $user->id) {
            return ProjectRole::OWNER;
        }

        return $this->users()->where('users.id', $user->id)->value('project_user.role');
    }

    public function userCanEdit(User $user): bool
    {
        return ProjectRole::canEdit($this->roleFor($user));
    }

    /**
     * True when the user's role here is read-only (a viewer). Such a user may
     * not change records under the project, even ones they created.
     */
    public function isReadOnlyFor(User $user): bool
    {
        $role = $this->roleFor($user);

        return $role !== null && ! ProjectRole::canEdit($role);
    }

    /**
     * Projects the user can see: their own (client) and those they are a member of.
     */
    public function scopeAccessibleBy(Builder $query, User $user): Builder
    {
        return $query->where(fn (Builder $q) => $q
            ->where('client_id', $user->id)
            ->orWhereHas('users', fn (Builder $m) => $m->where('users.id', $user->id)));
    }

    /**
     * The user's role in every project they can see, keyed by project id.
     *
     * @return array<int, string>
     */
    public static function rolesFor(User $user): array
    {
        $roles = static::query()->where('client_id', $user->id)->pluck('id')
            ->mapWithKeys(fn ($id) => [$id => ProjectRole::OWNER])
            ->all();

        foreach ($user->projects()->pluck('project_user.role', 'projects.id') as $id => $role) {
            $roles[$id] ??= $role;
        }

        return $roles;
    }

    /**
     * The users that belong to the project.
     */
    public function users(): \Illuminate\Database\Eloquent\Relations\BelongsToMany
    {
        return $this->belongsToMany(User::class)->withPivot('role')->withTimestamps();
    }
}
