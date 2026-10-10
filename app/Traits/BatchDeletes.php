<?php

namespace App\Traits;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/**
 * The "select rows, press delete" action shared by documents, photos and
 * expenses: identical validation, identical owner-scoped delete, identical
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
                ->where('user_id', auth()->id())
                ->get();

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
