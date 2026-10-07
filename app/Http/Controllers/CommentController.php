<?php

namespace App\Http\Controllers;

use App\Models\Comment;
use App\Models\Project;
use App\Models\Photo;
use App\Models\Document;
use App\Traits\HasPolymorphicType;
use App\Traits\DispatchesActivityNotifications;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CommentController extends Controller
{
    use HasPolymorphicType, DispatchesActivityNotifications;
    public function index(Request $request)
    {
        $request->validate([
            'commentable_id' => 'required|integer',
            'commentable_type' => 'required|string',
        ]);

        $modelClass = $this->getModelClass($request->commentable_type);

        if (!$modelClass) {
            return response()->json(['error' => 'Invalid resource type'], 400);
        }

        $resource = $modelClass::find($request->commentable_id);
        if ($resource) {
            $this->authorize('view', $resource);
        }

        $comments = Comment::where('commentable_id', $request->commentable_id)
            ->where('commentable_type', $modelClass)
            ->whereNull('parent_id')
            ->with(['user:id,first_name,last_name,email', 'replies'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($comments);
    }

    public function store(Request $request)
    {
        $request->validate([
            'body' => 'required|string',
            'commentable_id' => 'required|integer',
            'commentable_type' => 'required|string',
            'parent_id' => 'nullable|integer|exists:comments,id',
        ]);

        $modelClass = $this->getModelClass($request->commentable_type);

        if (!$modelClass) {
            return response()->json(['error' => 'Invalid resource type'], 400);
        }

        $resource = $modelClass::findOrFail($request->commentable_id);

        // The parent id comes straight from the request, so without this any
        // signed-in user could post a comment onto someone else's photo,
        // document or project.
        $this->authorize('view', $resource);

        $comment = $resource->comments()->create([
            'body' => $request->body,
            'user_id' => Auth::id(),
            'parent_id' => $request->parent_id,
        ]);

        // Notify other project users
        $project = $resource instanceof \App\Models\Project ? $resource : $resource->project;
        if ($project) {
            $this->notifyProjectMembers(
                $project,
                Auth::user()->name,
                $request->parent_id ? 'New Reply' : 'New Comment',
                Auth::user()->name . ($request->parent_id ? ' replied to a comment on ' : ' commented on ') . $request->commentable_type
            );
        }

        return response()->json($comment->load('user'), 201);
    }

    public function update(Request $request, Comment $comment)
    {
        $this->authorize('update', $comment);

        $request->validate([
            'body' => 'required|string',
        ]);

        $comment->update([
            'body' => $request->body,
        ]);

        return response()->json($comment->load('user'));
    }

    public function destroy(Comment $comment)
    {
        $this->authorize('delete', $comment);

        $comment->delete();

        return response()->json(['message' => 'Comment deleted']);
    }
}
