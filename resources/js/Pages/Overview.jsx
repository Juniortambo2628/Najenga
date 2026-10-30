import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import DashboardPage from '@/Components/DashboardPage';
import SummaryCards from '@/Components/SummaryCards';
import StatusBadge from '@/Components/StatusBadge';
import EmptyState from '@/Components/EmptyState';
import SharePanel, { RoleBadge } from '@/Components/SharePanel';
import useActiveProjectId from '@/Hooks/useActiveProjectId';
import useRole from '@/Hooks/useRole';
import useAction, { visit } from '@/Hooks/useAction';
import { rootBreadcrumbs } from '@/Config/navigation';
import { formatCurrency, formatCurrencyCompact } from '@/Config/currencies';
import { exportToCSV } from '@/Utils/exportToCSV';
import titleCase from '@/Utils/titleCase';

/** Spent as a share of the budget (0 when there's no budget), and whether it's over. */
export function budgetUse(project) {
    if (!project.budget) return { percent: 0, over: false };
    const percent = Math.round((project.spent / project.budget) * 100);
    return { percent, over: percent > 100 };
}

/** The totals across projects, by currency ("KES 1,200 · USD 300"). */
export function totalsByCurrency(projects, key, format = formatCurrency) {
    const sums = {};
    projects.forEach((p) => {
        sums[p.currency] = (sums[p.currency] ?? 0) + (p[key] || 0);
    });
    const entries = Object.entries(sums);
    return entries.length ? entries.map(([currency, sum]) => format(sum, currency)).join(' · ') : format(0);
}

function BudgetBar({ project }) {
    const { percent, over } = budgetUse(project);
    return (
        <div>
            <div className="mb-1.5 flex items-baseline justify-between gap-2 text-xs">
                <span className="text-white/60">
                    {formatCurrency(project.spent, project.currency)} of {project.budget ? formatCurrency(project.budget, project.currency) : 'no budget set'}
                </span>
                {project.budget > 0 && <span className={over ? 'font-semibold text-rose-300' : 'text-white/50'}>{percent}%</span>}
            </div>
            <div
                role="progressbar"
                aria-label={`Budget used for ${project.name}`}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.min(percent, 100)}
                className="h-2 overflow-hidden rounded-full bg-white/10"
            >
                <div className={`h-full rounded-full ${over ? 'bg-rose-500' : 'bg-gradient-to-r from-[rgb(139,0,0)] to-[rgb(220,20,60)]'}`} style={{ width: `${Math.min(percent, 100)}%` }} />
            </div>
        </div>
    );
}

function Section({ icon, title, href, linkLabel, children }) {
    return (
        <section className="panel p-6">
            <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="flex items-center gap-2 text-lg font-bold text-white">
                    <i aria-hidden="true" className={`fas ${icon} text-sm text-rose-300`} />
                    {title}
                </h2>
                {href && (
                    <Link href={href} className="text-sm text-[#DC143C] hover:text-white">
                        {linkLabel}
                    </Link>
                )}
            </div>
            {children}
        </section>
    );
}

/** "All projects": every project side by side; a card picks that project. */
function AllProjects({ projects, onPick }) {
    if (projects.length === 0) {
        return (
            <EmptyState
                icon="fa-diagram-project"
                title="No projects yet"
                message="Set up your first project to start tracking its spending, photos and documents."
                action={{ label: 'New Project', onClick: () => router.get(route('projects.create')) }}
            />
        );
    }
    return (
        <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
            {projects.map((project) => (
                <button
                    key={project.id}
                    type="button"
                    onClick={() => onPick(project.id)}
                    className="panel group flex flex-col gap-4 p-5 text-left transition hover:border-rose-300/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400/60"
                >
                    <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                            <h3 className="truncate text-lg font-semibold text-white group-hover:text-rose-100">{project.name}</h3>
                            {project.location && (
                                <p className="mt-0.5 truncate text-sm text-white/50">
                                    <i aria-hidden="true" className="fas fa-location-dot mr-1.5 text-xs" />
                                    {project.location}
                                </p>
                            )}
                        </div>
                        {project.status && <StatusBadge status={project.status} />}
                    </div>
                    <BudgetBar project={project} />
                    <div className="mt-auto flex items-center justify-between gap-3 text-xs text-white/50">
                        <span className="flex gap-3">
                            <span title="Expenses"><i aria-hidden="true" className="fas fa-receipt mr-1" />{project.counts.expenses}</span>
                            <span title="Photos"><i aria-hidden="true" className="fas fa-images mr-1" />{project.counts.photos}</span>
                            <span title="Documents"><i aria-hidden="true" className="fas fa-file-alt mr-1" />{project.counts.documents}</span>
                            <span title="Team"><i aria-hidden="true" className="fas fa-users mr-1" />{project.members.length}</span>
                        </span>
                        <RoleBadge role={project.my_role} />
                    </div>
                </button>
            ))}
        </div>
    );
}

