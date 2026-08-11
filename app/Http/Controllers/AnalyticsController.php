<?php

namespace App\Http\Controllers;

use App\Models\Document;
use App\Models\Expense;
use App\Models\Photo;
use App\Models\Project;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AnalyticsController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        $userId = $user->id;

        $totalExpenses = Expense::where('user_id', $userId)->sum('amount');

        $expensesByCategory = Expense::where('user_id', $userId)
            ->select('category', \Illuminate\Support\Facades\DB::raw('SUM(amount) as total'))
            ->groupBy('category')
            ->get()
            ->map(function ($row) use ($totalExpenses) {
                return [
                    'category' => $row->category,
                    'total' => (float) $row->total,
                    'percentage' => $totalExpenses > 0 ? round(($row->total / $totalExpenses) * 100, 2) : 0,
                ];
            });

        $expensesByMonth = Expense::where('user_id', $userId)
            ->select('expense_date', \Illuminate\Support\Facades\DB::raw('SUM(amount) as total'))
            ->whereNotNull('expense_date')
            ->groupBy('expense_date')
            ->orderBy('expense_date', 'desc')
            ->limit(180)
            ->get()
            ->groupBy(fn ($row) => \Carbon\Carbon::parse($row->expense_date)->format('Y-m'))
            ->map(function ($rows, $yearMonth) use ($totalExpenses) {
                $total = $rows->sum('total');
                return [
                    'month' => \Carbon\Carbon::parse($yearMonth . '-01')->format('M'),
                    'total' => (float) $total,
                    'percentage' => $totalExpenses > 0 ? round(($total / $totalExpenses) * 100, 2) : 0,
                ];
            })
            ->values()
            ->take(6);

        return Inertia::render('Analytics', [
            'stats' => [
                'totalExpenses' => $totalExpenses,
                'totalProjects' => Project::where('client_id', $userId)->count(),
                'totalPhotos' => Photo::where('user_id', $userId)->count(),
                'totalDocuments' => Document::where('user_id', $userId)->count(),
                'expensesByCategory' => $expensesByCategory,
                'expensesByMonth' => $expensesByMonth,
            ]
        ]);
    }
}
