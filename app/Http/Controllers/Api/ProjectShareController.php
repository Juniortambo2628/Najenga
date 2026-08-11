<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Models\User;
use Illuminate\Http\Request;

class ProjectShareController extends Controller
{
    public function store(Request $request, Project $project)
    {
        $this->authorize('update', $project);

        $request->validate([
            'email' => 'required|email|exists:users,email',
            'role' => 'in:viewer,editor'
        ]);

        $user = User::where('email', $request->email)->first();

        if ($project->users()->where('user_id', $user->id)->exists()) {
            return response()->json(['message' => 'User already has access'], 422);
        }

        $project->users()->attach($user->id, ['role' => $request->role ?? 'viewer']);

        return response()->json(['message' => 'Project shared successfully', 'user' => $user]);
    }

    public function destroy(Project $project, User $user)
    {
        $this->authorize('update', $project);

        $project->users()->detach($user->id);
        return response()->json(['message' => 'User removed from project']);
    }

    public function index(Project $project)
    {
        return response()->json($project->users);
    }
}
