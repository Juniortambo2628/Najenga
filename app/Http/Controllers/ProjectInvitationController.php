<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\ProjectInvitation;
use App\Models\User;
use App\Services\ProjectInvitations;
use App\Support\ProjectRole;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class ProjectInvitationController extends Controller
{
    public function __construct(private ProjectInvitations $invitations) {}

    /**
     * Members and pending invitations, for the Share panel.
     */
    public function index(Project $project): JsonResponse
    {
        $this->authorize('view', $project);

        $members = $project->users()->get()->map(fn ($user) => [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->pivot->role,
            'accepted_at' => $user->pivot->accepted_at,
        ]);

        // The client is the owner even before they have a member row.
        $client = $project->client;
        if ($client && ! $members->contains('id', $client->id)) {
            $members->prepend(['id' => $client->id, 'name' => $client->name, 'email' => $client->email, 'role' => ProjectRole::OWNER, 'accepted_at' => null]);
        }

        $canManage = request()->user()->can('share', $project);

        return response()->json([
            'members' => $members->values(),
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
            'can_manage' => $canManage,
        ]);
    }

    /**
     * Add someone by email: straight away if they have an account, else invite.
     */
    public function store(Request $request, Project $project): JsonResponse
    {
        $this->authorize('share', $project);

        $validated = $request->validate([
            'email' => ['required', 'email', 'max:191'],
            'role' => ['required', Rule::in($this->assignableBy($request, $project))],
        ]);

        $result = $this->invitations->invite($project, $validated['email'], $validated['role'], $request->user());

        return response()->json([
            'status' => $result['status'],
            'message' => $result['status'] === 'added'
                ? sprintf('%s added to the project', $result['user']->name)
                : sprintf('Invitation sent to %s', $result['invitation']->email),
        ], $result['status'] === 'added' ? 200 : 201);
    }

    public function resend(Project $project, ProjectInvitation $invitation): JsonResponse
    {
        $this->authorize('share', $project);
        abort_unless($invitation->project_id === $project->id && $invitation->isPending(), 404);

        $this->invitations->resend($invitation);

        return response()->json(['message' => sprintf('Invitation sent again to %s', $invitation->email)]);
    }

    public function destroy(Project $project, ProjectInvitation $invitation): JsonResponse
    {
        $this->authorize('share', $project);
        abort_unless($invitation->project_id === $project->id, 404);

        $this->invitations->revoke($invitation);

        return response()->json(['message' => 'Invitation revoked']);
    }

    /**
     * The link in the email (signed). Signed-in users join now; guests sign in
     * or sign up first and join right after (see AcceptPendingInvitation).
     */
    public function accept(Request $request, ProjectInvitation $invitation): RedirectResponse
    {
        abort_unless($invitation->matchesToken($request->query('token')), 403);

        if (! $request->user()) {
            $request->session()->put(ProjectInvitations::SESSION_KEY, [
                'id' => $invitation->id,
                'token' => $request->query('token'),
            ]);
            $request->session()->put('url.intended', route('projects.show', $invitation->project_id));

            $hasAccount = User::whereRaw('LOWER(email) = ?', [strtolower($invitation->email)])->exists();

            return $hasAccount
                ? redirect()->route('login')->with('status', sprintf('Sign in as %s to join "%s".', $invitation->email, $invitation->project->name))
                : redirect()->route('register', ['email' => $invitation->email]);
        }

        try {
            $project = $this->invitations->accept($invitation, $request->user());
        } catch (ValidationException $e) {
            return redirect()->route('dashboard')->with('error', collect($e->errors())->flatten()->first());
        }

        return redirect()->route('projects.show', $project)->with('success', sprintf('You joined "%s"', $project->name));
    }

    /**
     * Owners can make managers; managers can add editors and viewers.
     *
     * @return array<int, string>
     */
    private function assignableBy(Request $request, Project $project): array
    {
        return $project->roleFor($request->user()) === ProjectRole::OWNER
            ? ProjectRole::ASSIGNABLE
            : [ProjectRole::EDITOR, ProjectRole::VIEWER];
    }
}
