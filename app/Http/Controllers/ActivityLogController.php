<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ActivityLogController extends Controller
{
    /**
     * The single activity feed, answered in whichever shape was asked for.
     *
     * The Inertia page at /activity-logs and the JSON the expense modal
     * fetches at /api/activity-logs run the identical query - this method
     * replaces the byte-for-byte duplicate that ActivityLogApiController was.
     * axios sends Accept: application/json, so expectsJson() separates them.
     *
     * The expense modal sends subject_type + subject_id to ask for one
     * expense's history; without them the page is the whole feed. The user
     * scope is kept either way - you can only filter your own rows.
     */
    public function index(Request $request)
    {
        $logs = ActivityLog::with('user:id,username,first_name,last_name')
            ->where('user_id', auth()->id());

        if ($request->filled('subject_type') && $request->filled('subject_id')) {
            $logs
                ->where('subject_type', (string) $request->input('subject_type'))
                ->where('subject_id', (int) $request->input('subject_id'));
        }

        $logs = $logs->orderBy('created_at', 'desc')->paginate(50);

        if ($request->expectsJson()) {
            return response()->json($logs);
        }

        return Inertia::render('ActivityLogs', [
            'logs' => $logs,
        ]);
    }
}
