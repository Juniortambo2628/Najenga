<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreDocumentRequest;
use App\Http\Requests\UpdateDocumentRequest;
use App\Models\Document;
use App\Models\Project;
use App\Traits\HasProjectScope;
use App\Traits\AttachesMediaFromRequest;
use App\Traits\RespondsWithModel;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DocumentController extends Controller
{
    use HasProjectScope, AttachesMediaFromRequest, RespondsWithModel;
    public function index()
    {
        $userId = auth()->id();
        return Inertia::render('Documents', [
            'documents' => Document::where('user_id', $userId)
                ->with('project:id,name')
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(fn ($d) => [
                    'id' => $d->id,
                    'title' => $d->title,
                    'document_type' => $d->category ?? 'other',
                    'mime_type' => $d->mime_type,
                    'project_id' => $d->project_id,
                    'project_name' => $d->project?->name ?? 'N/A',
                    'document_date' => $d->created_at->format('M d, Y'),
                    'file_path' => $d->file_path,
                    'thumb_url' => $d->thumb_url,
                    'preview_url' => $d->getFirstMediaUrl('files'),
                    'original_name' => $d->original_name ?? $d->filename,
                    'folder_id' => $d->folder_id,
                ]),
            'folders' => \App\Models\Folder::whereIn('project_id',
                    Project::where('client_id', $userId)->pluck('id')
                )
                ->with('children')
                ->get()
                ->map(fn ($f) => [
                    'id' => $f->id,
                    'name' => $f->name,
                    'parent_id' => $f->parent_id,
                    'project_id' => $f->project_id,
                ]),
            'projects' => $this->getClientProjects(),
        ]);
    }

    public function create()
    {
        return Inertia::render('Documents/Create', [
            'projects' => $this->getClientProjects(),
        ]);
    }

    public function store(StoreDocumentRequest $request)
    {
        $projectId = $request->project_id ?? Project::where('client_id', $request->user()->id)->value('id');

        if (!$projectId) {
            return response()->json(['message' => 'Please create a project first before uploading documents.'], 400);
        }

        $uploadedDocuments = [];
        $errors = [];

        if ($request->hasFile('documents')) {
            foreach ($request->file('documents') as $index => $file) {
                try {
                    $document = Document::create([
                        'user_id' => $request->user()->id,
                        'project_id' => $projectId,
                        'folder_id' => $request->folder_id ?: null,
                        'title' => pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME),
                        'original_name' => $file->getClientOriginalName(),
                        'file_path' => '',
                        'filename' => $file->getClientOriginalName(),
                        'file_size' => $file->getSize(),
                        'mime_type' => $file->getMimeType(),
                    ]);

                    $this->attachUploadedFile($document, $file, 'files');

                    if ($media = $document->getFirstMedia('files')) {
                        $relativePath = \Illuminate\Support\Str::after($media->getUrl(), '/storage/');
                        $document->update(['file_path' => $relativePath]);
                    }

                    $uploadedDocuments[] = $document->fresh();
                } catch (\Exception $e) {
                    $errors[] = ['index' => $index, 'file' => $file->getClientOriginalName(), 'error' => $e->getMessage()];
                }
            }
        }

        if (empty($uploadedDocuments) && !empty($errors)) {
            return response()->json(['message' => 'Upload failed', 'errors' => $errors], 500);
        }

        return response()->json([
            'message' => 'Documents uploaded successfully',
            'documents' => $uploadedDocuments,
            'errors' => $errors ?: null,
        ]);
    }

    public function show(Document $document)
    {
        return Inertia::render('Documents/Show', [
            'document' => $document->load('project:id,name', 'folder:id,name')
                ->append('file_url', 'thumb_url'),
        ]);
    }

    public function edit(Document $document)
    {
        $this->authorize('update', $document);

        return Inertia::render('Documents/Edit', [
            'document' => $document,
            'projects' => $this->getClientProjects(),
            'folders' => \App\Models\Folder::whereIn('project_id',
                Project::where('client_id', auth()->id())->pluck('id')
            )->get(['id', 'name', 'parent_id', 'project_id']),
        ]);
    }

    public function update(UpdateDocumentRequest $request, Document $document)
    {
        $document->update($request->validated());

        return $this->respondOrRedirect($request, '/documents', 'Document updated successfully');
    }

    public function destroy(Request $request, Document $document)
    {
        $this->authorize('delete', $document);

        Document::withoutSyncingToSearch(fn () => $document->delete());

        return $this->respondOrRedirect($request, '/documents', 'Document deleted successfully');
    }

    public function batchDestroy(Request $request)
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'integer|exists:documents,id',
        ]);

        $user = auth()->user();
        $ids = $request->input('ids');

        $deleted = Document::withoutSyncingToSearch(fn () =>
            Document::whereIn('id', $ids)
                ->where('user_id', $user->id)
                ->delete()
        );

        return response()->json([
            'deleted' => $deleted,
            'message' => "{$deleted} document" . ($deleted !== 1 ? "s" : "") . " deleted",
        ]);
    }

    public function move(Request $request, Document $document)
    {
        $request->validate(['folder_id' => 'nullable|exists:folders,id']);
        $document->update(['folder_id' => $request->folder_id]);
        return redirect()->back()->with('success', 'Document moved successfully');
    }
}
