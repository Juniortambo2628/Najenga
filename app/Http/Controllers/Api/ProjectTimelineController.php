<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTimelineRequest;
use App\Http\Requests\UpdateTimelineRequest;
use App\Models\Document;
use App\Models\Expense;
use App\Models\Photo;
use App\Models\Project;
use App\Models\ProjectTimeline;
use App\Traits\HasProjectScope;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProjectTimelineController extends Controller
{
    use HasProjectScope;

    public function index(Request $request)
    {
        $userId = auth()->id();
        $projectId = $request->input('project_id');

        $baseQuery = function ($query) use ($userId) {
            $query->whereHas('project', fn ($q) => $q->where('client_id', $userId));
        };

        $timelines = ProjectTimeline::whereHas('project', function ($q) use ($userId) {
            $q->where('client_id', $userId);
        });

        $expenses = Expense::where('user_id', $userId)->with('project:id,name');
        $photos = Photo::where('user_id', $userId)->with('project:id,name');
        $documents = Document::where('user_id', $userId)->with('project:id,name');

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
            'photos' => $photos->orderBy('photo_date', 'desc')->get()->map(fn ($p) => [
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
                'document_type' => $d->document_type,
                'date' => $d->document_date?->format('Y-m-d'),
                'project_id' => $d->project_id,
                'project_name' => $d->project?->name ?? 'N/A',
            ]),
            'projects' => $this->getClientProjects(),
        ]);
    }

    public function timelineData(Request $request)
    {
        $userId = auth()->id();
        $projectId = $request->input('project_id');
        $startDate = $request->input('start_date');
        $endDate = $request->input('end_date');
        $type = $request->input('type', 'all');

        $timelines = ProjectTimeline::whereHas('project', function ($q) use ($userId) {
            $q->where('client_id', $userId);
        });
        $expenses = Expense::where('user_id', $userId);
        $photos = Photo::where('user_id', $userId);
        $documents = Document::where('user_id', $userId);

        if ($projectId) {
            $timelines->where('project_id', $projectId);
            $expenses->where('project_id', $projectId);
            $photos->where('project_id', $projectId);
            $documents->where('project_id', $projectId);
        }

        if ($startDate) {
            $timelines->where('start_date', '>=', $startDate);
            $expenses->where('expense_date', '>=', $startDate);
            $photos->where('photo_date', '>=', $startDate);
            $documents->where('document_date', '>=', $startDate);
        }

        if ($endDate) {
            $timelines->where('end_date', '<=', $endDate);
            $expenses->where('expense_date', '<=', $endDate);
            $photos->where('photo_date', '<=', $endDate);
            $documents->where('document_date', '<=', $endDate);
        }

        $data = [];

        if ($type === 'all' || $type === 'milestones') {
            $data['timelines'] = $timelines->orderBy('start_date', 'desc')->get()->map(fn ($t) => [
                'type' => 'milestone',
                'id' => $t->id,
                'title' => $t->title,
                'description' => $t->description,
                'date' => $t->start_date?->format('Y-m-d'),
                'end_date' => $t->end_date?->format('Y-m-d'),
                'status' => $t->status,
                'priority' => $t->priority,
                'project_id' => $t->project_id,
            ]);
        }

        if ($type === 'all' || $type === 'expenses') {
            $data['expenses'] = $expenses->orderBy('expense_date', 'desc')->get()->map(fn ($e) => [
                'type' => 'expense',
                'id' => $e->id,
                'title' => $e->title,
                'amount' => (float) $e->amount,
                'currency' => $e->currency,
                'category' => $e->category,
                'status' => $e->status,
                'date' => $e->expense_date?->format('Y-m-d'),
                'project_id' => $e->project_id,
            ]);
        }

        if ($type === 'all' || $type === 'photos') {
            $data['photos'] = $photos->orderBy('photo_date', 'desc')->get()->map(fn ($p) => [
                'type' => 'photo',
                'id' => $p->id,
                'title' => $p->title,
                'file_path' => $p->file_path,
                'date' => $p->photo_date?->format('Y-m-d'),
                'project_id' => $p->project_id,
            ]);
        }

        if ($type === 'all' || $type === 'documents') {
            $data['documents'] = $documents->orderBy('document_date', 'desc')->get()->map(fn ($d) => [
                'type' => 'document',
                'id' => $d->id,
                'title' => $d->title,
                'file_path' => $d->file_path,
                'document_type' => $d->document_type,
                'date' => $d->document_date?->format('Y-m-d'),
                'project_id' => $d->project_id,
            ]);
        }

        return response()->json($data);
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
