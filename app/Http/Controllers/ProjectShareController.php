<?php

namespace App\Http\Controllers;

use App\Http\Requests\ShareProjectRequest;
use App\Models\Project;
use App\Models\User;

class ProjectShareController extends Controller
{
    public function store(ShareProjectRequest $request, Project $project)
    {
        $user = User::where('email', $request->email)->first();

        if ($project->users()->where('user_id', $user->id)->exists()) {
            return response()->json(['message' => 'User already has access'], 422);
        }

        $project->users()->attach($user->id, ['role' => $request->role ?? 'viewer']);

        return response()->json(['message' => 'Project shared successfully', 'user' => $user]);
    }

    public function destroy(Project $project, User $user)
    {
        $this->authorize('share', $project);

        $project->users()->detach($user->id);
        return response()->json(['message' => 'User removed from project']);
    }
}
