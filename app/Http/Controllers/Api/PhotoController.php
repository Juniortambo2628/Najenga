<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePhotoRequest;
use App\Http\Requests\UpdatePhotoRequest;
use App\Models\Photo;
use App\Models\Project;
use App\Traits\HasProjectScope;
use App\Traits\AttachesMediaFromRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PhotoController extends Controller
{
    use HasProjectScope, AttachesMediaFromRequest;
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
            return response()->json(['message' => 'Please create a project first before uploading photos.'], 400);
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

        return response()->json(['message' => 'Photos uploaded successfully', 'photos' => $uploadedPhotos]);
    }

    public function show(Photo $photo)
    {
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

        return redirect()->back()->with('success', 'Photo updated successfully');
    }

    public function destroy(Request $request, Photo $photo)
    {
        $this->authorize('delete', $photo);

        // MediaLibrary handles file cleanup automatically when the model is deleted
        Photo::withoutSyncingToSearch(fn () => $photo->delete());

        if ($request->wantsJson() && !$request->header('X-Inertia')) {
            return response()->json(null, 204);
        }

        return redirect()->back()->with('success', 'Photo deleted successfully');
    }
}
