<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\Revision;
use App\Services\ActivityLogger;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

/**
 * Version history: the versions of one record, of one project, or of every
 * record of a type the user can see (a page's history), and restoring a
 * version. Restoring needs edit rights on the record (owner, manager or
 * editor of its project; viewers only read).
 */
class HistoryController extends Controller
{
    private const PER_PAGE = 20;

    /**
     * Versions of every record the user can see, or of one type (e.g. the
     * Expenses page), optionally within one project.
     */
    public function index(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'type' => ['nullable', Rule::in(array_keys(Revision::TYPES))],
            'project_id' => ['nullable', 'integer'],
        ]);
        $user = $request->user();

        $query = Revision::query()
            ->when($validated['type'] ?? null, fn (Builder $q, string $type) => $q->where('revisionable_type', (new (Revision::TYPES[$type]))->getMorphClass()))
            ->where(fn (Builder $q) => $q
                ->whereIn('project_id', Project::accessibleBy($user)->select('id'))
                ->orWhere(fn (Builder $own) => $own->whereNull('project_id')->where('user_id', $user->id)));

        if ($projectId = $validated['project_id'] ?? null) {
            $this->authorize('view', Project::findOrFail($projectId));
            $query->where('project_id', $projectId);
        }

        return $this->page($query);
    }

    /** Every version of every record under one project. */
    public function project(Request $request, Project $project): JsonResponse
    {
        $this->authorize('view', $project);
        $request->validate(['type' => ['nullable', Rule::in(array_keys(Revision::TYPES))]]);

        $query = Revision::where('project_id', $project->id);
        if ($type = $request->input('type')) {
            $query->where('revisionable_type', (new (Revision::TYPES[$type]))->getMorphClass());
        }

        return $this->page($query);
    }

    /** The versions of one record, also once it is in the trash. */
    public function record(string $type, int $id): JsonResponse
    {
        abort_unless(isset(Revision::TYPES[$type]), 404);
        $record = Revision::TYPES[$type]::withTrashed()->findOrFail($id);
        $this->authorize('view', $record);

        return $this->page($record->revisions()->getQuery());
    }

    /**
     * Bring a record back to how it was in this version (or back from the
     * trash); with `undo`, to how it was before this change.
     */
    public function restore(Request $request, Revision $revision): JsonResponse
    {
        $undo = $request->boolean('undo');
        abort_unless($revision->isRestorable($undo), 422, 'This version cannot be restored.');

        // A record deleted for good is recreated under its project: that
        // project's edit rights decide.
        $subject = $revision->subject() ?? Project::find($revision->project_id);
        abort_unless($subject, 403);
        $this->authorize('update', $subject);

        $record = $revision->restoreVersion($undo);
        $label = self::label($revision->snapshot($undo)) ?? "{$revision->type()} #{$record->getKey()}";

        ActivityLogger::log(
            "{$revision->type()}.restored",
            sprintf('Restored %s "%s" to the version of %s', $revision->type(), $label, $revision->created_at->toDayDateTimeString()),
            $record,
        );

        return response()->json([
            'message' => "Restored {$label}",
            'record' => ['type' => $revision->type(), 'id' => $record->getKey()],
        ]);
    }

    private function page(Builder $query): JsonResponse
    {
        $page = $query->with('user')->latest('id')->paginate(self::PER_PAGE);

        return response()->json($page->through(fn (Revision $revision) => [
            'id' => $revision->id,
            'event' => $revision->event,
            'type' => $revision->type(),
            'record_id' => $revision->revisionable_id,
            'project_id' => $revision->project_id,
            'label' => self::label($revision->after ?? $revision->before),
            'user' => $revision->user ? ['id' => $revision->user->id, 'name' => $revision->user->name] : null,
            'at' => $revision->updated_at->toIso8601String(),
            'changes' => $revision->diff(),
            'restorable' => $revision->isRestorable(),
            'undoable' => $revision->event === 'updated' && $revision->isRestorable(true),
        ]));
    }

    /** A record's human name from its fields. */
    private static function label(?array $fields): ?string
    {
        foreach (['name', 'title', 'original_name', 'filename'] as $field) {
            if (filled($fields[$field] ?? null)) {
                return (string) $fields[$field];
            }
        }

        return null;
    }
}
