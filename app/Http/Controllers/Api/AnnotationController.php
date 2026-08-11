<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Annotation;
use App\Traits\HasPolymorphicType;
use App\Traits\DispatchesActivityNotifications;

class AnnotationController extends Controller
{
    use HasPolymorphicType, DispatchesActivityNotifications;
    public function index(Request $request) {
        $request->validate([
            'annotatable_id' => 'required|integer',
            'annotatable_type' => 'required|string',
        ]);
        
        $type = $this->getModelClass($request->annotatable_type);
        if (!$type) return response()->json(['error' => 'Invalid type'], 400);

        return Annotation::where('annotatable_id', $request->annotatable_id)
            ->where('annotatable_type', $type)
            ->with('user')
            ->get();
    }

    public function store(Request $request)
    {
        $request->validate([
            'annotatable_id' => 'required|integer',
            'annotatable_type' => 'required|string',
            'x' => 'required|numeric',
            'y' => 'required|numeric',
            'width' => 'nullable|numeric',
            'height' => 'nullable|numeric',
            'body' => 'nullable|string',
        ]);

        $type = $this->getModelClass($request->annotatable_type);
        if (!$type) return response()->json(['error' => 'Invalid type'], 400);

        $annotation = Annotation::create([
            'annotatable_id' => $request->annotatable_id,
            'annotatable_type' => $type,
            'user_id' => $request->user()->id,
            'x' => $request->x,
            'y' => $request->y,
            'width' => $request->width,
            'height' => $request->height,
            'body' => $request->body ?? '',
        ]);

        // Notify other project users
        $resource = $type::find($request->annotatable_id);
        $project = $resource instanceof \App\Models\Project ? $resource : ($resource->project ?? null);
        
        if ($project) {
            $this->notifyProjectMembers(
                $project,
                $request->user()->name,
                'New Annotation',
                $request->user()->name . ' added an annotation'
            );
        }

        return response()->json($annotation->load('user'), 201);
    }

    public function update(Request $request, $id)
    {
        // Safety check: The library might send non-numeric string IDs (temp IDs)
        if (!is_numeric($id)) {
            return response()->json(['error' => 'Invalid ID'], 400);
        }

        $annotation = Annotation::findOrFail($id);

        $this->authorize('update', $annotation);

        $request->validate([
            'x' => 'nullable|numeric',
            'y' => 'nullable|numeric',
            'width' => 'nullable|numeric',
            'height' => 'nullable|numeric',
            'body' => 'nullable|string',
        ]);

        $data = $request->only(['x', 'y', 'width', 'height', 'body']);
        
        // Ensure body is not null
        if (array_key_exists('body', $data) && is_null($data['body'])) {
            $data['body'] = '';
        }

        $annotation->update($data);

        return response()->json($annotation->load('user'));
    }

    public function destroy(Annotation $annotation)
    {
        $this->authorize('delete', $annotation);

        $annotation->delete();
        return response()->json(null, 204);
    }
}
