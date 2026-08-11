<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Conversation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class ConversationController extends Controller
{
    public function index()
    {
        $conversations = Auth::user()->conversations()
            ->with(['users:id,first_name,last_name,email', 'lastMessage', 'project:id,name'])
            ->orderByDesc('last_message_at')
            ->get();

        return response()->json($conversations);
    }

    public function store(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'project_id' => 'nullable|exists:projects,id',
        ]);

        if ($request->user_id == Auth::id()) {
            return response()->json(['error' => 'Cannot chat with yourself'], 422);
        }

        $conversation = Auth::user()->conversations()
            ->whereHas('users', function ($q) use ($request) {
                $q->where('user_id', $request->user_id);
            })
            ->whereDoesntHave('users', function ($q) use ($request) {
                $q->whereNotIn('user_id', [Auth::id(), $request->user_id]);
            })
            ->first();

        if (!$conversation) {
            $conversation = DB::transaction(function () use ($request) {
                $conv = Conversation::create([
                    'project_id' => $request->project_id,
                    'last_message_at' => now(),
                ]);
                $conv->users()->attach([Auth::id(), $request->user_id]);
                return $conv;
            });
        }

        return response()->json($conversation->load('users:id,first_name,last_name,email'));
    }

    public function destroy(Conversation $conversation)
    {
        $this->authorize('delete', $conversation);

        $conversation->delete();

        return response()->json(null, 204);
    }

    public function leave(Conversation $conversation)
    {
        $this->authorize('delete', $conversation);

        $conversation->users()->detach(Auth::id());

        if ($conversation->users()->count() === 0) {
            $conversation->delete();
        }

        return response()->json(null, 204);
    }
}
