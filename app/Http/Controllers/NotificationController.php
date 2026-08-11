<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class NotificationController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json([], 401);
        }
        return response()->json($user->unreadNotifications);
    }

    public function markAsRead($id)
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['error' => 'Unauthenticated'], 401);
        }
        $notification = $user->notifications()->where('id', $id)->first();
        if (!$notification) {
            return response()->json(['error' => 'Notification not found'], 404);
        }
        $notification->markAsRead();
        return response()->json(['status' => 'success']);
    }

    public function markAllAsRead()
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['error' => 'Unauthenticated'], 401);
        }
        $user->unreadNotifications()->update(['read_at' => now()]);
        return response()->json(['status' => 'success']);
    }
}
