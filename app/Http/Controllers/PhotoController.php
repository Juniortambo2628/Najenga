<?php

namespace App\Http\Controllers;

use App\Http\Requests\StorePhotoRequest;
use App\Http\Requests\UpdatePhotoRequest;
use App\Models\Photo;
use App\Models\Project;
use App\Services\PhotoDateResolver;
use App\Traits\HasProjectScope;
use App\Traits\AttachesMediaFromRequest;
use App\Traits\BatchDeletes;
use App\Traits\BatchDownloads;
use App\Traits\RespondsWithModel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class PhotoController extends Controller
{
    use HasProjectScope, AttachesMediaFromRequest, BatchDeletes, BatchDownloads, RespondsWithModel;
    public function index()
    {
        return Inertia::render('Photos', [
            'photos' => Photo::visibleTo(auth()->user())
                ->with('project:id,name')
                ->orderByRaw('COALESCE(taken_at, photo_date, created_at) DESC')
                ->orderByDesc('id')
                ->get()
                ->map(fn ($p) => [
                    'id' => $p->id,
                    'title' => $p->title,
                    'file_path' => $p->file_path,
                    'thumb_url' => $p->thumb_url,
                    'preview_url' => $p->preview_url,
                    'project_id' => $p->project_id,
                    'project_name' => $p->project?->name ?? 'Untitled Project',
                    'photo_date' => ($p->taken_at ?? $p->photo_date ?? $p->created_at)->format('M d, Y'),
                    'date_source' => $p->date_source,
                ]),
            'projects' => $this->getClientProjects(),
        ]);
    }

    public function create()
    {
        return Inertia::render('Photos/Create', [
            'projects' => $this->getEditableProjects(),
            'uploadLimits' => [
                'maxFiles' => max(1, min((int) config('photos.upload_batch_size'), (int) ini_get('max_file_uploads') ?: 20)),
                'maxBytes' => $this->iniBytes('post_max_size'),
                'maxFileBytes' => min(20480 * 1024, $this->iniBytes('upload_max_filesize') ?: PHP_INT_MAX),
            ],
        ]);
    }

    public function store(StorePhotoRequest $request, PhotoDateResolver $dates)
    {
        $projectId = $request->project_id ?? Project::where('client_id', $request->user()->id)->value('id');

        if (!$projectId) {
            return $this->respondErrorOrRedirect($request, 'Please create a project first before uploading photos.');
        }

        $uploadedPhotos = [];
        $skipped = [];

        foreach ($request->file('photos', []) as $i => $file) {
            $name = $file->getClientOriginalName();
            $hash = hash_file('sha256', $file->getRealPath());

            // The same picture often sits in Drive several times ("x (1).jpeg", "x 2.jpg").
            if (Photo::where('project_id', $projectId)->where('content_hash', $hash)->exists()) {
                $skipped[] = $name;
                continue;
            }

            $relativePath = $request->input("relative_paths.$i");
            $resolved = $this->resolveTakenAt($dates, $request, $i, $file->getRealPath(), $name, $relativePath);

            // 1. Create the photo row first
            $photo = Photo::create([
                'user_id' => $request->user()->id,
                'project_id' => $projectId,
                'title' => pathinfo($name, PATHINFO_FILENAME),
                'original_name' => $name,
                'file_path' => '', // mirrored from media after attachment
                'filename' => $name,
                'file_size' => $file->getSize(),
                'mime_type' => $file->getMimeType(),
                'taken_at' => $resolved['taken_at'],
                'date_source' => $resolved['source'],
                'source_path' => $relativePath,
                'content_hash' => $hash,
            ]);

            // 2. Attach to the "photos" media collection
            $this->attachUploadedFile($photo, $file, 'photos');

            // 3. Mirror to file_path for backward compat (relative path)
            if ($media = $photo->getFirstMedia('photos')) {
                $relativeUrl = \Illuminate\Support\Str::after($media->getUrl(), '/storage/');
                $photo->update(['file_path' => $relativeUrl]);
            }

            $uploadedPhotos[] = $photo->fresh();
        }

        $message = count($skipped)
            ? sprintf('%d photo(s) uploaded, %d duplicate(s) skipped', count($uploadedPhotos), count($skipped))
            : 'Photos uploaded successfully';

        return $this->respondOrRedirect($request, $message, response()->json([
            'message' => $message,
            'photos' => $uploadedPhotos,
            'skipped' => $skipped,
        ]));
    }

    /**
     * Dry-run the date resolver for files the uploader is about to send, so
     * the user can see (and correct) dates before uploading. EXIF is only
     * read once the file itself arrives.
     */
    public function resolveDates(Request $request, PhotoDateResolver $dates)
    {
        $data = $request->validate([
            'files' => 'required|array|max:5000',
            'files.*.name' => 'required|string|max:255',
            'files.*.path' => 'nullable|string|max:500',
            'files.*.last_modified' => 'nullable|integer|min:0',
        ]);

        return response()->json([
            'dates' => array_map(function ($f) use ($dates) {
                $resolved = $dates->resolve($f['name'], $f['path'] ?? null, null, $f['last_modified'] ?? null);

                return [
                    'taken_at' => $resolved ? $resolved['taken_at']->format('Y-m-d H:i:s') : null,
                    'source' => $resolved['source'] ?? PhotoDateResolver::SOURCE_UPLOAD,
                ];
            }, $data['files']),
        ]);
    }

    /** @return array{taken_at: \Carbon\CarbonImmutable, source: string} */
    private function resolveTakenAt(PhotoDateResolver $dates, Request $request, int $i, string $localFile, string $name, ?string $relativePath): array
    {
        if ($manual = $request->input("taken_at.$i")) {
            return [
                'taken_at' => \Carbon\CarbonImmutable::parse($manual, config('photos.local_timezone')),
                'source' => PhotoDateResolver::SOURCE_MANUAL,
            ];
        }

        $lastModified = $request->input("last_modified.$i");

        return $dates->resolve($name, $relativePath, $localFile, $lastModified !== null ? (int) $lastModified : null)
            ?? ['taken_at' => $dates->now(), 'source' => PhotoDateResolver::SOURCE_UPLOAD];
    }

    private function iniBytes(string $key): int
    {
        $value = trim((string) ini_get($key));
        $number = (int) $value;

        return match (strtolower(substr($value, -1))) {
            'g' => $number * 1024 ** 3,
            'm' => $number * 1024 ** 2,
            'k' => $number * 1024,
            default => $number,
        };
    }

    public function show(Photo $photo)
    {
        $this->authorize('view', $photo);

        return Inertia::render('Photos/Show', [
            'photo' => $photo->load('project:id,name')
                ->append('photo_url', 'thumb_url', 'preview_url'),
            'can' => ['update' => auth()->user()->can('update', $photo)],
        ]);
    }

    public function edit(Photo $photo)
    {
        $this->authorize('update', $photo);

        return Inertia::render('Photos/Edit', [
            'photo' => $photo,
            'projects' => $this->getEditableProjects(),
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

        DB::transaction(fn () => Photo::withoutSyncingToSearch(fn () => $photo->delete()));

        return $this->respondOrRedirect($request, 'Photo deleted successfully', response()->json(null, 204));
    }

    public function batchDestroy(Request $request)
    {
        return $this->batchDelete($request, Photo::class, 'photo');
    }

    public function download(Request $request)
    {
        return $this->batchDownload($request, Photo::class, 'photo');
    }
}
