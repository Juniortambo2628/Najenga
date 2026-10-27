<?php

namespace App\Models;

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
     * Project roles that may change the project and the records under it.
     * Viewers can read and comment only.
     */
    public const EDIT_ROLES = ['owner', 'manager', 'editor'];

    /**
     * Project roles that may add or remove members.
     */
    public const MANAGE_ROLES = ['owner', 'manager'];

    /**
     * The user's role in this project: 'owner' for the client, the pivot role
     * for a member, null for anyone else.
     */
    public function roleFor(User $user): ?string
    {
        if ((int) $this->client_id === (int) $user->id) {
            return 'owner';
        }

        return $this->users()->where('user_id', $user->id)->value('role');
    }

    public function userCanEdit(User $user): bool
    {
        return in_array($this->roleFor($user), self::EDIT_ROLES, true);
    }

    /**
     * True when the user's role here is read-only (a viewer). Such a user may
     * not change records under the project, even ones they created.
     */
    public function isReadOnlyFor(User $user): bool
    {
        $role = $this->roleFor($user);

        return $role !== null && ! in_array($role, self::EDIT_ROLES, true);
    }

    /**
     * The users that belong to the project.
     */
    public function users(): \Illuminate\Database\Eloquent\Relations\BelongsToMany
    {
        return $this->belongsToMany(User::class)->withPivot('role')->withTimestamps();
    }
}
