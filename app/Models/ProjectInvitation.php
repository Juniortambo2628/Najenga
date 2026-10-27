<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Str;

/**
 * An emailed invitation to join a project, for someone who may not have an
 * account yet. The link is a signed URL carrying a random token; only the
 * token's SHA-256 is stored.
 */
class ProjectInvitation extends Model
{
    /** How long an invitation link works. */
    public const VALID_DAYS = 7;

    protected $fillable = [
        'project_id', 'email', 'role', 'token_hash', 'invited_by',
        'expires_at', 'accepted_at', 'accepted_by', 'revoked_at',
    ];

    protected $hidden = ['token_hash'];

    protected function casts(): array
    {
        return [
            'expires_at' => 'datetime',
            'accepted_at' => 'datetime',
            'revoked_at' => 'datetime',
        ];
    }

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function inviter(): BelongsTo
    {
        return $this->belongsTo(User::class, 'invited_by');
    }

    /** Not accepted, not revoked, not expired. */
    public function scopePending(Builder $query): Builder
    {
        return $query->whereNull('accepted_at')->whereNull('revoked_at')->where('expires_at', '>', now());
    }

    public function isPending(): bool
    {
        return ! $this->accepted_at && ! $this->revoked_at && $this->expires_at->isFuture();
    }

    /**
     * Give the invitation a fresh token and expiry; returns the plain token
     * (only ever sent in the email).
     */
    public function refreshToken(): string
    {
        $token = Str::random(48);
        $this->forceFill([
            'token_hash' => hash('sha256', $token),
            'expires_at' => now()->addDays(self::VALID_DAYS),
        ])->save();

        return $token;
    }

    public function matchesToken(?string $token): bool
    {
        return is_string($token) && hash_equals($this->token_hash, hash('sha256', $token));
    }

    public function acceptUrl(string $token): string
    {
        return URL::temporarySignedRoute('invitations.accept', $this->expires_at, [
            'invitation' => $this->id,
            'token' => $token,
        ]);
    }

    public function emailMatches(User $user): bool
    {
        return Str::lower($user->email) === Str::lower($this->email);
    }
}
