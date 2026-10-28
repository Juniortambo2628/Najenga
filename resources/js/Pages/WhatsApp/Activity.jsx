import { useEffect, useRef, useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import DashboardPage from '@/Components/DashboardPage';
import ListPanel from '@/Components/ListPanel';
import SummaryCards from '@/Components/SummaryCards';
import EmptyState from '@/Components/EmptyState';
import useAction, { visit } from '@/Hooks/useAction';
import { rootBreadcrumbs } from '@/Config/navigation';

const DIRECTIONS = [
    { value: 'inbound', label: 'Inbound', icon: 'fa-arrow-down' },
    { value: 'outbound', label: 'Outbound', icon: 'fa-arrow-up' },
];

const STATUSES = [
    { value: 'received', label: 'Received', icon: 'fa-inbox' },
    { value: 'sent', label: 'Sent', icon: 'fa-paper-plane' },
    { value: 'delivered', label: 'Delivered', icon: 'fa-check' },
    { value: 'read', label: 'Read', icon: 'fa-check-double' },
    { value: 'failed', label: 'Failed', icon: 'fa-triangle-exclamation' },
];

const isSet = (value) => value && value !== 'all';

/** The side panel's views: everything, by direction, by status. One applies at a time. */
export function activityViews(counts = {}) {
    return [
        { id: 'all', label: 'All activity', icon: 'fa-layer-group' },
        ...DIRECTIONS.map((d) => ({ id: `direction:${d.value}`, group: 'Direction', label: d.label, icon: d.icon, count: counts[d.value] })),
        ...STATUSES.map((st) => ({ id: `status:${st.value}`, group: 'Status', label: st.label, icon: st.icon, count: st.value === 'failed' ? counts.failed : undefined })),
    ];
}

/** Which view the server's filters amount to. */
export function activeView(filters = {}) {
    if (isSet(filters.direction)) return `direction:${filters.direction}`;
    if (isSet(filters.status)) return `status:${filters.status}`;
    return 'all';
}

/** What came in on WhatsApp and was filed: the panel's lists under the filters. */
function FiledLists({ filed }) {
    const lists = [
        { key: 'expenses', title: 'Filed expenses', icon: 'fa-receipt', rows: filed?.expenses ?? [], meta: (e) => `${e.currency} ${Number(e.amount).toLocaleString()}` },
        { key: 'photos', title: 'Filed photos', icon: 'fa-image', rows: filed?.photos ?? [], meta: (p) => p.project_name || '—' },
    ];
    return (
        <div className="space-y-4 border-t border-white/[0.08] pt-4">
            {lists.map((list) => (
                <section key={list.key} aria-labelledby={`filed-${list.key}`}>
                    <h3 id={`filed-${list.key}`} className="mb-2 flex items-center gap-2 text-xs font-semibold text-gray-400">
                        <i aria-hidden="true" className={`fas ${list.icon} text-rose-300`} />
                        {list.title}
                    </h3>
                    {list.rows.length === 0 ? (
                        <p className="text-xs text-gray-500">None yet.</p>
                    ) : (
                        <ul className="space-y-1.5">
                            {list.rows.map((row) => (
                                <li key={row.id}>
                                    <Link href={row.url} className="block rounded-lg px-2 py-1.5 hover:bg-white/5">
                                        <span className="block truncate text-sm text-white">{row.title}</span>
                                        <span className="flex justify-between gap-2 text-[11px] text-gray-400">
                                            <span className="truncate">{list.meta(row)}</span>
                                            <span className="shrink-0">{relativeTime(row.created_at)}</span>
                                        </span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>
            ))}
        </div>
    );
}

const relativeTime = (iso) => {
    if (!iso) return '';
    const then = new Date(iso).getTime();
    const s = Math.round((Date.now() - then) / 1000);
    if (s < 60) return `${s}s ago`;
    if (s < 3600) return `${Math.round(s / 60)}m ago`;
    if (s < 86_400) return `${Math.round(s / 3600)}h ago`;
    return new Date(iso).toLocaleDateString();
};

const StatusPill = ({ status }) => {
    const cls = {
        received: 'bg-blue-500/10 text-blue-300 border-blue-500/20',
        sent: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
        delivered: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
        read: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
        failed: 'bg-red-500/10 text-red-300 border-red-500/20',
    }[status] || 'bg-white/5 text-gray-300 border-white/10';
    return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium border ${cls}`}>
            {status || '—'}
        </span>
    );
};

const DirectionArrow = ({ direction }) => (
    <span
        aria-label={direction === 'inbound' ? 'inbound' : 'outbound'}
        className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs ${
            direction === 'inbound'
                ? 'bg-blue-500/15 text-blue-300'
                : 'bg-emerald-500/15 text-emerald-300'
        }`}
    >
        <i
            aria-hidden="true"
            className={`fas ${direction === 'inbound' ? 'fa-arrow-down' : 'fa-arrow-up'}`}
        ></i>
    </span>
);

export default function Activity({ isAdmin, filters, items, filed, counts, settingsUrl }) {
    const [q, setQ] = useState(filters?.q || '');
    const firstRender = useRef(true);

    const setFilter = (patch) => {
        router.get(
            route('whatsapp'),
            {
                direction: 'direction' in patch ? patch.direction : filters.direction,
                status: 'status' in patch ? patch.status : filters.status,
                q: patch.q ?? q,
            },
            { preserveState: true, preserveScroll: true, replace: true, only: ['items', 'filters', 'counts'] },
        );
    };

    // The toolbar's search asks the server once typing pauses.
    useEffect(() => {
        if (firstRender.current) {
            firstRender.current = false;
            return undefined;
        }
        const timer = setTimeout(() => setFilter({ q }), 350);
        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps -- only when the text changes
    }, [q]);

    const remove = useAction((m) => visit('delete', route('whatsapp.activity.destroy', m.id), {}, { preserveState: true }), {
        confirm: (m) => ({
            title: `Delete this ${m.direction} message?`,
            message: m.filed ? `This will also delete the linked ${m.filed.kind}.` : undefined,
            confirmLabel: 'Delete',
        }),
        key: (m) => m.id,
    });
    const onDelete = remove.run;

    const reclassify = useAction((m, cls) => visit('post', route('whatsapp.activity.reclassify', m.id), { class: cls }, { preserveState: true }), {
        key: (m) => m.id,
    });
    const onReclassify = (m, cls) => {
        if (!cls) return;
        reclassify.run(m, cls);
    };

    const pickView = (id) => {
        const [kind, value] = id.split(':');
        setFilter({ direction: kind === 'direction' ? value : '', status: kind === 'status' ? value : '' });
    };

    return (
        <AuthenticatedLayout>
            <Head title="WhatsApp activity" />

            <DashboardPage
                fill={items.length > 0}
                hero={{
                    title: 'WhatsApp',
                    subtitle: isAdmin ? 'All WhatsApp activity across accounts.' : 'Your WhatsApp activity — messages sent to and from Najenga.',
                    breadcrumbs: [...rootBreadcrumbs(), { label: 'WhatsApp' }],
                }}
                summary={
                    <SummaryCards
                        cards={[
                            { label: 'Inbound', value: counts?.inbound ?? 0, icon: 'fa-arrow-down' },
                            { label: 'Outbound', value: counts?.outbound ?? 0, icon: 'fa-arrow-up' },
                            { label: 'Failed', value: counts?.failed ?? 0, icon: 'fa-triangle-exclamation' },
                        ]}
                    />
                }
                toolbar={{
                    search: { value: q, onChange: setQ, placeholder: 'Search phone, wamid or text' },
                    actions: settingsUrl ? [{ id: 'settings', label: 'Settings', icon: 'fa-cog', href: settingsUrl }] : [],
                }}
                panel={{
                    id: 'whatsapp',
                    title: 'Activity',
                    icon: 'fa-comment-dots',
                    subtitle: 'Filter what came in and went out',
                    items: activityViews(counts),
                    activeId: activeView(filters),
                    onChange: pickView,
                    content: <FiledLists filed={filed} />,
                }}
            >
                {items.length === 0 ? (
                    <EmptyState
                        icon="fa-comment-dots"
                        title="No WhatsApp activity"
                        message="Send a message to the business number and it'll show up here."
                        search={filters?.q}
                        filtered={activeView(filters) !== 'all'}
                        onClear={() => {
                            setQ('');
                            setFilter({ direction: '', status: '', q: '' });
                        }}
                    />
                ) : (
                    <ListPanel>
                    <ul className="divide-y divide-white/5 px-4">
                        {items.map((m) => (
                            <li key={`${m.direction}-${m.id}`} className="py-3 flex gap-3 group">
                                <DirectionArrow direction={m.direction} />
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 text-xs text-gray-400 flex-wrap">
                                        <span className="text-white font-medium">
                                            {m.direction === 'inbound' ? 'From' : 'To'} +{m.phone_number}
                                        </span>
                                        {m.user?.name && (
                                            <span className="text-gray-400">· {m.user.name}</span>
                                        )}
                                        <StatusPill status={m.status} />
                                        <span className="ml-auto">{relativeTime(m.timestamp)}</span>
                                    </div>
                                    <p className="text-sm text-gray-200 mt-1 whitespace-pre-wrap break-words">
                                        {m.preview}
                                    </p>
                                    {m.filed && (
                                        <Link
                                            href={m.filed.url}
                                            className="mt-1 inline-flex items-center gap-1 rounded-md border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-xs text-emerald-200 hover:bg-emerald-500/20"
                                        >
                                            <i aria-hidden="true" className={`fas ${m.filed.kind === 'photo' ? 'fa-image' : 'fa-receipt'} text-[10px]`}></i>
                                            → {m.filed.label}
                                        </Link>
                                    )}
                                    {m.error_message && (
                                        <p className="text-xs text-red-300 mt-1">
                                            <i aria-hidden="true" className="fas fa-exclamation-triangle mr-1"></i>
                                            {m.error_message}
                                        </p>
                                    )}
                                    {m.message_id && (
                                        <p className="text-[10px] text-gray-500 font-mono mt-1 truncate">
                                            wamid: {m.message_id}
                                        </p>
                                    )}
                                </div>
                                <div className="opacity-0 group-hover:opacity-100 focus-within:opacity-100 flex items-start gap-1 shrink-0">
                                    {m.filed && (
                                        <select
                                            aria-label={`Re-classify this ${m.filed.kind}`}
                                            defaultValue=""
                                            onChange={(e) => { onReclassify(m, e.target.value); e.target.value = ''; }}
                                            className="text-[10px] bg-black/40 border border-white/10 rounded px-1 py-0.5 text-white"
                                            title={`Move this ${m.filed.kind} to a different WhatsApp class`}
                                        >
                                            <option value="" disabled>Re-classify…</option>
                                            {m.filed.kind === 'expense' ? (
                                                <>
                                                    <option value="payment_sms">Payment SMS</option>
                                                    <option value="receipt_paper">Paper receipt</option>
                                                    <option value="invoice">Invoice</option>
                                                    <option value="cost_request">Cost request</option>
                                                </>
                                            ) : (
                                                <>
                                                    <option value="progress_photo">Progress photo</option>
                                                    <option value="progress_video">Progress video</option>
                                                </>
                                            )}
                                        </select>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => onDelete(m)}
                                        className="text-gray-400 hover:text-red-300 text-xs px-2"
                                        aria-label={`Delete ${m.direction} message from ${m.phone_number}`}
                                        title={m.filed ? `Deletes this row and its ${m.filed.kind}` : 'Delete this row'}
                                    >
                                        <i aria-hidden="true" className="fas fa-trash"></i>
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                    </ListPanel>
                )}
            </DashboardPage>
        </AuthenticatedLayout>
    );
}
