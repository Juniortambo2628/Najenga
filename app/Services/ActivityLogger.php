<?php

namespace App\Services;

use App\Models\ActivityLog;
use Illuminate\Contracts\Auth\Authenticatable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Log;

/**
 * Writes one row per meaningful action to activity_logs.
 *
 * A row names what it was about two ways: free-text description for the human
 * reading the page, and subject_type/subject_id for the per-entity tab (the
 * expense Activity tab asks /api/activity-logs for one expense and gets only
 * that expense's rows). action is a dotted code ("project.created") rather
 * than prose because Pages/ActivityLogs.jsx colours the badge by substring
 * match on 'create', 'update' and 'delete'.
 *
 * Logging must never be able to fail the request it is attached to, so every
 * write is wrapped and a failure becomes a warning in the app log.
 */
class ActivityLogger
{
    /**
     * Attribute the action to the user who is authenticated right now.
     */
    public static function log(string $action, ?string $description = null, ?Model $subject = null): void
    {
        static::logFor(auth()->user(), $action, $description, $subject);
    }

    /**
     * Attribute the action to an explicit actor. Pass null for events with no
     * authenticated actor - a failed sign-in, say - which is not the same as
     * "use whoever happens to hold this session".
     */
    public static function logFor(?Authenticatable $user, string $action, ?string $description = null, ?Model $subject = null): void
    {
        try {
            ActivityLog::create([
                'user_id'     => $user?->getAuthIdentifier(),
                'action'      => mb_substr($action, 0, 100),
                'description' => $description,
                'subject_type' => $subject?->getMorphClass(),
                'subject_id'   => $subject?->getKey(),
                'ip_address'  => request()->ip(),
                'user_agent'  => (string) request()->userAgent(),
            ]);
        } catch (\Throwable $e) {
            Log::warning('activity_logs write failed', [
                'action' => $action,
                'error'  => $e->getMessage(),
            ]);
        }
    }
}
