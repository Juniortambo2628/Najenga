import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import DashboardPage from '@/Components/DashboardPage';
import SummaryCards from '@/Components/SummaryCards';
import StatusBadge from '@/Components/StatusBadge';
import EmptyState from '@/Components/EmptyState';
import { formatCurrency } from '@/Config/currencies';
import titleCase from '@/Utils/titleCase';

const QUICK_ACTIONS = [
    { href: 'expenses.create', icon: 'circle-plus', label: 'Add expense', description: 'Record a project cost' },
    { href: 'photos.create', icon: 'camera', label: 'Upload photos', description: 'Add a site update' },
    { href: 'projects.create', icon: 'folder-plus', label: 'New project', description: 'Set up a workspace' },
    { href: 'documents.create', icon: 'file-arrow-up', label: 'Add document', description: 'Keep project files close' },
    { href: 'timeline.create', icon: 'calendar-plus', label: 'Add milestone', description: 'Plan upcoming work' },
    { href: 'analytics', icon: 'chart-pie', label: 'View analytics', description: 'Review project activity' },
];

function QuickAction({ href, icon, label, description }) {
    return (
        <Link href={route(href)} className="quick-action-btn group items-start text-left">
            <span className="quick-action-icon transition-transform group-hover:-translate-y-0.5">
                <i aria-hidden="true" className={`fas fa-${icon}`} />
            </span>
            <span className="font-medium text-white">{label}</span>
            <span className="text-xs text-white/45">{description}</span>
        </Link>
    );
}

function DashboardSection({ icon, eyebrow, title, href, actionLabel, children }) {
    return (
        <section className="panel overflow-hidden">
            <div className="flex items-center justify-between gap-4 border-b border-white/[0.07] px-5 py-4 sm:px-6">
                <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-950/60 text-rose-200">
                        <i aria-hidden="true" className={`fas ${icon}`} />
                    </span>
                    <div className="min-w-0">
                        <p className="text-[11px] font-semibold capitalize text-white/40">{eyebrow}</p>
                        <h2 className="truncate text-base font-semibold text-white sm:text-lg">{title}</h2>
                    </div>
                </div>
                {href && (
                    <Link href={href} className="inline-flex shrink-0 items-center gap-2 rounded-full border border-white/10 px-3.5 py-2 text-xs font-medium text-white/70 transition hover:border-rose-200/30 hover:bg-white/[0.04] hover:text-white">
                        {actionLabel}
                        <i aria-hidden="true" className="fas fa-arrow-right text-[10px]" />
                    </Link>
                )}
            </div>
            <div className="p-4 sm:p-5">{children}</div>
        </section>
    );
}

export default function Dashboard({ auth, stats = {}, recentExpenses = [], recentProjects = [] }) {
    const {
        totalExpenses = 0,
        activeProjects = 0,
        totalPhotos = 0,
        totalProjects = 0,
        expenseTrend = 0,
    } = stats;

    const statCards = [
        { value: formatCurrency(totalExpenses), label: 'Total expenses', icon: 'fa-receipt', trend: expenseTrend },
        { value: activeProjects, label: 'Active projects', icon: 'fa-diagram-project' },
        { value: totalPhotos, label: 'Progress photos', icon: 'fa-images' },
        { value: totalProjects, label: 'All projects', icon: 'fa-folder' },
    ];

    return (
        <AuthenticatedLayout>
            <Head title="Dashboard" />

            <DashboardPage
                className="max-w-7xl mx-auto"
                bodyClassName="space-y-8"
                hero={{
                    title: `Welcome back, ${auth.user.first_name || auth.user.name}!`,
                    subtitle: "Here's what's happening with your construction projects.",
                    breadcrumbs: [{ label: 'Dashboard' }],
                }}
                summary={<SummaryCards cards={statCards} stackOnPhones />}
                toolbar={{
                    actions: [{ id: 'new', label: 'New project', icon: 'fa-plus', href: route('projects.create'), variant: 'primary' }],
                }}
            >
                <DashboardSection icon="fa-bolt" eyebrow="Keep things moving" title="Quick actions">
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
                        {QUICK_ACTIONS.map((action) => <QuickAction key={action.href} {...action} />)}
                    </div>
                </DashboardSection>

                <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
                    <DashboardSection icon="fa-receipt" eyebrow="Latest activity" title="Recent expenses" href={route('expenses')} actionLabel="All expenses">
                        {recentExpenses.length === 0 ? (
                            <EmptyState compact icon="fa-receipt" title="No expenses yet" message="Add your first project expense to start building a clear record." />
                        ) : (
                            <div className="space-y-2">
                                {recentExpenses.map((expense) => (
                                    <div key={expense.id} className="flex items-center justify-between gap-4 rounded-xl border border-white/[0.05] bg-white/[0.025] px-4 py-3 transition hover:border-white/10 hover:bg-white/[0.04]">
                                        <div className="flex min-w-0 items-center gap-3">
                                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/[0.05] text-sm text-white/55"><i aria-hidden="true" className="fas fa-receipt" /></span>
                                            <div className="min-w-0">
                                                <p className="truncate text-sm font-medium text-white">{titleCase(expense.title)}</p>
                                                <p className="truncate text-xs text-white/45">{expense.project_name}</p>
                                            </div>
                                        </div>
                                        <span className="shrink-0 text-sm font-semibold tabular-nums text-white/85">{formatCurrency(expense.amount)}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </DashboardSection>

                    <DashboardSection icon="fa-diagram-project" eyebrow="Work in progress" title="Your projects" href={route('overview')} actionLabel="Overview">
                        {recentProjects.length === 0 ? (
                            <EmptyState compact icon="fa-diagram-project" title="No projects yet" message="Create your first project to give your team a shared place to plan the work." />
                        ) : (
                            <div className="space-y-2">
                                {recentProjects.map((project) => (
                                    <Link key={project.id} href={`/projects/${project.id}`} className="group flex items-center justify-between gap-4 rounded-xl border border-white/[0.05] bg-white/[0.025] px-4 py-3 transition hover:border-white/10 hover:bg-white/[0.04]">
                                        <div className="flex min-w-0 items-center gap-3">
                                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/[0.05] text-sm text-white/55"><i aria-hidden="true" className="fas fa-building" /></span>
                                            <div className="min-w-0">
                                                <p className="truncate text-sm font-medium text-white transition group-hover:text-rose-100">{project.name}</p>
                                                <p className="truncate text-xs text-white/45">{project.location || 'Location not set'}</p>
                                            </div>
                                        </div>
                                        <div className="flex shrink-0 items-center gap-2">
                                            <StatusBadge status={project.status} />
                                            <i aria-hidden="true" className="fas fa-arrow-up-right-from-square hidden text-[10px] text-white/30 transition group-hover:text-white/70 sm:inline" />
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </DashboardSection>
                </div>
            </DashboardPage>
        </AuthenticatedLayout>
    );
}
