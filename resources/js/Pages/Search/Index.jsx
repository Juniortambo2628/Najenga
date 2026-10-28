import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useState, useEffect, useRef, useCallback } from 'react';
import DashboardPage from '@/Components/DashboardPage';
import EmptyState from '@/Components/EmptyState';
import { rootBreadcrumbs } from '@/Config/navigation';

const TYPES = [
    { value: 'document', label: 'Documents', icon: 'fa-file-lines' },
    { value: 'photo', label: 'Photos', icon: 'fa-image' },
    { value: 'expense', label: 'Expenses', icon: 'fa-receipt' },
];

const TYPE_LABELS = { document: 'Document', photo: 'Photo', expense: 'Expense' };

/** The side panel's views: everything, or one kind of record. One applies at a time. */
export function searchViews(totals = {}, results = []) {
    return [
        { id: 'all', label: 'All results', icon: 'fa-layer-group', count: results.length },
        ...TYPES.map((t) => ({ id: t.value, label: t.label, icon: t.icon, count: totals[`${t.value}s`] })),
    ];
}

/** Which kind of record the server's filter amounts to. */
export function activeType(type = null) {
    return type && TYPES.some((t) => t.value === type) ? type : 'all';
}

export default function SearchIndex({ query = '', type = null, results = [], totals = {} }) {
    const [q, setQ] = useState(query);
    const firstRender = useRef(true);

    // The toolbar's search asks the server once typing pauses, like the
    // other search pages; the panel's views change the kind right away.
    const search = useCallback(
        (nextQ, nextType) =>
            router.get(
                route('search'),
                { q: nextQ, type: nextType || undefined },
                { preserveState: true, preserveScroll: true, replace: true },
            ),
        [],
    );

    useEffect(() => {
        if (firstRender.current) {
            firstRender.current = false;
            return undefined;
        }
        const timer = setTimeout(() => search(q, type), 350);
        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps -- only when the text changes
    }, [q]);

    const pickType = (id) => search(q, id === 'all' ? '' : id);

    const clear = () => {
        setQ('');
        search('', '');
    };

    return (
        <AuthenticatedLayout>
            <Head title="Search" />

            <DashboardPage
                hero={{
                    title: 'Search',
                    subtitle: 'Every document, photo and expense in one place.',
                    breadcrumbs: [...rootBreadcrumbs(), { label: 'Search' }],
                }}
                toolbar={{
                    search: { value: q, onChange: setQ, placeholder: 'Search documents, photos and expenses' },
                }}
                panel={{
                    id: 'search',
                    title: 'Kinds',
                    icon: 'fa-magnifying-glass',
                    subtitle: 'Narrow the results',
                    items: searchViews(totals, results),
                    activeId: activeType(type),
                    onChange: pickType,
                }}
            >
                {!query && (
                    <EmptyState
                        icon="fa-magnifying-glass"
                        title="Start typing to search"
                        message="Look through every document, photo and expense across your projects. Results appear as you type."
                    />
                )}

                {query && results.length === 0 && (
                    <EmptyState
                        noun="result"
                        search={query}
                        filtered={Boolean(type)}
                        onClear={clear}
                    />
                )}

                {results.length > 0 && (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {results.map((r) => (
                            <a
                                key={`${r.type}-${r.id}`}
                                href={r.url}
                                className="overflow-hidden rounded-2xl border border-white/10 bg-black/40 transition hover:border-rose-500/30 hover:bg-white/[0.04] block"
                            >
                                <div className="aspect-video bg-white/5 relative overflow-hidden flex items-center justify-center">
                                    {r.thumb_url ? (
                                        <img loading="lazy" decoding="async" src={r.thumb_url} alt={r.title} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="text-gray-400 text-3xl">[{r.type}]</div>
                                    )}
                                    <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[11px] capitalize font-bold bg-black/60 text-white border border-white/10">
                                        {TYPE_LABELS[r.type] || r.type}
                                    </span>
                                </div>
                                <div className="p-4">
                                    <h3 className="text-white font-semibold truncate mb-1">{r.title}</h3>
                                    {r.subtitle && <p className="text-gray-400 text-sm truncate mb-2">{r.subtitle}</p>}
                                    <div className="flex items-center justify-between text-xs text-gray-400">
                                        <span>{r.date}</span>
                                        {r.amount != null && <span className="text-emerald-400 font-mono">KES {Number(r.amount).toLocaleString()}</span>}
                                    </div>
                                </div>
                            </a>
                        ))}
                    </div>
                )}
            </DashboardPage>
        </AuthenticatedLayout>
    );
}
