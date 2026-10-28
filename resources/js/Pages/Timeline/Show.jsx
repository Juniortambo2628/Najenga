import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import DetailPage, { DetailText } from '@/Components/DetailPage';
import StatusBadge, { formatStatus } from '@/Components/StatusBadge';
import formatDate, { shortDate, yearOf } from '@/Utils/formatDate';

const DAY = 24 * 60 * 60 * 1000;

/** How long a milestone runs, in days (to today while it has no end). */
export function milestoneDays(start, end, today = new Date()) {
    if (!start) return null;
    const days = Math.round((new Date(end || today) - new Date(start)) / DAY) + 1;
    return days > 0 ? days : null;
}

/** One milestone: its dates and length as summary cards, the rest beneath. */
export default function Show({ timeline, can = {} }) {
    const days = milestoneDays(timeline.start_date, timeline.end_date);
    const status = timeline.status ? formatStatus(timeline.status) : '—';

    return (
        <AuthenticatedLayout>
            <DetailPage
                title={timeline.title}
                subtitle={timeline.project?.name || 'Milestone'}
                parent={{ label: 'Timeline', href: route('timeline') }}
                badges={timeline.status && <StatusBadge status={timeline.status} />}
                summary={[
                    { label: 'Status', value: status, icon: 'fa-flag' },
                    { label: 'Starts', value: shortDate(timeline.start_date) || '—', icon: 'fa-play', hint: yearOf(timeline.start_date) || undefined },
                    { label: 'Ends', value: shortDate(timeline.end_date) || 'Ongoing', icon: 'fa-flag-checkered', hint: yearOf(timeline.end_date) || undefined },
                    { label: 'Length', value: days ? `${days} day${days === 1 ? '' : 's'}` : '—', icon: 'fa-hourglass-half', hint: timeline.end_date ? undefined : 'So far' },
                ]}
                details={{
                    title: 'Milestone',
                    icon: 'fa-timeline',
                    rows: [
                        { label: 'Project', value: timeline.project?.name },
                        { label: 'Status', value: status },
                        { label: 'Start date', value: formatDate(timeline.start_date) },
                        { label: 'End date', value: formatDate(timeline.end_date) || 'Ongoing' },
                    ],
                    content: <DetailText title="Description">{timeline.description}</DetailText>,
                }}
                actions={[
                    can.update && { id: 'edit', label: 'Edit Milestone', icon: 'fa-pen', href: route('timeline.edit', timeline.id), variant: 'primary' },
                    timeline.project_id && { id: 'project', label: 'Open Project', icon: 'fa-folder', href: route('projects.show', timeline.project_id) },
                ].filter(Boolean)}
            />
        </AuthenticatedLayout>
    );
}
