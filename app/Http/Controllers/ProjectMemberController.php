<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\ProjectInvitation;
use App\Models\User;
use App\Services\ActivityLogger;
use App\Support\ProjectRole;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

/**
 * The people in a project, for the Share panel: list, change a role, remove,
 * or leave. Owners manage everyone but themselves; managers manage editors
 * and viewers; anyone but the owner can leave.
 */
class ProjectMemberController extends Controller
{
    public function index(Request $request, Project $project): JsonResponse
    {
        $this->authorize('view', $project);

        $members = $project->users()->get()->map(fn (User $user) => [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->id === $project->client_id ? ProjectRole::OWNER : $user->pivot->role,
            'accepted_at' => $user->pivot->accepted_at,
        ]);

        // The client is the owner even if their member row is missing.
        $client = $project->client;
        if ($client && ! $members->contains('id', $client->id)) {
            $members->prepend(['id' => $client->id, 'name' => $client->name, 'email' => $client->email, 'role' => ProjectRole::OWNER, 'accepted_at' => null]);
        }

        $order = array_flip(ProjectRole::ALL);
        $canManage = $request->user()->can('share', $project);

        return response()->json([
            'members' => $members->sortBy([fn ($a, $b) => $order[$a['role']] <=> $order[$b['role']], ['name', 'asc']])->values(),
            'invitations' => $canManage
                ? $project->invitations()->pending()->with('inviter:id,first_name,last_name')->latest()->get()
                    ->map(fn (ProjectInvitation $i) => [
                        'id' => $i->id,
                        'email' => $i->email,
                        'role' => $i->role,
                        'invited_by' => $i->inviter?->name,
                        'expires_at' => $i->expires_at,
                    ])
                : [],
            'my_role' => $project->roleFor($request->user()),
            'can_manage' => $canManage,
            'assignable' => $canManage ? $this->assignableBy($request->user(), $project) : [],
        ]);
    }

    public function update(Request $request, Project $project, User $user): JsonResponse
    {
        $this->authorize('share', $project);
        $this->ensureCanManage($request->user(), $project, $user);

        $validated = $request->validate([
            'role' => ['required', Rule::in($this->assignableBy($request->user(), $project))],
        ]);

        $project->users()->updateExistingPivot($user->id, ['role' => $validated['role']]);
        ActivityLogger::log('project.member_role_changed', sprintf('%s is now %s in "%s"', $user->email, $validated['role'], $project->name), $project);

        return response()->json(['message' => sprintf('%s is now %s', $user->name, ProjectRole::label($validated['role']))]);
    }

    public function destroy(Request $request, Project $project, User $user): JsonResponse
    {
        $leaving = $request->user()->is($user);

        if ($leaving) {
            $this->authorize('view', $project);
            abort_if($project->roleFor($user) === ProjectRole::OWNER, 422, 'The owner can\'t leave their own project.');
        } else {
            $this->authorize('share', $project);
            $this->ensureCanManage($request->user(), $project, $user);
        }

        $project->users()->detach($user->id);
        ActivityLogger::log(
            $leaving ? 'project.member_left' : 'project.member_removed',
            sprintf($leaving ? '%s left "%s"' : 'Removed %s from "%s"', $user->email, $project->name),
            $project,
        );

        return response()->json(['message' => $leaving ? sprintf('You left "%s"', $project->name) : 'Member removed']);
    }

    /** The owner can't be changed or removed; managers only manage editors and viewers. */
    private function ensureCanManage(User $actor, Project $project, User $target): void
    {
        $targetRole = $project->roleFor($target);
        abort_if($targetRole === null, 404);
        abort_if($targetRole === ProjectRole::OWNER, 422, 'The owner\'s role can\'t be changed.');
        abort_if(
            $project->roleFor($actor) !== ProjectRole::OWNER && $targetRole === ProjectRole::MANAGER,
            403,
            'Only the owner can change a manager.',
        );
    }

    /**
     * Owners can make managers; managers can make editors and viewers.
     *
     * @return array<int, string>
     */
    public static function assignableBy(User $actor, Project $project): array
    {
        return $project->roleFor($actor) === ProjectRole::OWNER
            ? ProjectRole::ASSIGNABLE
            : [ProjectRole::EDITOR, ProjectRole::VIEWER];
    }
}
