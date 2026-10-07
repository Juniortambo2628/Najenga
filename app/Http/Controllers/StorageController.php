<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Spatie\MediaLibrary\MediaCollections\Models\Media;
use Symfony\Component\HttpFoundation\StreamedResponse;

class StorageController extends Controller
{
    /**
     * Serve files from the public storage disk.
     *
     * @param  string  $path
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function show($path)
    {
        abort_unless(auth()->check(), 403);

        if (!Storage::disk('public')->exists($path)) {
            abort(404);
        }

        if (auth()->user()->role === 'admin') {
            return Storage::disk('public')->response($path);
        }

        $mediaId = (int) (explode('/', $path)[0] ?? 0);
        $media = Media::query()
            ->where('disk', 'public')
            ->where('id', $mediaId)
            ->first();

        if (!$media || $media->getPathRelativeToRoot() !== $path) {
            abort(403, 'Unauthorized access to this file.');
        }

        $model = $media->model;

        if (!$model || !auth()->user()->can('view', $model)) {
            abort(403, 'Unauthorized access to this file.');
        }

        return Storage::disk('public')->response($path);
    }
}
