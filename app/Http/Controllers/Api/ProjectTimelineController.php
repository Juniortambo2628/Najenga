<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTimelineRequest;
use App\Http\Requests\UpdateTimelineRequest;
use App\Models\Project;
use App\Models\ProjectTimeline;
use App\Traits\HasProjectScope;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProjectTimelineController extends Controller
{
    use HasProjectScope;
    public function index()
    {
        return Inertia::render('Timeline', [
            'timelines' => ProjectTimeline::whereHas('project', function($q) {
                    $q->where('client_id', auth()->id());
                })
                ->orderBy('start_date', 'desc')
                ->get(),
            'projects' => $this->getClientProjects()
        ]);
    }

    public function create()
    {
        return Inertia::render('Timeline/Create', [
            'projects' => $this->getClientProjects(),
        ]);
    }

    public function store(StoreTimelineRequest $request)
    {
        ProjectTimeline::create($request->validated());

        return redirect()->back()->with('success', 'Timeline event added successfully');
    }

    public function show(ProjectTimeline $timeline)
    {
        return Inertia::render('Timeline/Show', [
            'timeline' => $timeline->load('project:id,name'),
        ]);
    }

    public function update(UpdateTimelineRequest $request, ProjectTimeline $timeline)
    {
        $this->authorize('update', $timeline);

        $timeline->update($request->validated());

        return redirect()->back()->with('success', 'Timeline event updated successfully');
    }

    public function edit(ProjectTimeline $timeline)
    {
        $this->authorize('update', $timeline);

        return Inertia::render('Timeline/Edit', [
            'timeline' => $timeline,
            'projects' => $this->getClientProjects(),
        ]);
    }

    public function destroy(ProjectTimeline $timeline)
    {
        $this->authorize('delete', $timeline);

        $timeline->delete();

        return redirect()->back()->with('success', 'Timeline event deleted successfully');
    }
}
