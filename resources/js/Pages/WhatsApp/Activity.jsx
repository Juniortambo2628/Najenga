import { useMemo, useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import DashboardHero from '@/Components/DashboardHero';

const DIRECTION_OPTIONS = [
    { value: 'all', label: 'All' },
    { value: 'inbound', label: 'Inbound' },
    { value: 'outbound', label: 'Outbound' },
];

const STATUS_OPTIONS = [
    { value: 'all', label: 'Any status' },
    { value: 'received', label: 'Received' },
    { value: 'sent', label: 'Sent' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'read', label: 'Read' },
    { value: 'failed', label: 'Failed' },
];

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

    const setFilter = (patch) => {
        router.get(
            route('whatsapp'),
            {
                direction: patch.direction ?? filters.direction,
                status: patch.status ?? filters.status,
                q: patch.q ?? q,
            },
            { preserveState: true, preserveScroll: true, replace: true, only: ['items', 'filters', 'counts'] },
        );
    };

    const onSubmitSearch = (e) => {
        e.preventDefault();
        setFilter({ q });
    };

    const totals = useMemo(() => [
        { label: 'Inbound', value: counts?.inbound ?? 0, tone: 'text-blue-300' },
        { label: 'Outbound', value: counts?.outbound ?? 0, tone: 'text-emerald-300' },
        { label: 'Failed', value: counts?.failed ?? 0, tone: 'text-red-300' },
    ], [counts]);

    return (
        <AuthenticatedLayout>
            <Head title="WhatsApp activity" />

            <div className="max-w-6xl mx-auto space-y-6">
                <div className="flex items-start justify-between gap-3">
                    <DashboardHero
                        title="WhatsApp"
                        subtitle={isAdmin ? 'All WhatsApp activity across accounts.' : 'Your WhatsApp activity — messages sent to and from Najenga.'}
                        breadcrumbs={[
                            { label: 'Home', href: '/home' },
                            { label: 'Dashboard', href: '/dashboard' },
                            { label: 'WhatsApp' },
                        ]}
                    />
                    {settingsUrl && (
                        <Link
                            href={settingsUrl}
                            className="mt-1 inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white hover:bg-white/10"
                        >
                            <i aria-hidden="true" className="fas fa-cog"></i>
                            Settings
                        </Link>
                    )}
                </div>

                {/* Totals */}
                <div className="grid grid-cols-3 gap-3">
                    {totals.map((t) => (
                        <div key={t.label} className="rounded-xl border border-white/10 bg-white/5 p-4">
                            <p className="text-xs text-gray-400">{t.label}</p>
                            <p className={`text-2xl font-bold ${t.tone}`}>{t.value}</p>
                        </div>
                    ))}
                </div>

                {/* Filters */}
                <div className="rounded-2xl border border-white/10 bg-gray-900/50 p-4 space-y-3">
                    <div className="flex flex-wrap gap-2 items-center">
                        {DIRECTION_OPTIONS.map((o) => (
                            <button
                                key={o.value}
                                type="button"
                                onClick={() => setFilter({ direction: o.value === 'all' ? '' : o.value })}
                                className={`px-3 py-1 rounded-full text-xs border ${
                                    (filters.direction === o.value) || (filters.direction === 'all' && o.value === 'all')
                                        ? 'bg-white/15 text-white border-white/20'
                                        : 'bg-white/5 text-gray-300 border-white/10 hover:bg-white/10'
                                }`}
                            >
                                {o.label}
                            </button>
                        ))}
                        <span className="w-px h-4 bg-white/10 mx-1" />
                        {STATUS_OPTIONS.map((o) => (
                            <button
                                key={o.value}
                                type="button"
                                onClick={() => setFilter({ status: o.value === 'all' ? '' : o.value })}
                                className={`px-3 py-1 rounded-full text-xs border ${
                                    (filters.status === o.value) || (filters.status === 'all' && o.value === 'all')
                                        ? 'bg-white/15 text-white border-white/20'
                                        : 'bg-white/5 text-gray-300 border-white/10 hover:bg-white/10'
                                }`}
                            >
                                {o.label}
                            </button>
                        ))}
                    </div>
                    <form onSubmit={onSubmitSearch} className="flex gap-2">
                        <input
                            type="search"
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                            placeholder="Search phone, wamid or message text…"
                            className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-white/30"
                        />
                        <button
                            type="submit"
                            className="px-3 py-2 rounded-lg bg-white/10 border border-white/10 text-sm text-white hover:bg-white/20"
                        >
                            Search
                        </button>
                    </form>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    {/* Timeline */}
                    <div className="md:col-span-2 rounded-2xl border border-white/10 bg-gray-900/50 p-4">
                        <h2 className="text-sm font-semibold text-white mb-3">Timeline</h2>
                        {items.length === 0 ? (
                            <p className="text-sm text-gray-400 py-6 text-center">
                                No WhatsApp activity yet. Send a message to the business number and it'll show up here.
                            </p>
                        ) : (
                            <ul className="divide-y divide-white/5">
                                {items.map((m) => (
                                    <li key={`${m.direction}-${m.id}`} className="py-3 flex gap-3">
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
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {/* Filed */}
                    <div className="space-y-4">
                        <section className="rounded-2xl border border-white/10 bg-gray-900/50 p-4">
                            <h2 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                                <i aria-hidden="true" className="fas fa-receipt text-red-300"></i>
                                Filed expenses
                            </h2>
                            {filed?.expenses?.length ? (
                                <ul className="space-y-2">
                                    {filed.expenses.map((e) => (
                                        <li key={e.id} className="rounded-lg border border-white/10 bg-white/[0.02] p-2">
                                            <Link href={e.url} className="text-sm text-white hover:underline block truncate">
                                                {e.title}
                                            </Link>
                                            <div className="text-xs text-gray-400 flex items-center justify-between gap-2 mt-0.5">
                                                <span>
                                                    {e.currency} {Number(e.amount).toLocaleString()}
                                                    {e.confidence != null && (
                                                        <span className="ml-2 text-gray-500">
                                                            · {(Number(e.confidence) * 100).toFixed(0)}% conf.
                                                        </span>
                                                    )}
                                                </span>
                                                <span>{relativeTime(e.created_at)}</span>
                                            </div>
                                            {e.project_name && (
                                                <p className="text-[10px] text-gray-500 mt-0.5">{e.project_name}</p>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-xs text-gray-500">None yet.</p>
                            )}
                        </section>

                        <section className="rounded-2xl border border-white/10 bg-gray-900/50 p-4">
                            <h2 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                                <i aria-hidden="true" className="fas fa-image text-purple-300"></i>
                                Filed photos
                            </h2>
                            {filed?.photos?.length ? (
                                <ul className="space-y-2">
                                    {filed.photos.map((p) => (
                                        <li key={p.id} className="rounded-lg border border-white/10 bg-white/[0.02] p-2">
                                            <Link href={p.url} className="text-sm text-white hover:underline block truncate">
                                                {p.title}
                                            </Link>
                                            <div className="text-xs text-gray-400 flex items-center justify-between gap-2 mt-0.5">
                                                <span className="truncate">{p.project_name || '—'}</span>
                                                <span>{relativeTime(p.created_at)}</span>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-xs text-gray-500">None yet.</p>
                            )}
                        </section>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
