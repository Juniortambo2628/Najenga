<?php

namespace App\Http\Controllers;

use App\Models\Expense;
use App\Models\Photo;
use App\Models\Project;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $user = auth()->user();

        [$totalExpenses, $activeProjects, $totalPhotos, $totalProjects, $expenseTrend, $recentExpenses, $recentProjects] =
            Cache::remember("dashboard:{$user->id}", now()->addSeconds(60), function () use ($user) {
                $recentExpenses = Expense::where('user_id', $user->id)
                    ->with('project:id,name')
                    ->orderBy('created_at', 'desc')
                    ->limit(5)
                    ->get()
                    ->map(fn ($e) => [
                        'id' => $e->id,
                        'title' => $e->title,
                        'amount' => floatval($e->amount),
                        'project_name' => $e->project?->name ?? 'N/A',
                    ]);

                $recentProjects = Project::where('client_id', $user->id)
                    ->orderBy('created_at', 'desc')
                    ->limit(5)
                    ->get(['id', 'name', 'location', 'status']);

                // Whole calendar months as half-open ranges [start, next start):
                // an inclusive end date would drop rows stored with a time part
                // on the last day, and subMonth() overflows on the 29th–31st
                // (31 March would become 3 March).
                $monthTotal = fn ($month) => Expense::where('user_id', $user->id)
                    ->where('expense_date', '>=', $month->copy()->startOfMonth()->toDateString())
                    ->where('expense_date', '<', $month->copy()->startOfMonth()->addMonth()->toDateString())
                    ->sum('amount');

                $currentMonthTotal = $monthTotal(now());
                $previousMonthTotal = $monthTotal(now()->subMonthNoOverflow());

                $expenseTrend = $previousMonthTotal > 0
                    ? round((($currentMonthTotal - $previousMonthTotal) / $previousMonthTotal) * 100, 1)
                    : 0;

                return [
                    Expense::where('user_id', $user->id)->sum('amount'),
                    Project::where('client_id', $user->id)->where('status', 'active')->count(),
                    Photo::where('user_id', $user->id)->count(),
                    Project::where('client_id', $user->id)->count(),
                    $expenseTrend,
                    $recentExpenses,
                    $recentProjects,
                ];
            });

        return Inertia::render('Dashboard', [
            'stats' => [
                'totalExpenses' => floatval($totalExpenses),
                'activeProjects' => $activeProjects,
                'totalPhotos' => $totalPhotos,
                'totalProjects' => $totalProjects,
                'expenseTrend' => $expenseTrend,
            ],
            'recentExpenses' => $recentExpenses,
            'recentProjects' => $recentProjects,
        ]);
    }
}
