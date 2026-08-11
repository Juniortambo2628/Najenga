<?php

namespace App\Http\Controllers;

use App\Models\Expense;
use App\Models\Photo;
use App\Models\Project;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $user = auth()->user();

        $totalExpenses = Expense::where('user_id', $user->id)->sum('amount');
        $activeProjects = Project::where('client_id', $user->id)->where('status', 'active')->count();
        $totalPhotos = Photo::where('user_id', $user->id)->count();
        $totalProjects = Project::where('client_id', $user->id)->count();

        $recentExpenses = Expense::where('user_id', $user->id)
            ->with('project:id,name')
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get()
            ->map(fn($e) => [
                'id' => $e->id,
                'title' => $e->title,
                'amount' => floatval($e->amount),
                'project_name' => $e->project?->name ?? 'N/A',
            ]);

        $recentProjects = Project::where('client_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get(['id', 'name', 'location', 'status']);

        return Inertia::render('Dashboard', [
            'stats' => [
                'totalExpenses' => floatval($totalExpenses),
                'activeProjects' => $activeProjects,
                'totalPhotos' => $totalPhotos,
                'totalProjects' => $totalProjects,
                'expenseTrend' => 0,
            ],
            'recentExpenses' => $recentExpenses,
            'recentProjects' => $recentProjects,
        ]);
    }
}
