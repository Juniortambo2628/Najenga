<?php

namespace App\Http\Controllers;

use App\Http\Requests\StorePhotoRequest;
use App\Http\Requests\UpdatePhotoRequest;
use App\Models\Photo;
use App\Models\Project;
use App\Traits\HasProjectScope;
use App\Traits\AttachesMediaFromRequest;
use App\Traits\BatchDeletes;
use App\Traits\RespondsWithModel;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PhotoController extends Controller
{
    use HasProjectScope, AttachesMediaFromRequest, BatchDeletes, RespondsWithModel;
    public function index()
    {
        $userId = auth()->id();
        return Inertia::render('Photos', [
            'photos' => Photo::where('user_id', $userId)
                ->with('project:id,name')
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(fn ($p) => [
                    'id' => $p->id,
                    'title' => $p->title,
                    'file_path' => $p->file_path,
                    'thumb_url' => $p->thumb_url,
                    'preview_url' => $p->preview_url,
                    'project_id' => $p->project_id,
                    'project_name' => $p->project?->name ?? 'Untitled Project',
                    'photo_date' => $p->created_at->format('M d, Y'),
                ]),
            'projects' => $this->getClientProjects(),
        ]);
    }

    public function create()
    {
        return Inertia::render('Photos/Create', [
            'projects' => $this->getClientProjects(),
        ]);
    }

    public function store(StorePhotoRequest $request)
    {
        $projectId = $request->project_id ?? Project::where('client_id', $request->user()->id)->value('id');

        if (!$projectId) {
            return $this->respondErrorOrRedirect($request, 'Please create a project first before uploading photos.');
        }

        $uploadedPhotos = [];

        if ($request->hasFile('photos')) {
            foreach ($request->file('photos') as $file) {
                // 1. Create the photo row first
                $photo = Photo::create([
                    'user_id' => $request->user()->id,
                    'project_id' => $projectId,
                    'title' => pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME),
                    'original_name' => $file->getClientOriginalName(),
                    'file_path' => '', // mirrored from media after attachment
                    'filename' => $file->getClientOriginalName(),
                    'file_size' => $file->getSize(),
                    'mime_type' => $file->getMimeType(),
                ]);

                // 2. Attach to the "photos" media collection
                $this->attachUploadedFile($photo, $file, 'photos');

                // 3. Mirror to file_path for backward compat (relative path)
                if ($media = $photo->getFirstMedia('photos')) {
                    $relativePath = \Illuminate\Support\Str::after($media->getUrl(), '/storage/');
                    $photo->update(['file_path' => $relativePath]);
                }

                $uploadedPhotos[] = $photo->fresh();
            }
        }

        $message = 'Photos uploaded successfully';

        return $this->respondOrRedirect($request, $message, response()->json([
            'message' => $message,
            'photos' => $uploadedPhotos,
        ]));
    }

    public function show(Photo $photo)
    {
        $this->authorize('view', $photo);

        return Inertia::render('Photos/Show', [
            'photo' => $photo->load('project:id,name')
                ->append('photo_url', 'thumb_url', 'preview_url'),
        ]);
    }

    public function edit(Photo $photo)
    {
        $this->authorize('update', $photo);

        return Inertia::render('Photos/Edit', [
            'photo' => $photo,
            'projects' => $this->getClientProjects(),
        ]);
    }

    public function update(UpdatePhotoRequest $request, Photo $photo)
    {
        $photo->update($request->validated());

        return $this->respondOrRedirect($request, 'Photo updated successfully');
    }

    public function destroy(Request $request, Photo $photo)
    {
        $this->authorize('delete', $photo);

        Photo::withoutSyncingToSearch(fn () => $photo->delete());

        return $this->respondOrRedirect($request, 'Photo deleted successfully', response()->json(null, 204));
    }

    public function batchDestroy(Request $request)
    {
        return $this->batchDelete($request, Photo::class, 'photo');
    }
}
