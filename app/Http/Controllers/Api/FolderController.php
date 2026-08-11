<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreFolderRequest;
use App\Http\Requests\UpdateFolderRequest;
use App\Models\Folder;
use App\Models\Document;
use Illuminate\Http\Request;

class FolderController extends Controller
{
    public function store(StoreFolderRequest $request)
    {
        $validated = $request->validated();

        $project = \App\Models\Project::findOrFail($validated['project_id']);
        $this->authorize('update', $project);

        Folder::create($validated);

        return redirect()->back()->with('success', 'Folder created successfully');
    }

    public function update(UpdateFolderRequest $request, Folder $folder)
    {
        $this->authorize('update', $folder);

        $folder->update($request->validated());

        return redirect()->back()->with('success', 'Folder updated successfully');
    }

    public function destroy(Folder $folder)
    {
        $this->authorize('delete', $folder);

        $this->detachDocumentsRecursively($folder);
        $folder->delete();

        return redirect()->back()->with('success', 'Folder deleted successfully');
    }

    private function detachDocumentsRecursively(Folder $folder)
    {
        Document::where('folder_id', $folder->id)->update(['folder_id' => null]);

        foreach ($folder->children as $child) {
            $this->detachDocumentsRecursively($child);
        }
    }
}
