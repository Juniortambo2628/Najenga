<?php

namespace App\Traits;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/**
 * The "select rows, press delete" action shared by documents, photos and
 * expenses: identical validation, identical owner-scoped delete (skipping rows in projects where the user
 * is only a viewer), identical
 * response shape — only the model and the noun in the message differ.
 */
trait BatchDeletes
{
    protected function batchDelete(Request $request, string $model, string $noun): JsonResponse
    {
        $table = (new $model())->getTable();

        $request->validate([
            'ids' => 'required|array',
            'ids.*' => "integer|exists:{$table},id",
        ]);

        $deleted = 0;

        DB::transaction(function () use ($model, $request, &$deleted) {
            $rows = $model::whereIn('id', $request->input('ids'))
                ->visibleTo(auth()->user())
                ->get()
                ->filter(fn ($row) => auth()->user()->can('delete', $row));

            foreach ($rows as $row) {
                $model::withoutSyncingToSearch(fn () => $row->delete());
                $deleted++;
            }
        });

        return response()->json([
            'deleted' => $deleted,
            'message' => "{$deleted} {$noun}" . ($deleted !== 1 ? 's' : '') . ' deleted',
        ]);
    }
}
