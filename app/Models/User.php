<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Relations\HasMany;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'username',
        'email',
        'password',
        'first_name',
        'last_name',
        'phone',
        'role',
        'status',
        'profile_image',
        'telegram_chat_id',
        'whatsapp_wa_id',
        'whatsapp_verified_at',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
        'two_factor_secret',
        'two_factor_recovery_codes',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'whatsapp_verified_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_secret' => 'encrypted',
            'two_factor_recovery_codes' => 'encrypted',
            'two_factor_confirmed_at' => 'datetime',
        ];
    }

    /**
     * Whether the user has completed two-factor setup.
     */
    public function hasEnabledTwoFactorAuthentication(): bool
    {
        return ! is_null($this->two_factor_secret) && ! is_null($this->two_factor_confirmed_at);
    }

    /**
     * Return the recovery codes as an array, one per line.
     *
     * @return array<int, string>
     */
    public function recoveryCodesArray(): array
    {
        if (! $this->two_factor_recovery_codes) {
            return [];
        }

        return json_decode($this->two_factor_recovery_codes, true) ?: [];
    }

    /**
     * Get the user's full name.
     */
    public function getNameAttribute(): string
    {
        return "{$this->first_name} {$this->last_name}";
    }

    /**
     * Projects owned by this client.
     */
    public function clientProjects(): HasMany
    {
        return $this->hasMany(Project::class, 'client_id');
    }

    /**
     * Projects managed by this user.
     */
    public function managedProjects(): HasMany
    {
        return $this->hasMany(Project::class, 'manager_id');
    }

    /**
     * Get all expenses created by the user.
     */
    public function expenses(): HasMany
    {
        return $this->hasMany(Expense::class);
    }

    /**
     * Get all photos uploaded by the user.
     */
    public function photos(): HasMany
    {
        return $this->hasMany(Photo::class);
    }

    public function conversations()
    {
        return $this->belongsToMany(Conversation::class)->withTimestamps();
    }

    /**
     * Get all documents uploaded by the user.
     */
    public function documents(): HasMany
    {
        return $this->hasMany(Document::class);
    }

    /**
     * Get the activity logs for the user.
     */
    public function activityLogs(): HasMany
    {
        return $this->hasMany(ActivityLog::class);
    }
    /**
     * The projects that belong to the user.
     */
    public function projects(): \Illuminate\Database\Eloquent\Relations\BelongsToMany
    {
        return $this->belongsToMany(Project::class)->withPivot('role')->withTimestamps();
    }
}
