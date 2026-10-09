<?php

namespace App\Traits;

use Illuminate\Http\UploadedFile;

trait AttachesMediaFromRequest
{
    /**
     * Attach an uploaded file to a model via Spatie Media Library.
     */
    protected function attachUploadedFile($model, UploadedFile $file, string $collection, string $disk = 'public'): void
    {
        $model
            ->addMedia($file)
            ->usingName($file->getClientOriginalName())
            ->usingFileName($file->hashName())
            ->withCustomProperties([
                'original_name' => $file->getClientOriginalName(),
                'mime_type' => $file->getMimeType(),
                'size' => $file->getSize(),
            ])
            ->toMediaCollection($collection, $disk);
    }
}
