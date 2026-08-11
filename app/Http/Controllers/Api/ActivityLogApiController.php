<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;

class ActivityLogApiController extends Controller
{
    public function index()
    {
        $logs = ActivityLog::with('user:id,username,first_name,last_name')
            ->where('user_id', auth()->id())
            ->orderBy('created_at', 'desc')
            ->paginate(50);

        return response()->json($logs);
    }
}
