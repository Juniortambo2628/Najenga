<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ActivityLogController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return Inertia::render('ActivityLogs', [
            'logs' => ActivityLog::with('user:id,username,first_name,last_name')
                ->where('user_id', auth()->id())
                ->orderBy('created_at', 'desc')
                ->paginate(50)
        ]);
    }
}
