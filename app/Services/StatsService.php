<?php

namespace App\Services;

use App\Models\Expense;
use Illuminate\Support\Facades\DB;

class StatsService
{
    /**
     * Total expense amount for each of the given projects, keyed by project id.
     *
     * Replaces the two per-project SUM() queries that AnalyticsController used
     * to run inside its map() callback (one for the total, one for the budget
     * percentage): two queries per project, N+1 across the result set.
     *
     * @param  iterable<int>  $projectIds
     * @return array<int, float>
     */
    public function projectExpenseTotals(iterable $projectIds): array
    {
        $ids = collect($projectIds)->unique()->values()->all();

        if ($ids === []) {
            return [];
        }

        $rows = Expense::query()
            ->whereIn('project_id', $ids)
            ->groupBy('project_id')
            ->get(['project_id', DB::raw('SUM(amount) as total')]);

        $totals = [];

        foreach ($rows as $row) {
            $totals[(int) $row->project_id] = (float) $row->total;
        }

        return $totals;
    }
}
