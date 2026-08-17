import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useState, useMemo } from 'react';
import StatCard from '@/Components/StatCard';
import Card from '@/Components/Card';
import DashboardHero from '@/Components/DashboardHero';
import EmptyState from '@/Components/EmptyState';
import { formatCurrency } from '@/Config/currencies';

const PERIODS = [
    { value: '3months', label: '3 Months' },
    { value: '6months', label: '6 Months' },
    { value: '1year', label: '1 Year' },
    { value: 'all', label: 'All Time' },
];

const INSIGHT_COLORS = {
    info: 'border-blue-500/30 bg-blue-500/5',
    success: 'border-green-500/30 bg-green-500/5',
    warning: 'border-yellow-500/30 bg-yellow-500/5',
};

const CHART_COLORS = [
    '#DC143C', '#F59E0B', '#06B6D4', '#8B5CF6', '#EC4899',
    '#10B981', '#F97316', '#6366F1', '#14B8A6', '#EF4444',
];

function BarChart({ data, labelKey, valueKey, maxBars = 10 }) {
    const maxVal = Math.max(...data.map((d) => d[valueKey]), 1);
    return (
        <div className="space-y-3">
            {data.slice(0, maxBars).map((item, i) => (
                <div key={i}>
                    <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-400">{item[labelKey]}</span>
                        <span className="text-white font-mono text-xs">{typeof item[valueKey] === 'number' && item[valueKey] > 100 ? formatCurrency(item[valueKey]) : item[valueKey]}</span>
                    </div>
                    <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-[rgb(139,0,0)] to-[rgb(220,20,60)] rounded-full transition-all duration-700"
                            style={{ width: `${(item[valueKey] / maxVal) * 100}%` }}
                        />
                    </div>
                </div>
            ))}
        </div>
    );
}

