<?php

namespace App\Traits;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpFoundation\StreamedResponse;
use ZipArchive;

/**
 * The "select rows, press download" action shared by documents and photos:
 * identical validation, identical owner-scoped selection, identical zip
 * streaming - only the model and the noun in the filename differ.
 */
trait BatchDownloads
{
    protected function batchDownload(Request $request, string $model, string $noun): StreamedResponse
    {
        $table = (new $model())->getTable();

        $request->validate([
            'ids' => 'required|array',
            'ids.*' => "integer|exists:{$table},id",
        ]);

        $records = $model::whereIn('id', $request->input('ids'))
            ->where('user_id', auth()->id())
            ->get();

        $zipPath = tempnam(sys_get_temp_dir(), 'najenga-download-');

        $zip = new ZipArchive();
        $zip->open($zipPath, ZipArchive::OVERWRITE);

        $added = 0;

        foreach ($records as $record) {
            $path = $record->file_path;

            if (! $path || ! Storage::disk('public')->exists($path)) {
                continue;
            }

            if (! $zip->addFile(Storage::disk('public')->path($path), $record->id . '-' . basename($path))) {
                continue;
            }

            $added++;
        }

        $zip->close();

        if ($added === 0) {
            @unlink($zipPath);

            throw ValidationException::withMessages([
                'ids' => "No downloadable {$noun} files among the selected items.",
            ]);
        }

        return response()->streamDownload(function () use ($zipPath) {
            readfile($zipPath);
            @unlink($zipPath);
        }, "{$noun}s-" . now()->format('Ymd-His') . '.zip', [
            'Content-Type' => 'application/zip',
        ]);
    }
}
