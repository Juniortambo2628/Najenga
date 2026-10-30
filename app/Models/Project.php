<?php

namespace App\Models;

use App\Models\Concerns\RecordsRevisions;
use App\Models\Concerns\TrashedForThirtyDays;
use App\Support\ProjectRole;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Project extends Model
{
    use HasFactory, RecordsRevisions, TrashedForThirtyDays;

    /** Records under a project, trashed and restored with it. */
    private const CHILDREN = ['photos', 'documents', 'expenses', 'timelines'];

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
        // The client and the assigned manager are always owner members (the
        // manager a co-owner), so the member list is the one list of who is in.
        static::saved(function (Project $project) {
            if ($project->wasChanged('client_id') || $project->wasRecentlyCreated) {
                $project->grantRole($project->client_id, ProjectRole::OWNER);
            }
            if ($project->wasChanged('manager_id') || $project->wasRecentlyCreated) {
                $project->grantRole($project->manager_id, ProjectRole::OWNER);
            }
        });

        // A project's records go to the trash with it and come back with it.
        // Deleted for good (after 30 days in the trash), they go through their
        // models so their files are removed too.
        static::deleting(function (Project $project) {
            foreach (self::CHILDREN as $relation) {
                if ($project->isForceDeleting()) {
                    $project->{$relation}()->withTrashed()->get()->each->forceDelete();
                } else {
                    $project->{$relation}->each->delete();
                }
            }
        });

        static::restoring(function (Project $project) {
            // Only what was trashed along with the project, not records
            // deleted on their own before it.
            $at = $project->deleted_at;
            foreach (self::CHILDREN as $relation) {
                $project->{$relation}()->onlyTrashed()
                    ->whereBetween('deleted_at', [$at->copy()->subMinute(), $at->copy()->addMinute()])
                    ->get()->each->restore();
            }
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

    /** The project's client: its first owner, who can't be removed and alone deletes it or changes co-owners. */
    public function isClient(User $user): bool
    {
        return (int) $this->client_id === (int) $user->id;
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
     * A project's versions belong to its own history; once the row itself is
     * gone (a hard delete), the version can't point at it.
     */
    public function revisionProjectId(): ?int
    {
        return $this->exists ? $this->getKey() : null;
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
     * Make the user a member with at least this role (never demotes).
     */
    public function grantRole(?int $userId, string $role): void
    {
        if (! $userId) {
            return;
        }

        $current = $this->users()->where('users.id', $userId)->value('project_user.role');
        if ($current === null) {
            $this->users()->attach($userId, ['role' => $role, 'accepted_at' => now()]);
        } elseif (array_search($current, ProjectRole::ALL, true) > array_search($role, ProjectRole::ALL, true)) {
            $this->users()->updateExistingPivot($userId, ['role' => $role]);
        }
    }

    public function invitations(): HasMany
    {
        return $this->hasMany(ProjectInvitation::class);
    }

    /**
     * The users that belong to the project.
     */
    public function users(): \Illuminate\Database\Eloquent\Relations\BelongsToMany
    {
        return $this->belongsToMany(User::class)->withPivot('role', 'invited_by', 'invited_at', 'accepted_at')->withTimestamps();
    }
}
