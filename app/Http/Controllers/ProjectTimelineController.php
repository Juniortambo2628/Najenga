<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreTimelineRequest;
use App\Http\Requests\UpdateTimelineRequest;
use App\Models\Document;
use App\Models\Expense;
use App\Models\Photo;
use App\Models\ProjectTimeline;
use App\Traits\HasProjectScope;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProjectTimelineController extends Controller
{
    use HasProjectScope;

    public function index(Request $request)
    {
        $projectId = $request->input('project_id');

        $user = $request->user();
        $timelines = ProjectTimeline::whereHas('project', fn ($q) => $q->accessibleBy($user));

        $expenses = Expense::visibleTo($user)->with('project:id,name');
        $photos = Photo::visibleTo($user)->with('project:id,name');
        $documents = Document::visibleTo($user)->with('project:id,name');

        if ($projectId) {
            $timelines->where('project_id', $projectId);
            $expenses->where('project_id', $projectId);
            $photos->where('project_id', $projectId);
            $documents->where('project_id', $projectId);
        }

        return Inertia::render('Timeline', [
            'timelines' => $timelines->orderBy('start_date', 'desc')->get(),
            'expenses' => $expenses->orderBy('expense_date', 'desc')->get()->map(fn ($e) => [
                'id' => $e->id,
                'title' => $e->title,
                'amount' => (float) $e->amount,
                'currency' => $e->currency,
                'category' => $e->category,
                'status' => $e->status,
                'date' => $e->expense_date?->format('Y-m-d'),
                'time' => $e->time,
                'project_id' => $e->project_id,
                'project_name' => $e->project?->name ?? 'N/A',
                'recipient' => $e->recipient,
                'payment_method' => $e->payment_method,
            ]),
            'photos' => $photos->orderBy('photo_date', 'desc')->orderBy('taken_at', 'desc')->get()->map(fn ($p) => [
                'id' => $p->id,
                'title' => $p->title,
                'file_path' => $p->file_path,
                'category' => $p->category,
                'date' => $p->photo_date?->format('Y-m-d'),
                'location' => $p->location,
                'project_id' => $p->project_id,
                'project_name' => $p->project?->name ?? 'N/A',
                'is_featured' => $p->is_featured,
            ]),
            'documents' => $documents->orderBy('document_date', 'desc')->get()->map(fn ($d) => [
                'id' => $d->id,
                'title' => $d->title,
                'file_path' => $d->file_path,
                'category' => $d->category,
                'date' => $d->document_date?->format('Y-m-d'),
                'project_id' => $d->project_id,
                'project_name' => $d->project?->name ?? 'N/A',
            ]),
            'projects' => $this->getClientProjects(),
        ]);
    }

    public function create()
    {
        return Inertia::render('Timeline/Create', [
            'projects' => $this->getEditableProjects(),
        ]);
    }

    public function store(StoreTimelineRequest $request)
    {
        ProjectTimeline::create($request->validated());

        return redirect()->back()->with('success', 'Timeline event added successfully');
    }

    public function show(ProjectTimeline $timeline)
    {
        $this->authorize('view', $timeline);

        return Inertia::render('Timeline/Show', [
            'timeline' => $timeline->load('project:id,name'),
            'can' => ['update' => auth()->user()->can('update', $timeline)],
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
            'projects' => $this->getEditableProjects(),
        ]);
    }

    public function destroy(ProjectTimeline $timeline)
    {
        $this->authorize('delete', $timeline);

        $timeline->delete();

        return redirect()->back()->with('success', 'Timeline event deleted successfully');
    }
}
