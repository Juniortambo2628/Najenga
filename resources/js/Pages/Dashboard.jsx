import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import SummaryCards from '@/Components/SummaryCards';
import StatusBadge from '@/Components/StatusBadge';
import EmptyState from '@/Components/EmptyState';
import DashboardHero from '@/Components/DashboardHero';
import { formatCurrency } from '@/Config/currencies';

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
                        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/40">{eyebrow}</p>
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

            <div className="mx-auto max-w-7xl space-y-8">
                <section className="relative isolate overflow-hidden rounded-3xl border border-white/[0.08] bg-[#111213] px-5 py-5 sm:px-7 sm:py-6">
                    <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-36 -z-10 h-96 w-96 rounded-full bg-rose-900/20 blur-3xl" />
                    <DashboardHero
                        title={`Welcome back, ${auth.user.first_name || auth.user.name}!`}
                        subtitle="Here's what's happening with your construction projects."
                        breadcrumbs={[{ label: 'Dashboard' }]}
                        actions={(
                            <Link href={route('projects.create')} className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-[#171719] transition hover:bg-rose-100">
                                <i aria-hidden="true" className="fas fa-plus text-xs" />
                                New project
                            </Link>
                        )}
                    />
                </section>

                <section aria-labelledby="dashboard-overview-heading">
                    <div className="mb-4 flex items-end justify-between gap-4">
                        <div>
                            <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-rose-300">Workspace overview</p>
                            <h2 id="dashboard-overview-heading" className="text-lg font-semibold text-white">Your projects at a glance</h2>
                        </div>
                        <span className="hidden text-xs text-white/35 sm:block">A snapshot of your workspace</span>
                    </div>
                    <SummaryCards cards={statCards} stackOnPhones />
                </section>

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
                                                <p className="truncate text-sm font-medium text-white">{expense.title}</p>
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
            </div>
        </AuthenticatedLayout>
    );
}