function DonutChart({ data, labelKey, valueKey }) {
    const total = data.reduce((sum, d) => sum + d[valueKey], 0);
    let cumulative = 0;

    return (
        <div className="flex items-center gap-6">
            <div className="relative w-32 h-32 flex-shrink-0">
                <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                    {data.map((item, i) => {
                        const pct = total > 0 ? (item[valueKey] / total) * 100 : 0;
                        const offset = cumulative;
                        cumulative += pct;
                        return (
                            <circle
                                key={i}
                                cx="18" cy="18" r="14"
                                fill="none"
                                stroke={CHART_COLORS[i % CHART_COLORS.length]}
                                strokeWidth="4"
                                strokeDasharray={`${pct} ${100 - pct}`}
                                strokeDashoffset={`${-offset}`}
                                className="transition-all duration-700"
                            />
                        );
                    })}
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                        <div className="text-white font-bold text-lg">{data.length}</div>
                        <div className="text-gray-500 text-[10px] uppercase">items</div>
                    </div>
                </div>
            </div>
            <div className="flex-1 space-y-2">
                {data.map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                        <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                        <span className="text-gray-400 truncate">{item[labelKey]}</span>
                        <span className="text-white font-mono text-xs ml-auto">{item[valueKey]}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

function TrendChart({ data }) {
    if (!data || data.length === 0) return null;
    const maxVal = Math.max(...data.map((d) => d.total), 1);
    const maxH = 160;

    return (
        <div className="flex items-end gap-1.5" style={{ height: maxH }}>
            {data.map((month, i) => {
                const h = Math.max((month.total / maxVal) * maxH, 4);
                return (
                    <div key={i} className="flex-1 flex flex-col items-center justify-end group relative" style={{ height: maxH }}>
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap z-10 pointer-events-none">
                            {formatCurrency(month.total)}
                        </div>
                        <div
                            className="w-full bg-gradient-to-t from-[rgb(139,0,0)] to-[rgb(220,20,60)] rounded-t transition-all duration-500 hover:opacity-80"
                            style={{ height: h }}
                        />
                        <span className="text-[10px] text-gray-500 mt-1.5 truncate w-full text-center">{month.short}</span>
                    </div>
                );
            })}
        </div>
    );
}

function InsightCard({ insight }) {
    return (
        <div className={`border rounded-xl p-4 ${INSIGHT_COLORS[insight.severity] || INSIGHT_COLORS.info}`}>
            <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                    <i className={`fas ${insight.icon} text-sm ${insight.severity === 'warning' ? 'text-yellow-400' : insight.severity === 'success' ? 'text-green-400' : 'text-blue-400'}`}></i>
                </div>
                <div className="min-w-0">
                    <h4 className="text-gray-400 text-xs uppercase tracking-wider mb-0.5">{insight.title}</h4>
                    <p className="text-white font-bold">{insight.value}</p>
                    <p className="text-gray-500 text-xs mt-0.5 truncate">{insight.detail}</p>
                </div>
            </div>
        </div>
    );
}

function ProjectBudgetBar({ project }) {
    const pct = Math.min(project.budget_used_percentage, 100);
    const isOver = project.budget_used_percentage > 100;
    const isWarning = project.budget_used_percentage > 80;

    return (
        <div className="bg-gray-900/50 border border-white/10 rounded-xl p-4 hover:border-white/20 transition">
            <div className="flex justify-between items-center mb-2">
                <h4 className="text-white font-medium text-sm truncate">{project.name}</h4>
                <span className={`text-xs font-bold ${isOver ? 'text-red-400' : isWarning ? 'text-yellow-400' : 'text-green-400'}`}>
                    {project.budget_used_percentage}%
                </span>
            </div>
            <div className="h-2 bg-gray-800 rounded-full overflow-hidden mb-2">
                <div
                    className={`h-full rounded-full transition-all duration-700 ${isOver ? 'bg-red-500' : isWarning ? 'bg-yellow-500' : 'bg-gradient-to-r from-[rgb(139,0,0)] to-[rgb(220,20,60)]'}`}
                    style={{ width: `${pct}%` }}
                />
            </div>
            <div className="flex justify-between text-xs text-gray-500">
                <span>{formatCurrency(project.total_expenses)} spent</span>
                <span>{formatCurrency(project.budget)} budget</span>
            </div>
            <div className="flex gap-3 mt-2 text-xs text-gray-500">
                <span><i className="fas fa-receipt mr-1"></i>{project.expense_count}</span>
                <span><i className="fas fa-images mr-1"></i>{project.photo_count}</span>
                <span><i className="fas fa-file-alt mr-1"></i>{project.document_count}</span>
            </div>
        </div>
    );
}

export default function Analytics({
    stats = {},
    expensesByCategory = [],
    expensesByPaymentMethod = [],
    monthlyExpenses = [],
    expenseStatusBreakdown = [],
    topRecipients = [],
    projectSummaries = [],
    photosByCategory = [],
    documentsByType = [],
    milestoneStatusBreakdown = [],
    insights = [],
    projects = [],
}) {
    const [period, setPeriod] = useState('6months');
    const [projectFilter, setProjectFilter] = useState(null);

    const handleContextChange = (newPeriod, newProject) => {
        setPeriod(newPeriod);
        setProjectFilter(newProject);
        router.get('/analytics', { period: newPeriod, project_id: newProject }, { preserveState: true, replace: true });
    };

    const totalExpenses = stats.totalExpenses || 0;
    const totalProjects = stats.totalProjects || 0;
    const totalPhotos = stats.totalPhotos || 0;
    const totalDocuments = stats.totalDocuments || 0;
    const totalMilestones = stats.totalMilestones || 0;
    const completedMilestones = stats.completedMilestones || 0;
    const avgExpense = stats.avgExpense || 0;

    return (
        <AuthenticatedLayout>
            <Head title="Analytics" />

            <div>
                <DashboardHero
                    title="Advanced Analytics"
                    subtitle="Deep insights into your construction project data"
                    breadcrumbs={[
                        { label: 'Home', href: '/home' },
                        { label: 'Dashboard', href: '/dashboard' },
                        { label: 'Analytics' },
                    ]}
                    actions={
                        <div className="flex items-center gap-3">
                            <select
                                value={projectFilter || ''}
                                onChange={(e) => handleContextChange(period, e.target.value || null)}
                                className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-gray-300 focus:outline-none focus:border-[#8B0000]"
                            >
                                <option value="">All Projects</option>
                                {projects.map((p) => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>
                        </div>
                    }
                />

                {/* Period Selector */}
                <div className="flex gap-1 mb-6 bg-gray-900/50 border border-white/10 rounded-xl p-1 w-fit">
                    {PERIODS.map((p) => (
                        <button
                            key={p.value}
                            onClick={() => handleContextChange(p.value, projectFilter)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                                period === p.value
                                    ? 'bg-gradient-to-r from-[rgb(139,0,0)] to-[rgb(220,20,60)] text-white shadow-lg'
                                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                            }`}
                        >
                            {p.label}
                        </button>
                    ))}
                </div>

                {/* Overview Stats */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
                    <StatCard icon="fa-receipt" label="Total Expenses" value={formatCurrency(totalExpenses)} />
                    <StatCard icon="fa-calculator" label="Avg Expense" value={formatCurrency(avgExpense)} />
                    <StatCard icon="fa-project-diagram" label="Projects" value={totalProjects} />
                    <StatCard icon="fa-images" label="Photos" value={totalPhotos} />
                    <StatCard icon="fa-file-alt" label="Documents" value={totalDocuments} />
                    <StatCard icon="fa-flag" label="Milestones" value={`${completedMilestones}/${totalMilestones}`} />
                </div>

                {/* Insights */}
                {insights.length > 0 && (
                    <div className="mb-8">
                        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <i className="fas fa-lightbulb text-yellow-400"></i> Key Insights
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {insights.map((insight, i) => (
                                <InsightCard key={i} insight={insight} />
                            ))}
                        </div>
                    </div>
                )}

                {/* Monthly Trend + Category Breakdown */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    <Card className="lg:col-span-2">
                        <h3 className="text-xl font-semibold text-white mb-6">Monthly Expense Trend</h3>
                        {monthlyExpenses.length === 0 ? (
                            <EmptyState icon="fa-chart-line" title="No trend data" message="Add expenses to see trends" />
                        ) : (
                            <TrendChart data={monthlyExpenses} />
                        )}
                    </Card>

                    <Card>
                        <h3 className="text-xl font-semibold text-white mb-6">By Category</h3>
                        {expensesByCategory.length === 0 ? (
                            <EmptyState icon="fa-chart-pie" title="No data" message="No expenses recorded" />
                        ) : (
                            <DonutChart data={expensesByCategory} labelKey="category" valueKey="total" />
                        )}
                    </Card>
                </div>

                {/* Payment Methods + Status + Top Recipients */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    <Card>
                        <h3 className="text-lg font-semibold text-white mb-4">Payment Methods</h3>
                        {expensesByPaymentMethod.length === 0 ? (
                            <div className="text-center py-6 text-gray-500 text-sm">No data</div>
                        ) : (
                            <BarChart data={expensesByPaymentMethod} labelKey="method" valueKey="total" />
                        )}
                    </Card>

                    <Card>
                        <h3 className="text-lg font-semibold text-white mb-4">Expense Status</h3>
                        {expenseStatusBreakdown.length === 0 ? (
                            <div className="text-center py-6 text-gray-500 text-sm">No data</div>
                        ) : (
                            <BarChart data={expenseStatusBreakdown.map((s) => ({ ...s, label: s.status }))} labelKey="label" valueKey="count" />
                        )}
                    </Card>

                    <Card>
                        <h3 className="text-lg font-semibold text-white mb-4">Top Recipients</h3>
                        {topRecipients.length === 0 ? (
                            <div className="text-center py-6 text-gray-500 text-sm">No data</div>
                        ) : (
                            <BarChart data={topRecipients} labelKey="recipient" valueKey="total" />
                        )}
                    </Card>
                </div>

                {/* Project Budgets */}
                {projectSummaries.length > 0 && (
                    <div className="mb-8">
                        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <i className="fas fa-project-diagram text-[#DC143C]"></i> Project Budget Usage
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {projectSummaries.map((project) => (
                                <ProjectBudgetBar key={project.id} project={project} />
                            ))}
                        </div>
                    </div>
                )}

                {/* Media & Milestones */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Card>
                        <h3 className="text-lg font-semibold text-white mb-4">Photos by Category</h3>
                        {photosByCategory.length === 0 ? (
                            <div className="text-center py-6 text-gray-500 text-sm">No photos</div>
                        ) : (
                            <BarChart data={photosByCategory} labelKey="category" valueKey="count" />
                        )}
                    </Card>

                    <Card>
                        <h3 className="text-lg font-semibold text-white mb-4">Documents by Type</h3>
                        {documentsByType.length === 0 ? (
                            <div className="text-center py-6 text-gray-500 text-sm">No documents</div>
                        ) : (
                            <BarChart data={documentsByType} labelKey="type" valueKey="count" />
                        )}
                    </Card>

                    <Card>
                        <h3 className="text-lg font-semibold text-white mb-4">Milestone Progress</h3>
                        {milestoneStatusBreakdown.length === 0 ? (
                            <div className="text-center py-6 text-gray-500 text-sm">No milestones</div>
                        ) : (
                            <BarChart data={milestoneStatusBreakdown.map((s) => ({ ...s, label: s.status.replace('_', ' ') }))} labelKey="label" valueKey="count" />
                        )}
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
