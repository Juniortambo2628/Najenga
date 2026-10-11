import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import StatCard from '@/Components/StatCard';
import StatusBadge from '@/Components/StatusBadge';
import EmptyState from '@/Components/EmptyState';
import DashboardHero from '@/Components/DashboardHero';
import { formatCurrency } from '@/Config/currencies';

const QuickAction = ({ href, icon, label }) => (
    <Link href={href} className="quick-action-btn">
        <div className="quick-action-icon">
            <i aria-hidden="true" className={`fas fa-${icon}`}></i>
        </div>
        <span className="text-sm">{label}</span>
    </Link>
);

export default function Dashboard({ auth, stats = {}, recentExpenses = [], recentProjects = [] }) {
    const {
        totalExpenses = 0,
        activeProjects = 0,
        totalPhotos = 0,
        totalProjects = 0,
        expenseTrend = 0,
    } = stats;

    const cardClass = "panel";

    return (
        <AuthenticatedLayout>
            <Head title="Dashboard" />

            <div className="py-8 bg-black min-h-screen">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <DashboardHero
                        title={`Welcome back, ${auth.user.first_name || auth.user.name}!`}
                        subtitle="Here's what's happening with your construction projects."
                        breadcrumbs={[
                            { label: 'Dashboard' },
                        ]}
                    />

                    {/* Statistics Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                        <StatCard
                            value={`KES ${totalExpenses.toLocaleString()}`}
                            label="Total Expenses"
                            icon="fa-receipt"
                            trend={expenseTrend}
                        />
                        <StatCard
                            value={activeProjects}
                            label="Active Projects"
                            icon="fa-project-diagram"
                        />
                        <StatCard
                            value={totalPhotos}
                            label="Photos Uploaded"
                            icon="fa-images"
                        />
                        <StatCard
                            value={totalProjects}
                            label="Total Projects"
                            icon="fa-folder"
                        />
                    </div>

                    {/* Quick Actions */}
                    <div className={`${cardClass} mb-8`}>
                        <div className="px-6 py-4 border-b border-white/[0.06]">
                            <h5 className="text-lg font-semibold text-white flex items-center gap-2">
                                <i aria-hidden="true" className="fas fa-bolt text-yellow-400"></i>
                                Quick Actions
                            </h5>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
                                <QuickAction href={route('expenses')} icon="plus" label="Add Expense" />
                                <QuickAction href={route('photos')} icon="camera" label="Upload Photo" />
                                <QuickAction href={route('projects')} icon="project-diagram" label="New Project" />
                                <QuickAction href={route('documents')} icon="file-upload" label="Upload Document" />
                                <QuickAction href={route('timeline')} icon="calendar-plus" label="Add Timeline" />
                                <QuickAction href={route('analytics')} icon="chart-bar" label="View Analytics" />
                            </div>
                        </div>
                    </div>

                    {/* Recent Activity Row */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Recent Expenses */}
                        <div className={cardClass}>
                            <div className="px-6 py-4 border-b border-white/[0.06] flex justify-between items-center">
                                <h5 className="text-lg font-semibold text-white flex items-center gap-2">
                                    <i aria-hidden="true" className="fas fa-receipt"></i>
                                    Recent Expenses
                                </h5>
                            </div>
                            <div className="p-6">
                                {recentExpenses.length === 0 ? (
                                    <EmptyState icon="fa-receipt" title="No expenses yet" message="Start tracking your project expenses" />
                                ) : (
                                    <div className="space-y-4">
                                        {recentExpenses.map((expense) => (
                                            <div key={expense.id} className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                                                <div>
                                                    <h6 className="text-white font-medium">{expense.title}</h6>
                                                    <small className="text-gray-400">{expense.project_name}</small>
                                                </div>
                                                <div className="text-right">
                                                    <span className="text-sm font-mono text-white">{formatCurrency(expense.amount)}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Projects Overview */}
                        <div className={cardClass}>
                            <div className="px-6 py-4 border-b border-white/[0.06] flex justify-between items-center">
                                <h5 className="text-lg font-semibold text-white flex items-center gap-2">
                                    <i aria-hidden="true" className="fas fa-project-diagram"></i>
                                    Your Projects
                                </h5>
                                <Link href={route('projects')} className="btn-primary text-sm">
                                    Manage
                                </Link>
                            </div>
                            <div className="p-6">
                                {recentProjects.length === 0 ? (
                                    <EmptyState icon="fa-project-diagram" title="No projects yet" message="Create your first project to get started" />
                                ) : (
                                    <div className="space-y-4">
                                        {recentProjects.map((project) => (
                                            <div key={project.id} className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                                                <div>
                                                    <Link href={`/projects/${project.id}`} className="text-white font-medium hover:text-red-400 transition">
                                                        {project.name}
                                                    </Link>
                                                    <small className="text-gray-400">{project.location}</small>
                                                </div>
                                                <StatusBadge status={project.status} />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
