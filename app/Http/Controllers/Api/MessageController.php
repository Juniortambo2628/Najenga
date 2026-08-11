<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Conversation;
use App\Models\Message;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class MessageController extends Controller
{
    public function index(Conversation $conversation)
    {
        $this->authorize('view', $conversation);

        $messages = $conversation->messages()
            ->with('user:id,first_name,last_name,email')
            ->orderBy('created_at', 'asc')
            ->paginate(50);

        $conversation->messages()
            ->where('user_id', '!=', Auth::id())
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return response()->json($messages);
    }

    public function store(Request $request, Conversation $conversation)
    {
        $this->authorize('update', $conversation);

        $request->validate([
            'body' => 'required|string',
            'type' => 'nullable|string',
        ]);

        $message = DB::transaction(function () use ($request, $conversation) {
            $msg = $conversation->messages()->create([
                'user_id' => Auth::id(),
                'body' => $request->body,
                'type' => $request->type ?? 'text',
            ]);

            $conversation->update(['last_message_at' => now()]);

            return $msg;
        });

        return response()->json($message->load('user'), 201);
    }

    public function update(Request $request, Conversation $conversation, Message $message)
    {
        $this->authorize('update', $message);

        $request->validate([
            'body' => 'required|string',
        ]);

        $message->update(['body' => $request->body]);

        return response()->json($message->load('user'));
    }

    public function destroy(Conversation $conversation, Message $message)
    {
        $this->authorize('delete', $message);

        $message->delete();

        return response()->json(null, 204);
    }
}
