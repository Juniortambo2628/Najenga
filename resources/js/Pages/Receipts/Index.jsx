import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import DashboardPage from '@/Components/DashboardPage';
import ListPanel from '@/Components/ListPanel';
import useMultiSelect from '@/Hooks/useMultiSelect';
import useBulkDelete from '@/Hooks/useBulkDelete';
import { rootBreadcrumbs } from '@/Config/navigation';
import useVisibleActions from '@/Hooks/useVisibleActions';

const STATUS_STYLES = {
    verified: 'bg-green-500/10 text-green-400 border-green-500/20',
    auto_verified: 'bg-green-500/10 text-green-400 border-green-500/20',
    rejected: 'bg-red-500/10 text-red-400 border-red-500/20',
    pending: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
};

const STATUS_OPTIONS = [
    { value: 'all', label: 'All receipts', icon: 'fa-layer-group' },
    { value: 'pending', label: 'Waiting for a check', icon: 'fa-hourglass-half' },
    { value: 'verified', label: 'Verified', icon: 'fa-circle-check' },
    { value: 'auto_verified', label: 'Auto-verified', icon: 'fa-wand-magic-sparkles' },
    { value: 'rejected', label: 'Rejected', icon: 'fa-circle-xmark' },
];

const statusOf = (receipt) => receipt.verification_status || 'pending';

export default function Index({ receipts = [] }) {
    const { visible } = useVisibleActions();
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [sortBy, setSortBy] = useState('newest');
    const { selected, toggle, selectAll, deselectAll, clear, isSelected, count: selectedCount } = useMultiSelect();

    // Receipts arrive newest first.
    const filteredReceipts = useMemo(() => {
        const q = searchQuery.trim().toLowerCase();
        const list = receipts.filter((receipt) => (
            (statusFilter === 'all' || statusOf(receipt) === statusFilter)
            && (!q || [receipt.id, receipt.expense_id, receipt.filename, receipt.original_name, receipt.extracted_merchant, receipt.extracted_receipt_id]
                .some((field) => field != null && String(field).toLowerCase().includes(q)))
        ));
        return sortBy === 'oldest' ? [...list].reverse() : list;
    }, [receipts, searchQuery, statusFilter, sortBy]);

    const handleBulkDelete = useBulkDelete({
        selected,
        noun: 'receipt',
        path: (id) => route('receipts.destroy', id),
        onDone: clear,
        reload: ['receipts'],
    });

    const allSelected = selectedCount === filteredReceipts.length && filteredReceipts.length > 0;

    return (
        <AuthenticatedLayout>
            <Head title="Receipts" />

            {/* Fits the screen on desktops: only the table's rows scroll. */}
            <DashboardPage
                fill={filteredReceipts.length > 0}
                hero={{
                    title: 'Receipts',
                    subtitle: `${filteredReceipts.length} receipt${filteredReceipts.length !== 1 ? 's' : ''}`,
                    breadcrumbs: [...rootBreadcrumbs(), { label: 'Receipts' }],
                }}
                panel={{
                    id: 'receipts',
                    title: 'Checks',
                    icon: 'fa-file-invoice-dollar',
                    subtitle: `${receipts.filter((r) => statusOf(r) === 'pending').length} waiting for a check`,
                    items: STATUS_OPTIONS.map((option) => ({
                        id: option.value,
                        label: option.label,
                        icon: option.icon,
                        group: option.value === 'all' ? undefined : 'Status',
                        count: option.value === 'all' ? receipts.length : receipts.filter((r) => statusOf(r) === option.value).length,
                    })),
                    activeId: statusFilter,
                    onChange: (id) => {
                        setStatusFilter(id);
                        clear();
                    },
                }}
                toolbar={{
                    search: { value: searchQuery, onChange: setSearchQuery, placeholder: 'Search receipts' },
                    filters: [
                        {
                            name: 'sort',
                            title: 'Sort by',
                            value: sortBy,
                            onChange: setSortBy,
                            options: [
                                { value: 'newest', label: 'Newest First' },
                                { value: 'oldest', label: 'Oldest First' },
                            ],
                        },
                    ],
                    actions: visible([{ id: 'verify', label: 'Verify Receipt', icon: 'fa-receipt', href: route('receipt.verification'), variant: 'primary' }]),
                    selection: {
                        count: selectedCount,
                        total: filteredReceipts.length,
                        onSelectAll: () => selectAll(filteredReceipts.map((r) => r.id)),
                        onDeselectAll: deselectAll,
                        actions: visible([{ id: 'delete', label: 'Delete Selected', icon: 'fa-trash', variant: 'danger', onClick: handleBulkDelete }]),
                    },
                }}
            >
                <ListPanel>
                    <table className="w-full text-left">
                        <thead className="sticky top-0 z-10 bg-surface-panel">
                            <tr className="border-b border-white/10">
                                <th className="px-4 py-2.5 w-10">
                                    <input
                                        type="checkbox"
                                        checked={allSelected}
                                        aria-label="Select all receipts"
                                        onChange={() => (allSelected ? deselectAll() : selectAll(filteredReceipts.map((r) => r.id)))}
                                        className="rounded border-gray-400 bg-white/5 text-[#DC143C] focus:ring-[#DC143C]"
                                    />
                                </th>
                                <th className="px-4 py-2.5 text-gray-400 text-xs font-medium">ID</th>
                                <th className="px-4 py-2.5 text-gray-400 text-xs font-medium">Expense ID</th>
                                <th className="px-4 py-2.5 text-gray-400 text-xs font-medium">Filename</th>
                                <th className="px-4 py-2.5 text-gray-400 text-xs font-medium">Status</th>
                                <th className="px-4 py-2.5 text-gray-400 text-xs font-medium">Created At</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredReceipts.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-4 py-10 text-center text-gray-400">
                                        {receipts.length === 0 ? 'No receipts found.' : 'No receipts match your search or filters.'}
                                    </td>
                                </tr>
                            ) : (
                                filteredReceipts.map((receipt) => (
                                    <tr key={receipt.id} className={`border-b border-white/5 hover:bg-white/5 transition ${isSelected(receipt.id) ? 'bg-white/5' : ''}`}>
                                        <td className="px-4 py-2.5">
                                            <input
                                                type="checkbox"
                                                checked={isSelected(receipt.id)}
                                                onChange={() => toggle(receipt.id, true)}
                                                aria-label={`Select receipt #${receipt.id}`}
                                                className="rounded border-gray-400 bg-white/5 text-[#DC143C] focus:ring-[#DC143C]"
                                            />
                                        </td>
                                        <td className="px-4 py-2.5 text-gray-300 text-sm">#{receipt.id}</td>
                                        <td className="px-4 py-2.5 text-gray-300 text-sm">{receipt.expense_id || '-'}</td>
                                        <td className="px-4 py-2.5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center text-red-500">
                                                    <i aria-hidden="true" className="fas fa-file-image text-sm"></i>
                                                </div>
                                                <span className="text-white text-sm font-medium hover:text-[#DC143C] transition">
                                                    <Link href={route('receipts.show', receipt.id)}>
                                                        {receipt.filename || 'Unknown'}
                                                    </Link>
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-2.5">
                                            <span className={`px-3 py-1 rounded-lg text-xs font-bold border ${STATUS_STYLES[statusOf(receipt)] || STATUS_STYLES.pending}`}>
                                                {statusOf(receipt).replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-4 py-2.5 text-gray-400 text-sm">
                                            {new Date(receipt.created_at).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </ListPanel>
            </DashboardPage>
        </AuthenticatedLayout>
    );
}
