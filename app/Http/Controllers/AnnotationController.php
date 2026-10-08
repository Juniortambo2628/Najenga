<?php

namespace App\Http\Controllers;

use App\Http\Requests\AnnotationQueryRequest;
use App\Http\Requests\StoreAnnotationRequest;
use App\Http\Requests\UpdateAnnotationRequest;
use App\Models\Annotation;
use App\Traits\HasPolymorphicType;
use App\Traits\DispatchesActivityNotifications;

class AnnotationController extends Controller
{
    use HasPolymorphicType, DispatchesActivityNotifications;
    public function index(AnnotationQueryRequest $request) {
        $type = $this->getModelClass($request->annotatable_type);
        if (!$type) return response()->json(['error' => 'Invalid type'], 400);

        $annotatable = $type::find($request->annotatable_id);
        if ($annotatable) {
            $this->authorize('view', $annotatable);
        }

        return Annotation::where('annotatable_id', $request->annotatable_id)
            ->where('annotatable_type', $type)
            ->with('user')
            ->get();
    }

    public function store(StoreAnnotationRequest $request)
    {
        $type = $this->getModelClass($request->annotatable_type);
        if (!$type) return response()->json(['error' => 'Invalid type'], 400);

        // annotatable_id is client-supplied and activity on this schema has no
        // FK, so resolve the parent before writing. findOrFail also stops a
        // new annotation being left orphaned against an id that never existed.
        $annotatable = $type::findOrFail($request->annotatable_id);

        // Without this, any signed-in user could annotate someone else's
        // photo, document or project by POSTing its id.
        $this->authorize('view', $annotatable);

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
        $project = $annotatable instanceof \App\Models\Project ? $annotatable : ($annotatable->project ?? null);

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

    public function update(UpdateAnnotationRequest $request, $id)
    {
        // Safety check: The library might send non-numeric string IDs (temp IDs)
        if (!is_numeric($id)) {
            return response()->json(['error' => 'Invalid ID'], 400);
        }

        $annotation = Annotation::findOrFail($id);

        $this->authorize('update', $annotation);

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
