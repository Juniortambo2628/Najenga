<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
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
        $exists = Storage::disk('public')->exists($path);

        if (!$exists) {
            abort(404);
        }

        $parts = explode('/', $path);
        $userId = $parts[1] ?? null;

        if ($userId && (int) $userId !== auth()->id()) {
            if (auth()->user()->role !== 'admin') {
                abort(403, 'Unauthorized access to this file.');
            }
        }

        return Storage::disk('public')->response($path);
    }
}
