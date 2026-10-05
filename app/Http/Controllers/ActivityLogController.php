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
     */
    public function index(Request $request)
    {
        $logs = ActivityLog::with('user:id,username,first_name,last_name')
            ->where('user_id', auth()->id())
            ->orderBy('created_at', 'desc')
            ->paginate(50);

        if ($request->expectsJson()) {
            return response()->json($logs);
        }

        return Inertia::render('ActivityLogs', [
            'logs' => $logs,
        ]);
    }
}
