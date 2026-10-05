<?php

namespace App\Services;

use App\Models\ActivityLog;
use Illuminate\Contracts\Auth\Authenticatable;
use Illuminate\Support\Facades\Log;

/**
 * Writes one row per meaningful action to activity_logs.
 *
 * The table has no subject_type/subject_id yet - those arrive with Phase 3 -
 * so the entity is named in free-text description instead. action is a dotted
 * code ("project.created") rather than prose because
 * Pages/ActivityLogs.jsx colours the badge by substring match on 'create',
 * 'update' and 'delete'.
 *
 * Logging must never be able to fail the request it is attached to, so every
 * write is wrapped and a failure becomes a warning in the app log.
 */
class ActivityLogger
{
    /**
     * Attribute the action to the user who is authenticated right now.
     */
    public static function log(string $action, ?string $description = null): void
    {
        static::logFor(auth()->user(), $action, $description);
    }

    /**
     * Attribute the action to an explicit actor. Pass null for events with no
     * authenticated actor - a failed sign-in, say - which is not the same as
     * "use whoever happens to hold this session".
     */
    public static function logFor(?Authenticatable $user, string $action, ?string $description = null): void
    {
        try {
            ActivityLog::create([
                'user_id'     => $user?->getAuthIdentifier(),
                'action'      => mb_substr($action, 0, 100),
                'description' => $description,
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
