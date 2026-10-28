<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreProjectRequest;
use App\Http\Requests\UpdateProjectRequest;
use App\Models\Project;
use App\Services\ActivityLogger;
use App\Traits\RespondsWithModel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ProjectController extends Controller
{
    use RespondsWithModel;

    /**
     * The old projects list: the overview (and its project switcher) took
     * its place.
     */
    public function index()
    {
        return redirect()->route('overview');
    }

    /**
     * Overview: every project you can see, with what's in it. The page shows
     * the project picked in the navbar switcher, or all of them side by side.
     */
    public function overview(Request $request)
    {
        $user = $request->user();
        $roles = Project::rolesFor($user);

        $projects = Project::accessibleBy($user)
            ->with('users:id,first_name,last_name,email')
            ->withCount(['photos', 'documents', 'timelines', 'expenses'])
            ->withSum('expenses as spent', 'amount')
            ->orderByDesc('created_at')
            ->get()
            ->map(fn (Project $project) => [
                'id' => $project->id,
                'name' => $project->name,
                'description' => $project->description,
                'status' => $project->status,
                'location' => $project->location,
                'start_date' => $project->start_date?->format('Y-m-d'),
                'end_date' => $project->end_date?->format('Y-m-d'),
                'budget' => (float) $project->budget,
                'currency' => $project->currency ?? 'KES',
                'spent' => (float) $project->spent,
                'my_role' => $roles[$project->id] ?? null,
                'can_delete' => $user->can('delete', $project),
                'counts' => [
                    'expenses' => $project->expenses_count,
                    'photos' => $project->photos_count,
                    'documents' => $project->documents_count,
                    'milestones' => $project->timelines_count,
                ],
                'members' => $project->users->map(fn ($member) => [
                    'id' => $member->id,
                    'name' => trim("{$member->first_name} {$member->last_name}") ?: $member->email,
                    'role' => $member->pivot->role,
                ])->values(),
                'recent' => [
                    'expenses' => $project->expenses()->latest('expense_date')->latest('id')->take(5)
                        ->get(['id', 'title', 'amount', 'currency', 'expense_date'])
                        ->map(fn ($e) => [
                            'id' => $e->id,
                            'title' => $e->title,
                            'amount' => (float) $e->amount,
                            'currency' => $e->currency,
                            'date' => $e->expense_date?->format('Y-m-d'),
                        ]),
                    'photos' => $project->photos()->latest()->take(6)->get()
                        ->map(fn ($p) => ['id' => $p->id, 'title' => $p->title, 'thumb_url' => $p->thumb_url]),
                    'documents' => $project->documents()->latest()->take(5)->get(['id', 'title', 'category'])
                        ->map(fn ($d) => ['id' => $d->id, 'title' => $d->title, 'document_type' => $d->category ?? 'other']),
                ],
            ]);

        return \Inertia\Inertia::render('Overview', [
            'projects' => $projects,
            // /overview?project=ID (old project links) picks that project.
            'focus' => $request->integer('project') ?: null,
        ]);
    }

    public function create()
    {
        return \Inertia\Inertia::render('Projects/Create');
    }

    public function store(StoreProjectRequest $request)
    {
        $validated = $request->validated();
        $validated['client_id'] = auth()->id();

        $project = Project::create($validated);

        ActivityLogger::log('project.created', sprintf('Created project "%s" (#%d)', $project->name, $project->id));

        return $this->respondOrRedirect($request, 'Project created successfully', response()->json($project, 201));
    }

    /**
     * A project's page is its overview now: open it with the project picked.
     */
    public function show(Project $project)
    {
        $this->authorize('view', $project);

        return redirect()->route('overview', ['project' => $project->id]);
    }

    public function edit(Project $project)
    {
        $this->authorize('update', $project);

        return \Inertia\Inertia::render('Projects/Edit', [
            'project' => $project,
        ]);
    }

    public function update(UpdateProjectRequest $request, Project $project)
    {
        $project->update($request->validated());

        ActivityLogger::log('project.updated', sprintf('Updated project "%s" (#%d)', $project->name, $project->id));

        return $this->respondOrRedirect($request, 'Project updated successfully', response()->json($project));
    }

    public function destroy(Request $request, Project $project)
    {
        $this->authorize('delete', $project);

        DB::transaction(function () use ($project) {
            $project->delete();

            ActivityLogger::log('project.deleted', sprintf('Deleted project "%s" (#%d)', $project->name, $project->id));
        });

        return $this->respondOrRedirect($request, 'Project deleted successfully', response()->json(null, 204));
    }

    public function users(Project $project)
    {
        $this->authorize('view', $project);

        $sharedUsers = $project->users()->get();

        $client = $project->client;
        if ($client && !$sharedUsers->contains('id', $client->id)) {
            $sharedUsers->push((object) [
                'id' => $client->id,
                'name' => $client->first_name . ' ' . $client->last_name,
                'email' => $client->email,
            ]);
        }

        if ($project->manager_id) {
            $manager = $project->manager;
            if ($manager && !$sharedUsers->contains('id', $manager->id)) {
                $sharedUsers->push((object) [
                    'id' => $manager->id,
                    'name' => $manager->first_name . ' ' . $manager->last_name,
                    'email' => $manager->email,
                ]);
            }
        }

        return response()->json($sharedUsers->map(fn($u) => [
            'id' => $u->id,
            'name' => $u->name ?? $u->first_name . ' ' . $u->last_name,
            'email' => $u->email ?? '',
        ])->values());
    }
}
