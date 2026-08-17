<?php

namespace App\Http\Controllers;

use App\Models\Document;
use App\Models\Expense;
use App\Models\Photo;
use App\Models\Project;
use App\Models\ProjectTimeline;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class AnalyticsController extends Controller
{
    public function index(Request $request)
    {
        $user = auth()->user();
        $userId = $user->id;
        $projectId = $request->input('project_id');
        $startDate = $request->input('start_date');
        $endDate = $request->input('end_date');
        $period = $request->input('period', '6months');

        // Base queries
        $expenseQuery = Expense::where('user_id', $userId);
        $photoQuery = Photo::where('user_id', $userId);
        $docQuery = Document::where('user_id', $userId);
        $projectQuery = Project::where('client_id', $userId);
        $timelineQuery = ProjectTimeline::whereHas('project', fn ($q) => $q->where('client_id', $userId));

        if ($projectId) {
            $expenseQuery->where('project_id', $projectId);
            $photoQuery->where('project_id', $projectId);
            $docQuery->where('project_id', $projectId);
            $timelineQuery->where('project_id', $projectId);
        }

        if ($startDate) {
            $expenseQuery->where('expense_date', '>=', $startDate);
            $photoQuery->where('photo_date', '>=', $startDate);
            $docQuery->where('document_date', '>=', $startDate);
        }

        if ($endDate) {
            $expenseQuery->where('expense_date', '<=', $endDate);
            $photoQuery->where('photo_date', '<=', $endDate);
            $docQuery->where('document_date', '<=', $endDate);
        }

        // Overview stats
        $totalExpenses = (clone $expenseQuery)->sum('amount');
        $totalProjects = $projectQuery->count();
        $totalPhotos = (clone $photoQuery)->count();
        $totalDocuments = (clone $docQuery)->count();
        $totalMilestones = (clone $timelineQuery)->count();
        $completedMilestones = (clone $timelineQuery)->where('status', 'completed')->count();

        // Expenses by category with percentages
        $expensesByCategory = (clone $expenseQuery)
            ->select('category', DB::raw('SUM(amount) as total'), DB::raw('COUNT(*) as count'))
            ->groupBy('category')
            ->get()
            ->map(fn ($row) => [
                'category' => $row->category,
                'total' => (float) $row->total,
                'count' => (int) $row->count,
                'percentage' => $totalExpenses > 0 ? round(($row->total / $totalExpenses) * 100, 1) : 0,
            ])
            ->sortByDesc('total')
            ->values();

        // Expenses by payment method
        $expensesByPaymentMethod = (clone $expenseQuery)
            ->select('payment_method', DB::raw('SUM(amount) as total'), DB::raw('COUNT(*) as count'))
            ->groupBy('payment_method')
            ->get()
            ->map(fn ($row) => [
                'method' => $row->payment_method ?: 'Unknown',
                'total' => (float) $row->total,
                'count' => (int) $row->count,
                'percentage' => $totalExpenses > 0 ? round(($row->total / $totalExpenses) * 100, 1) : 0,
            ])
            ->sortByDesc('total')
            ->values();

        // Monthly expense trend (last N months based on period)
        $monthLimit = match ($period) {
            '3months' => 3,
            '6months' => 6,
            '1year' => 12,
            'all' => 120,
            default => 6,
        };

        $isSqlite = config('database.default') === 'sqlite' || config('database.connections.' . config('database.default') . '.driver') === 'sqlite';

        $ymRaw = $isSqlite ? "strftime('%Y-%m', expense_date)" : "DATE_FORMAT(expense_date, '%Y-%m')";
        $ymExpr = DB::raw($ymRaw);

        $monthlyExpenses = (clone $expenseQuery)
            ->whereNotNull('expense_date')
            ->select(
                DB::raw("{$ymRaw} as year_month"),
                DB::raw('SUM(amount) as total'),
                DB::raw('COUNT(*) as count')
            )
            ->groupBy($ymExpr)
            ->orderBy($ymExpr, 'desc')
            ->limit($monthLimit)
            ->get()
            ->reverse()
            ->values()
            ->map(fn ($row) => [
                'month' => Carbon::parse($row->year_month . '-01')->format('M Y'),
                'short' => Carbon::parse($row->year_month . '-01')->format('M'),
                'total' => (float) $row->total,
                'count' => (int) $row->count,
            ]);

        // Daily expenses for the last 30 days (for sparkline)
        $dailyExpenses = Expense::where('user_id', $userId)
            ->where('expense_date', '>=', Carbon::now()->subDays(30))
            ->select(
                DB::raw('DATE(expense_date) as day'),
                DB::raw('SUM(amount) as total')
            )
            ->groupBy('day')
            ->orderBy('day')
            ->get()
            ->map(fn ($row) => [
                'date' => $row->day,
                'total' => (float) $row->total,
            ]);

        // Expense status breakdown
        $expenseStatusBreakdown = (clone $expenseQuery)
            ->select('status', DB::raw('COUNT(*) as count'), DB::raw('SUM(amount) as total'))
            ->groupBy('status')
            ->get()
            ->map(fn ($row) => [
                'status' => $row->status ?: 'unknown',
                'count' => (int) $row->count,
                'total' => (float) $row->total,
            ]);

        // Top recipients
        $topRecipients = (clone $expenseQuery)
            ->whereNotNull('recipient')
            ->where('recipient', '!=', '')
            ->select('recipient', DB::raw('SUM(amount) as total'), DB::raw('COUNT(*) as count'))
            ->groupBy('recipient')
            ->orderByDesc('total')
            ->limit(10)
            ->get()
            ->map(fn ($row) => [
                'recipient' => $row->recipient,
                'total' => (float) $row->total,
                'count' => (int) $row->count,
            ]);

        // Project-level summary
        $projectSummaries = Project::where('client_id', $userId)
            ->withCount(['expenses', 'photos', 'documents'])
            ->get()
            ->map(fn ($project) => [
                'id' => $project->id,
                'name' => $project->name,
                'status' => $project->status,
                'budget' => (float) $project->budget,
                'total_expenses' => Expense::where('project_id', $project->id)->sum('amount'),
                'expense_count' => $project->expenses_count,
                'photo_count' => $project->photos_count,
                'document_count' => $project->documents_count,
                'budget_used_percentage' => $project->budget > 0
                    ? round((Expense::where('project_id', $project->id)->sum('amount') / $project->budget) * 100, 1)
                    : 0,
            ]);

        // Average expense amount
        $avgExpense = (clone $expenseQuery)->avg('amount');

        // Expense frequency (avg per day over the period)
        $firstExpenseDate = Expense::where('user_id', $userId)->min('expense_date');
        $daysSinceFirst = $firstExpenseDate ? Carbon::parse($firstExpenseDate)->diffInDays(now()) : 1;
        $expenseFrequency = $daysSinceFirst > 0 ? round($totalExpenses / $daysSinceFirst, 2) : 0;

        // Photos by category
        $photosByCategory = (clone $photoQuery)
            ->select('category', DB::raw('COUNT(*) as count'))
            ->groupBy('category')
            ->get()
            ->map(fn ($row) => [
                'category' => $row->category ?: 'Uncategorized',
                'count' => (int) $row->count,
            ]);

        // Documents by type
        $documentsByType = (clone $docQuery)
            ->select('document_type', DB::raw('COUNT(*) as count'))
            ->groupBy('document_type')
            ->get()
            ->map(fn ($row) => [
                'type' => $row->document_type ?: 'Other',
                'count' => (int) $row->count,
            ]);

        // Milestone status breakdown
        $milestoneStatusBreakdown = (clone $timelineQuery)
            ->select('status', DB::raw('COUNT(*) as count'))
            ->groupBy('status')
            ->get()
            ->map(fn ($row) => [
                'status' => $row->status,
                'count' => (int) $row->count,
            ]);

        // Insights (computed)
        $insights = $this->generateInsights(
            $totalExpenses,
            $avgExpense,
            $expensesByCategory,
            $monthlyExpenses,
            $topRecipients,
            $projectSummaries
        );

        return Inertia::render('Analytics', [
            'stats' => [
                'totalExpenses' => (float) $totalExpenses,
                'totalProjects' => $totalProjects,
                'totalPhotos' => $totalPhotos,
                'totalDocuments' => $totalDocuments,
                'totalMilestones' => $totalMilestones,
                'completedMilestones' => $completedMilestones,
                'avgExpense' => round((float) $avgExpense, 2),
                'expenseFrequency' => $expenseFrequency,
            ],
            'expensesByCategory' => $expensesByCategory,
            'expensesByPaymentMethod' => $expensesByPaymentMethod,
            'monthlyExpenses' => $monthlyExpenses,
            'dailyExpenses' => $dailyExpenses,
            'expenseStatusBreakdown' => $expenseStatusBreakdown,
            'topRecipients' => $topRecipients,
            'projectSummaries' => $projectSummaries,
            'photosByCategory' => $photosByCategory,
            'documentsByType' => $documentsByType,
            'milestoneStatusBreakdown' => $milestoneStatusBreakdown,
            'insights' => $insights,
            'projects' => Project::where('client_id', $userId)->get(['id', 'name']),
        ]);
    }

    private function generateInsights(
        $totalExpenses,
        $avgExpense,
        $expensesByCategory,
        $monthlyExpenses,
        $topRecipients,
        $projectSummaries
    ): array {
        $insights = [];

        // Highest spending category
        if ($expensesByCategory->isNotEmpty()) {
            $top = $expensesByCategory->first();
            $insights[] = [
                'type' => 'spending',
                'icon' => 'fa-chart-pie',
                'title' => 'Top Spending Category',
                'value' => $top['category'],
                'detail' => number_format($top['total'], 2) . ' (' . $top['percentage'] . '% of total)',
                'severity' => 'info',
            ];
        }

        // Monthly trend
        if ($monthlyExpenses->count() >= 2) {
            $latest = $monthlyExpenses->last();
            $previous = $monthlyExpenses->slice(-2, 1)->first();
            $change = $previous['total'] > 0
                ? round((($latest['total'] - $previous['total']) / $previous['total']) * 100, 1)
                : 0;

            $insights[] = [
                'type' => 'trend',
                'icon' => $change >= 0 ? 'fa-arrow-up' : 'fa-arrow-down',
                'title' => 'Monthly Spending Trend',
                'value' => ($change >= 0 ? '+' : '') . $change . '%',
                'detail' => 'Compared to previous month (' . $latest['month'] . ')',
                'severity' => ($change > 20 ? 'warning' : ($change < -20 ? 'success' : 'info')),
            ];
        }

        // Average expense
        $insights[] = [
            'type' => 'average',
            'icon' => 'fa-calculator',
            'title' => 'Average Expense',
            'value' => number_format($avgExpense, 2),
            'detail' => 'Across all recorded expenses',
            'severity' => 'info',
        ];

        // Top recipient
        if ($topRecipients->isNotEmpty()) {
            $top = $topRecipients->first();
            $insights[] = [
                'type' => 'recipient',
                'icon' => 'fa-user-tie',
                'title' => 'Top Recipient',
                'value' => $top['recipient'],
                'detail' => number_format($top['total'], 2) . ' across ' . $top['count'] . ' transactions',
                'severity' => 'info',
            ];
        }

        // Budget alerts
        $overBudgetProjects = $projectSummaries->filter(fn ($p) => $p['budget_used_percentage'] > 90);
        if ($overBudgetProjects->isNotEmpty()) {
            $insights[] = [
                'type' => 'budget_alert',
                'icon' => 'fa-exclamation-triangle',
                'title' => 'Budget Alert',
                'value' => $overBudgetProjects->count() . ' project(s) over 90% budget',
                'detail' => $overBudgetProjects->pluck('name')->join(', '),
                'severity' => 'warning',
            ];
        }

        // Highest spending project
        $topProject = $projectSummaries->sortByDesc('total_expenses')->first();
        if ($topProject && $topProject['total_expenses'] > 0) {
            $insights[] = [
                'type' => 'project',
                'icon' => 'fa-project-diagram',
                'title' => 'Highest Spending Project',
                'value' => $topProject['name'],
                'detail' => number_format($topProject['total_expenses'], 2) . ' in expenses',
                'severity' => 'info',
            ];
        }

        return $insights;
    }
}
