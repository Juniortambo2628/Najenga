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

                $currentMonthTotal = Expense::where('user_id', $user->id)
                    ->whereBetween('expense_date', [
                        now()->startOfMonth()->toDateString(),
                        now()->endOfMonth()->toDateString(),
                    ])
                    ->sum('amount');

                $previousMonthTotal = Expense::where('user_id', $user->id)
                    ->whereBetween('expense_date', [
                        now()->subMonth()->startOfMonth()->toDateString(),
                        now()->subMonth()->endOfMonth()->toDateString(),
                    ])
                    ->sum('amount');

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
