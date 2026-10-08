<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreMessageRequest;
use App\Http\Requests\UpdateMessageRequest;
use App\Models\Conversation;
use App\Models\Message;
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

    public function store(StoreMessageRequest $request, Conversation $conversation)
    {
        $this->authorize('update', $conversation);

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

    public function update(UpdateMessageRequest $request, Conversation $conversation, Message $message)
    {
        $this->authorize('update', $message);

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