/** One project: its budget, what's in it lately, and who's on it. */
function ProjectOverview({ project, onShare }) {
    const { recent } = project;
    return (
        <div className="grid gap-6 2xl:grid-cols-3">
            <div className="space-y-6 2xl:col-span-2">
                <Section icon="fa-wallet" title="Budget" href={route('expenses')} linkLabel="All expenses">
                    <BudgetBar project={project} />
                    {project.description && <p className="mt-5 leading-relaxed text-white/70">{project.description}</p>}
                    <dl className="mt-5 grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
                        {[
                            ['Starts', project.start_date || 'Not set'],
                            ['Ends', project.end_date || 'Not set'],
                            ['Location', project.location || 'Not set'],
                            ['Milestones', project.counts.milestones],
                        ].map(([label, value]) => (
                            <div key={label}>
                                <dt className="text-white/45">{label}</dt>
                                <dd className="mt-0.5 truncate font-medium text-white">{value}</dd>
                            </div>
                        ))}
                    </dl>
                </Section>

                <Section icon="fa-images" title="Latest photos" href={route('photos')} linkLabel="All photos">
                    {recent.photos.length === 0 ? (
                        <p className="text-sm text-white/50">No photos yet.</p>
                    ) : (
                        <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
                            {recent.photos.map((photo) => (
                                <Link key={photo.id} href={route('photos.show', photo.id)} className="aspect-square overflow-hidden rounded-xl bg-white/5">
                                    {photo.thumb_url && <img loading="lazy" decoding="async" src={photo.thumb_url} alt={photo.title} className="h-full w-full object-cover" />}
                                </Link>
                            ))}
                        </div>
                    )}
                </Section>
            </div>

            <div className="grid content-start gap-6 md:grid-cols-2 2xl:grid-cols-1">
                <Section icon="fa-receipt" title="Latest expenses">
                    {recent.expenses.length === 0 ? (
                        <p className="text-sm text-white/50">No expenses yet.</p>
                    ) : (
                        <ul className="space-y-3">
                            {recent.expenses.map((expense) => (
                                <li key={expense.id} className="flex items-center justify-between gap-3">
                                    <Link href={route('expenses.show', expense.id)} className="min-w-0">
                                        <span className="block truncate text-sm font-medium text-white hover:underline">{titleCase(expense.title)}</span>
                                        <span className="text-xs text-white/45">{expense.date}</span>
                                    </Link>
                                    <span className="shrink-0 font-mono text-sm text-white">{formatCurrency(expense.amount, expense.currency || project.currency)}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </Section>

                <Section icon="fa-file-alt" title="Latest documents" href={route('documents')} linkLabel="All documents">
                    {recent.documents.length === 0 ? (
                        <p className="text-sm text-white/50">No documents yet.</p>
                    ) : (
                        <ul className="space-y-2">
                            {recent.documents.map((doc) => (
                                <li key={doc.id}>
                                    <Link href={route('documents.show', doc.id)} className="flex items-center gap-3 rounded-xl bg-white/5 p-2.5 transition hover:bg-white/10">
                                        <i aria-hidden="true" className="fas fa-file-lines w-5 text-center text-rose-300" />
                                        <span className="min-w-0 flex-1 truncate text-sm text-white">{doc.title}</span>
                                        {doc.document_type && <span className="text-xs text-white/40">{doc.document_type}</span>}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    )}
                </Section>

                <Section icon="fa-users" title={`Team (${project.members.length})`}>
                    <ul className="space-y-2.5">
                        {project.members.map((member) => (
                            <li key={member.id} className="flex items-center gap-3">
                                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-semibold text-white">
                                    {(member.name || '?').charAt(0).toUpperCase()}
                                </span>
                                <span className="min-w-0 flex-1 truncate text-sm text-white">{member.name}</span>
                                <RoleBadge role={member.role} />
                            </li>
                        ))}
                    </ul>
                    <button type="button" onClick={onShare} className="mt-4 text-sm font-medium text-[#DC143C] hover:text-white">
                        {project.my_role === 'owner' ? 'Invite or manage people…' : 'See the team…'}
                    </button>
                </Section>
            </div>
        </div>
    );
}

/**
 * Overview: the project picked in the navbar switcher (its budget, latest
 * work and team), or all your projects side by side. It replaces the old
 * projects list; old project links land here with that project picked.
 */
export default function Overview({ projects = [], focus = null }) {
    const [activeId, setActiveId] = useActiveProjectId();
    const [sharing, setSharing] = useState(false);

    // /overview?project=ID (an old project link): pick it, then tidy the address.
    useEffect(() => {
        if (focus && projects.some((p) => p.id === focus)) setActiveId(focus);
        if (focus) {
            try {
                window.history.replaceState(window.history.state, '', route('overview'));
            } catch {
                /* no history (tests) */
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps -- once, on arrival
    }, []);

    const project = projects.find((p) => String(p.id) === String(activeId)) ?? null;
    const { canEdit } = useRole(project?.id);

    const deleteProject = useAction((p) => visit('delete', route('projects.destroy', p.id)), {
        confirm: (p) => ({ title: `Delete "${p.name}"?`, message: 'Its expenses, photos and documents go with it. Everyone on it loses access.', confirmLabel: 'Delete project' }),
        key: () => 'delete',
        onSuccess: () => setActiveId(null),
    });

    const cards = useMemo(() => {
        if (project) {
            const { percent, over } = budgetUse(project);
            return [
                {
                    label: 'Spent',
                    value: formatCurrencyCompact(project.spent, project.currency),
                    icon: 'fa-wallet',
                    hint: `${formatCurrency(project.spent, project.currency)}${project.budget ? ` · ${percent}% of the budget${over ? ', over' : ''}` : ''}`,
                },
                { label: 'Expenses', value: project.counts.expenses, icon: 'fa-receipt' },
                { label: 'Photos', value: project.counts.photos, icon: 'fa-images' },
                { label: 'Documents', value: project.counts.documents, icon: 'fa-file-alt' },
            ];
        }
        return [
            { label: 'Projects', value: projects.length, icon: 'fa-diagram-project', hint: `${projects.filter((p) => p.status === 'active').length} active` },
            { label: 'Spent', value: totalsByCurrency(projects, 'spent', formatCurrencyCompact), icon: 'fa-wallet', hint: totalsByCurrency(projects, 'spent') },
            { label: 'Budgets', value: totalsByCurrency(projects, 'budget', formatCurrencyCompact), icon: 'fa-coins', hint: totalsByCurrency(projects, 'budget') },
            { label: 'Over budget', value: projects.filter((p) => budgetUse(p).over).length, icon: 'fa-triangle-exclamation' },
        ];
    }, [project, projects]);

    const exportProjects = () =>
        exportToCSV(
            [
                { key: 'name', label: 'Name' },
                { key: 'status', label: 'Status' },
                { key: 'location', label: 'Location' },
                { key: 'budget', label: 'Budget' },
                { key: 'spent', label: 'Spent' },
                { key: 'currency', label: 'Currency' },
                { key: 'start_date', label: 'Start Date' },
                { key: 'end_date', label: 'End Date' },
            ],
            projects,
            'projects.csv',
        );

    const actions = project
        ? [
              ...(canEdit ? [{ id: 'edit', label: 'Edit Project', icon: 'fa-pen', href: route('projects.edit', project.id), variant: 'primary' }] : []),
              { id: 'share', label: project.my_role === 'owner' ? 'Share' : 'Members', icon: 'fa-user-plus', onClick: () => setSharing(true) },
              ...(project.can_delete ? [{ id: 'delete', label: 'Delete Project', icon: 'fa-trash', variant: 'danger', onClick: () => deleteProject.run(project) }] : []),
          ]
        : [
              { id: 'new', label: 'New Project', icon: 'fa-plus', href: route('projects.create'), variant: 'primary' },
              ...(projects.length ? [{ id: 'export', label: 'Export CSV', icon: 'fa-file-export', onClick: exportProjects }] : []),
          ];

    return (
        <AuthenticatedLayout>
            <Head title={project ? `${project.name} · Overview` : 'Overview'} />

            <DashboardPage
                hero={{
                    title: project ? project.name : 'Overview',
                    subtitle: project
                        ? [project.location, project.status && project.status.replace(/_/g, ' ')].filter(Boolean).join(' · ') || 'Project overview'
                        : `All ${projects.length} of your projects. Pick one here or in the switcher to focus on it.`,
                    breadcrumbs: [...rootBreadcrumbs(), { label: 'Overview' }],
                }}
                summary={<SummaryCards cards={cards} stackOnPhones />}
                panel={{
                    id: 'overview',
                    title: 'Projects',
                    icon: 'fa-diagram-project',
                    subtitle: 'The same choice as the switcher',
                    items: [
                        { id: 'all', label: 'All projects', icon: 'fa-layer-group', count: projects.length },
                        ...projects.map((p) => ({
                            id: String(p.id),
                            group: 'Your projects',
                            label: p.name,
                            description: [p.status && p.status.replace(/_/g, ' '), p.my_role].filter(Boolean).join(' · '),
                            icon: 'fa-diagram-project',
                        })),
                    ],
                    activeId: project ? String(project.id) : 'all',
                    onChange: (id) => setActiveId(id === 'all' ? null : Number(id)),
                }}
                toolbar={{ actions }}
            >
                {project ? <ProjectOverview project={project} onShare={() => setSharing(true)} /> : <AllProjects projects={projects} onPick={setActiveId} />}
            </DashboardPage>

            {project && (
                <SharePanel
                    show={sharing}
                    project={project}
                    onClose={() => {
                        setSharing(false);
                        router.reload({ only: ['projects'] });
                    }}
                />
            )}
        </AuthenticatedLayout>
    );
}
