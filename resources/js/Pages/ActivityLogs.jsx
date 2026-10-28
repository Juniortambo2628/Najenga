import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import DashboardPage from '@/Components/DashboardPage';
import EmptyState from '@/Components/EmptyState';
import VersionList from '@/Components/VersionList';
import { rootBreadcrumbs } from '@/Config/navigation';

const TABS = [
    { id: 'changes', label: 'Changes', description: 'Who changed what in your projects', icon: 'fa-clock-rotate-left' },
    { id: 'account', label: 'Sign-ins & account', description: 'Your sign-ins and security events', icon: 'fa-user-shield' },
];

const tabUrl = (id) => (id === 'changes' ? route('activity.logs') : `${route('activity.logs')}?tab=${id}`);

const actionTone = (action) =>
    action.includes('create') || action.includes('add')
        ? 'bg-green-500/20 text-green-400'
        : action.includes('delete') || action.includes('remove') || action.includes('revoke')
          ? 'bg-red-500/20 text-red-400'
          : action.includes('update') || action.includes('edit') || action.includes('changed')
            ? 'bg-blue-500/20 text-blue-400'
            : 'bg-gray-500/20 text-gray-400';

/** Laravel paginator links, kept on the same tab. */
function Pages({ links }) {
    if (!links || links.length <= 3) return null;
    return (
        <nav aria-label="Pages" className="flex flex-wrap justify-center gap-2 border-t border-white/10 bg-white/5 px-6 py-4">
            {links.map((link, i) =>
                link.url ? (
                    <Link
                        key={i}
                        href={link.url}
                        preserveScroll
                        aria-current={link.active ? 'page' : undefined}
                        className={`rounded-md px-3 py-1 text-sm ${link.active ? 'bg-[rgb(139,0,0)] text-white' : 'text-gray-400 hover:bg-white/10'}`}
                        dangerouslySetInnerHTML={{ __html: link.label }}
                    />
                ) : (
                    <span key={i} className="cursor-not-allowed rounded-md px-3 py-1 text-sm text-gray-400 opacity-50" dangerouslySetInnerHTML={{ __html: link.label }} />
                ),
            )}
        </nav>
    );
}

/**
 * Activity: changes to records come from the version history (who changed
 * what, field by field, across your projects); sign-ins and account events
 * from the activity log. Restoring happens in the navbar's version history.
 */
export default function ActivityLogs({ tab = 'changes', changes, logs }) {
    return (
        <AuthenticatedLayout>
            <Head title="Activity Logs" />

            <DashboardPage
                className="mx-auto max-w-7xl"
                hero={{
                    title: 'Activity Logs',
                    subtitle: 'Who changed what in your projects, and your sign-ins',
                    breadcrumbs: [...rootBreadcrumbs(), { label: 'Activity Logs' }],
                }}
                panel={{
                    id: 'activity-logs',
                    title: 'Logs',
                    icon: 'fa-history',
                    items: TABS,
                    activeId: tab,
                    onChange: (id) => id !== tab && router.get(tabUrl(id), {}, { preserveScroll: true }),
                }}
            >
                {tab === 'changes' ? (
                    <div role="tabpanel" aria-label="Changes" className="dashboard-card overflow-hidden">
                        {changes.data.length === 0 ? (
                            <EmptyState icon="fa-clock-rotate-left" title="No changes yet" message="Every change to projects, expenses, receipts, documents, photos and milestones shows here." compact />
                        ) : (
                            <div className="px-6">
                                <VersionList versions={changes.data} />
                            </div>
                        )}
                        <Pages links={changes.links} />
                    </div>
                ) : (
                    <div role="tabpanel" aria-label="Sign-ins & account" className="dashboard-card overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-white/10 bg-white/5">
                                        <th className="px-6 py-4 text-sm font-semibold text-white">Date</th>
                                        <th className="px-6 py-4 text-sm font-semibold text-white">Action</th>
                                        <th className="px-6 py-4 text-sm font-semibold text-white">Description</th>
                                        <th className="px-6 py-4 text-sm font-semibold text-white">IP Address</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {logs.data.length === 0 ? (
                                        <tr>
                                            <td colSpan="4" className="px-6 py-12 text-center italic text-gray-400">
                                                No activity logs found.
                                            </td>
                                        </tr>
                                    ) : (
                                        logs.data.map((log) => (
                                            <tr key={log.id} className="transition hover:bg-white/5">
                                                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-300">{new Date(log.created_at).toLocaleString()}</td>
                                                <td className="whitespace-nowrap px-6 py-4 text-sm">
                                                    <span className={`rounded-full px-3 py-1 text-xs font-medium ${actionTone(log.action)}`}>{log.action}</span>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-300">{log.description}</td>
                                                <td className="px-6 py-4 font-mono text-sm text-gray-400">{log.ip_address}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <Pages links={logs.links} />
                    </div>
                )}
            </DashboardPage>
        </AuthenticatedLayout>
    );
}
