<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreProjectRequest;
use App\Http\Requests\UpdateProjectRequest;
use App\Models\Project;
use Illuminate\Http\Request;

class ProjectController extends Controller
{
    public function index()
    {
        return \Inertia\Inertia::render('Projects/Index', [
            'projects' => Project::where('client_id', auth()->id())
                ->orderBy('created_at', 'desc')
                ->get()
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

        if ($request->wantsJson() && !$request->header('X-Inertia')) {
            return response()->json($project, 201);
        }

        return redirect()->back()->with('success', 'Project created successfully');
    }

    public function show(Project $project)
    {
        $this->authorize('view', $project);

        return \Inertia\Inertia::render('Projects/Show', [
            'project' => $project->load(['client', 'users']),
            'photos' => $project->photos()->latest()->take(6)->get(),
            'expenses' => $project->expenses()->latest()->take(5)->get(),
            'documents' => $project->documents()->latest()->take(5)->get(),
        ]);
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

        if ($request->wantsJson() && !$request->header('X-Inertia')) {
            return response()->json($project);
        }

        return redirect()->back()->with('success', 'Project updated successfully');
    }

    public function destroy(Request $request, Project $project)
    {
        $this->authorize('delete', $project);

        $project->delete();

        if ($request->wantsJson() && !$request->header('X-Inertia')) {
            return response()->json(null, 204);
        }

        return redirect()->back()->with('success', 'Project deleted successfully');
    }

    public function users(Project $project)
    {
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
