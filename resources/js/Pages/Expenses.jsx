import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { useState, useMemo, lazy, Suspense, useCallback } from 'react';
import ContextMenu from '@/Components/ContextMenu';
import { rootBreadcrumbs } from '@/Config/navigation';
const ExpenseSheet = lazy(() => import('@/Components/ExpenseSheet'));
import ExpenseForm from '@/Components/ExpenseForm';
import ExpenseDetailModal from '@/Components/ExpenseDetailModal';
import EmptyState from '@/Components/EmptyState';
import PrimaryButton from '@/Components/PrimaryButton';
import Button from '@/Components/Button';
import DashboardPage from '@/Components/DashboardPage';
import ListPanel from '@/Components/ListPanel';
import Modal from '@/Components/Modal';
import useMultiSelect from '@/Hooks/useMultiSelect';
import useActiveProject from '@/Hooks/useActiveProject';
import useContextMenu from '@/Hooks/useContextMenu';
import useFilteredItems from '@/Hooks/useFilteredItems';
import useHashHighlight from '@/Hooks/useHashHighlight';
import useAction, { visit } from '@/Hooks/useAction';
import { exportToCSV } from '@/Utils/exportToCSV';
import axios from 'axios';
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import useActiveProjectId from '@/Hooks/useActiveProjectId';
import useVisibleActions, { editableProjects } from '@/Hooks/useVisibleActions';

export default function Expenses({ expenses = [], projects = [] }) {
    const [previewExpense, setPreviewExpense] = useState(null);
    
    // View Mode & Project Context
    const [viewMode, setViewMode] = useState('list');
    const [activeProjectId] = useActiveProjectId();

    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [sortBy, setSortBy] = useState('date_desc');
    
    // Selection State
    const { selected: selectedItems, toggle: toggleSelection, selectAll, deselectAll, clear: clearSelection, isSelected, count: selectedCount } = useMultiSelect();
    
    // Action State
    const { contextMenu, openContextMenu, closeContextMenu } = useContextMenu();
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedExpense, setSelectedExpense] = useState(null);
    const [detailExpense, setDetailExpense] = useState(null);
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [assignProjectId, setAssignProjectId] = useState('');

    const editForm = useForm({
        title: '',
        amount: '',
        category: '',
        project_id: '',
        expense_date: '',
        description: '',
        payment_method: 'cash'
    });

    const activeProject = useActiveProject(projects, activeProjectId);
    // Forms on this page (spreadsheet, edit, assign) only offer projects you can edit.
    const formProjects = useMemo(() => editableProjects(projects), [projects]);

    // Extract unique categories for filter
    const categories = useMemo(() => {
        const unique = new Set(expenses.map(e => e.category));
        return ['all', ...Array.from(unique)];
    }, [expenses]);

    const categoryFiltered = useMemo(
        () => (categoryFilter === 'all' ? expenses : expenses.filter(e => e.category === categoryFilter)),
        [expenses, categoryFilter]
    );

    const sortExpenses = useMemo(() => (a, b) => {
        if (sortBy === 'date_desc') return new Date(b.expense_date) - new Date(a.expense_date);
        if (sortBy === 'date_asc') return new Date(a.expense_date) - new Date(b.expense_date);
        if (sortBy === 'amount_high') return b.amount - a.amount;
        if (sortBy === 'amount_low') return a.amount - b.amount;
        return 0;
    }, [sortBy]);

    const filteredExpenses = useFilteredItems(categoryFiltered, {
        projectId: activeProjectId,
        searchQuery,
        sortFn: sortExpenses,
        searchFields: ['title', 'project_name'],
    });
    const highlightedExpense = useHashHighlight('expense-');

    const handleExport = () => {
        exportToCSV(
            [
                { key: 'title', label: 'Title' },
                { key: 'amount', label: 'Amount' },
                { key: 'currency', label: 'Currency' },
                { key: 'category', label: 'Category' },
                { key: 'status', label: 'Status' },
                { key: 'expense_date', label: 'Date' },
                { key: 'project_name', label: 'Project' },
            ],
            filteredExpenses,
            'expenses.csv'
        );
    };

    const totalAmount = useMemo(() => filteredExpenses.reduce((sum, e) => sum + Number(e.amount), 0), [filteredExpenses]);

    // Handlers
    const handleEdit = (expense) => {
        setSelectedExpense(expense);
        editForm.setData({
            title: expense.title,
            amount: expense.amount,
            category: expense.category,
            project_id: projects.find(p => p.name === expense.project_name)?.id || '',
            expense_date: expense.expense_date,
            description: expense.description || '',
            payment_method: expense.payment_method || 'cash'
        });
        setIsEditModalOpen(true);
        closeContextMenu();
    };

    const handleView = (expense) => {
        setDetailExpense(expense);
        closeContextMenu();
    };

    const handleDetailUpdate = useCallback(() => {
        router.reload({ only: ['expenses'] });
    }, []);

    const deleteExpense = useAction((expense) => visit('delete', `/expenses/${expense.id}`), {
        confirm: (expense) => `Delete "${expense.title}"?`,
        key: (expense) => expense.id,
        onSuccess: () => closeContextMenu(),
    });
    const handleDelete = deleteExpense.run;

    const { canEdit, visible, canEditRecord } = useVisibleActions();

    const contextMenuOptions = [
        { label: 'View', icon: 'fa-eye', readOnly: true, action: () => handleView(contextMenu?.target) },
        { label: 'Edit', icon: 'fa-edit', action: () => handleEdit(contextMenu?.target) },
        { label: 'Delete', icon: 'fa-trash', danger: true, action: () => handleDelete(contextMenu?.target) },
    ];

    const bulkDelete = useAction((ids) => axios.delete('/expenses/batch', { data: { ids } }), {
        confirm: (ids) => `Delete ${ids.length} expense${ids.length !== 1 ? 's' : ''}?`,
        success: (res, ids) => res.data.message || `${ids.length} expense${ids.length !== 1 ? 's' : ''} deleted`,
        error: 'Failed to delete expenses',
        key: () => 'bulk',
        only: ['expenses'],
        onSuccess: () => clearSelection(),
    });
    const handleBulkDelete = () => bulkDelete.run([...selectedItems]);

    const bulkAssign = useAction((ids, projectId) => axios.patch('/expenses/batch/project', { ids, project_id: projectId || null }), {
        success: (res, ids) => res.data.message || `${ids.length} expense${ids.length !== 1 ? 's' : ''} updated`,
        error: 'Failed to assign expenses',
        key: () => 'assign',
        only: ['expenses'],
        onSuccess: () => {
            setIsAssignModalOpen(false);
            setAssignProjectId('');
            clearSelection();
        },
    });
    const handleBulkAssign = () => bulkAssign.run([...selectedItems], assignProjectId);

    return (
        <AuthenticatedLayout>
            <Head title="Expenses" />

            {/* List view fits the screen on desktops: only the table's rows scroll. */}
            <DashboardPage
                onClick={closeContextMenu}
                fill={viewMode === 'list' && filteredExpenses.length > 0}
                hero={{
                    title: 'Expenses',
                    subtitle: `${filteredExpenses.length} expense${filteredExpenses.length !== 1 ? 's' : ''}${activeProject ? ` in ${activeProject.name}` : ''}`,
                    breadcrumbs: [...rootBreadcrumbs(), { label: 'Expenses' }],
                }}
                toolbar={{
                    search: { value: searchQuery, onChange: setSearchQuery, placeholder: 'Search expenses' },
                    filters: [
                        {
                            name: 'category',
                            title: 'Category',
                            value: categoryFilter,
                            onChange: setCategoryFilter,
                            options: categories.map(c => ({ value: c, label: c === 'all' ? 'All Categories' : c })),
                        },
                        {
                            name: 'sort',
                            title: 'Sort by',
                            value: sortBy,
                            onChange: setSortBy,
                            options: [
                                { value: 'date_desc', label: 'Newest First' },
                                { value: 'date_asc', label: 'Oldest First' },
                                { value: 'amount_high', label: 'Highest Amount' },
                                { value: 'amount_low', label: 'Lowest Amount' },
                            ],
                        },
                    ],
                    view: {
                        current: viewMode,
                        onChange: setViewMode,
                        // The spreadsheet edits in place: not for viewers.
                        modes: visible([
                            { value: 'list', icon: 'fa-list', label: 'List', readOnly: true },
                            { value: 'sheet', icon: 'fa-table', label: 'Spreadsheet' },
                        ]),
                    },
                    actions: visible([
                        { id: 'add', label: 'Add Expense', icon: 'fa-plus', href: route('expenses.create'), variant: 'primary' },
                        { id: 'export', label: 'Export CSV', icon: 'fa-file-export', readOnly: true, onClick: handleExport },
                    ]),
                    selection: {
                        count: selectedCount,
                        total: filteredExpenses.length,
                        onSelectAll: () => selectAll(filteredExpenses.map(e => e.id)),
                        onDeselectAll: deselectAll,
                        actions: visible([
                            { id: 'assign', label: 'Assign to Project', icon: 'fa-folder-open', onClick: () => setIsAssignModalOpen(true) },
                            { id: 'delete', label: 'Delete Selected', icon: 'fa-trash', variant: 'danger', onClick: handleBulkDelete },
                        ]),
                    },
                }}
            >
                {filteredExpenses.length === 0 && viewMode !== 'sheet' && (
                    <EmptyState 
                        icon="fa-receipt" 
                        title="No expenses found" 
                        message="Start tracking your project expenses"
                        action={canEdit ? { label: 'Add Expense', onClick: () => router.get(route('expenses.create')) } : undefined}
                        noun="expense"
                        search={searchQuery}
                        filtered={categoryFilter !== 'all'}
                        onClear={() => { setSearchQuery(''); setCategoryFilter('all'); }}
                    />
                )}

                {/* Expenses List / Sheet */}
                {viewMode === 'sheet' && canEdit ? (
                    <Suspense fallback={
                        <div className="flex items-center justify-center py-20">
                            <div className="text-gray-400 text-sm">Loading spreadsheet...</div>
                        </div>
                    }>
                        <ExpenseSheet
                            expenses={filteredExpenses}
                            projects={formProjects}
                            defaultProjectId={activeProjectId}
                        />
                    </Suspense>
                ) : filteredExpenses.length > 0 ? (
                    <ListPanel>
                        <table className="min-w-full text-left text-gray-400">
                            <thead className="bg-[#111213] text-gray-200 uppercase text-xs font-semibold sticky top-0 z-10">
                                <tr>
                                    <th className="px-6 py-4 w-10">
                                        <input
                                            type="checkbox"
                                            checked={selectedCount === filteredExpenses.length && filteredExpenses.length > 0}
                                            aria-label="Select all expenses"
                                            onChange={() => selectedCount === filteredExpenses.length ? deselectAll() : selectAll(filteredExpenses.map(e => e.id))}
                                            className="rounded border-gray-400 bg-white/5 text-[#DC143C] focus:ring-[#DC143C]"
                                        />
                                    </th>
                                    <th className="px-6 py-4">Expense Details</th>
                                    <th className="px-6 py-4">Recipient</th>
                                    <th className="px-6 py-4">Ref / Method</th>
                                    <th className="px-6 py-4 text-right">Amount</th>
                                    <th className="px-6 py-4 text-center">Date & Time</th>
                                    <th className="px-6 py-4 text-center">Receipt</th>
                                    <th className="px-6 py-4 text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {filteredExpenses.length === 0 ? (
                                    <tr>
                                        <td colSpan="8" className="px-6 py-12 text-center text-gray-400">
                                            No expenses found matching your criteria.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredExpenses.map((expense) => (
                                        <tr key={expense.id} id={`expense-${expense.id}`} className={`hover:bg-white/5 transition cursor-pointer ${isSelected(expense.id) ? 'bg-white/5' : highlightedExpense === String(expense.id) ? 'bg-amber-500/10 ring-1 ring-inset ring-amber-400/50' : ''}`} onClick={() => handleView(expense)}>
                                            <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected(expense.id)}
                                                    onChange={() => toggleSelection(expense.id, true)}
                                                    aria-label={`Select ${expense.title || 'expense'}`}
                                                    className="rounded border-gray-400 bg-white/5 text-[#DC143C] focus:ring-[#DC143C]"
                                                />
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="block text-white font-medium text-base">{expense.title}</span>
                                                {expense.purpose && (
                                                    <span className="block text-xs text-gray-400 mt-1">{expense.purpose}</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-sm">{expense.recipient || '—'}</td>
                                            <td className="px-6 py-4">
                                                <div className="text-xs">
                                                    {expense.reference_number && (
                                                        <span className="block text-gray-300 font-mono">{expense.reference_number}</span>
                                                    )}
                                                    <span className="text-gray-400">{expense.payment_method ? (expense.payment_method === 'mobile_money' ? 'M-Pesa' : expense.payment_method) : '—'}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right text-white font-mono font-medium">
                                                KES {Number(expense.amount).toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 text-center text-sm">
                                                <span>{expense.expense_date}</span>
                                                {expense.time && <span className="block text-xs text-gray-400">{expense.time}</span>}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                {expense.receipt_url ? (
                                                    <button
                                                        onClick={() => setPreviewExpense(expense)}
                                                        className="text-[#DC143C] hover:text-[rgb(139,0,0)] transition text-sm"
                                                        title="View receipt"
                                                    >
                                                        <i aria-hidden="true" className="fas fa-file-image"></i>
                                                    </button>
                                                ) : (
                                                    <span className="text-gray-400">—</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <button 
                                                    onClick={(e) => openContextMenu(e, expense)}
                                                    aria-label={`Actions for ${expense.title || 'expense'}`}
                                                    aria-haspopup="menu"
                                                    className="w-8 h-8 rounded-full text-gray-400 hover:bg-white/10 hover:text-white transition flex items-center justify-center mx-auto"
                                                >
                                                    <i aria-hidden="true" className="fas fa-ellipsis-h"></i>
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </ListPanel>
                ) : null}
            </DashboardPage>
            <Modal show={isEditModalOpen} onClose={() => { setIsEditModalOpen(false); setSelectedExpense(null); }} maxWidth="lg">
                <div className="p-6">
                    <h2 className="text-xl font-bold text-white mb-4">Edit Expense</h2>
                    <ExpenseForm
                        expense={selectedExpense}
                        projects={formProjects}
                        onSubmit={(formData) => {
                            editForm.setData(formData);
                            editForm.patch(`/expenses/${selectedExpense.id}`, {
                                onSuccess: () => { setIsEditModalOpen(false); setSelectedExpense(null); editForm.reset(); }
                            });
                        }}
                        onCancel={() => { setIsEditModalOpen(false); setSelectedExpense(null); }}
                    />
                </div>
            </Modal>

            {/* Bulk Assign to Project Modal */}
            <Modal show={isAssignModalOpen} onClose={() => setIsAssignModalOpen(false)} maxWidth="md">
                <div className="p-6">
                    <h2 className="text-xl font-bold text-white mb-2">Assign to Project</h2>
                    <p className="text-sm text-gray-400 mb-4">
                        Assign {selectedCount} selected expense{selectedCount !== 1 ? 's' : ''} to a project.
                    </p>
                    <label htmlFor="bulk-project" className="block text-sm font-medium text-gray-300 mb-2">
                        Project
                    </label>
                    <select
                        id="bulk-project"
                        value={assignProjectId}
                        onChange={(e) => setAssignProjectId(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#8B0000] cursor-pointer"
                    >
                        <option value="">No project</option>
                        {formProjects.map((p) => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                    </select>
                    <div className="flex justify-end gap-3 mt-6">
                        <Button variant="ghost" onClick={() => setIsAssignModalOpen(false)}>
                            Cancel
                        </Button>
                        <PrimaryButton onClick={handleBulkAssign} disabled={bulkAssign.pending}>
                            <i aria-hidden="true" className="fas fa-folder-open mr-1"></i>
                            {assignProjectId ? 'Assign' : 'Remove from Project'}
                        </PrimaryButton>
                    </div>
                </div>
            </Modal>

            {/* Context Menu */}
            {contextMenu && (
                <ContextMenu 
                    options={visible(contextMenuOptions, canEditRecord(contextMenu.target))} 
                    position={{ x: contextMenu.x, y: contextMenu.y }} 
                    onClose={closeContextMenu} 
                />
            )}

            {/* Receipt Preview Modal */}
            {previewExpense && (
                <Dialog open onClose={() => setPreviewExpense(null)} className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
                    <DialogPanel className="bg-surface-overlay border border-white/[0.08] rounded-2xl max-w-2xl w-full mx-4 overflow-hidden shadow-2xl">
                        <div className="flex justify-between items-center p-4 border-b border-white/10">
                            <DialogTitle as="h3" className="text-lg font-bold text-white">
                                {previewExpense.reference_number || 'Receipt'} — {previewExpense.recipient || previewExpense.title}
                            </DialogTitle>
                            <button onClick={() => setPreviewExpense(null)} aria-label="Close preview" className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition">
                                <i aria-hidden="true" className="fas fa-times"></i>
                            </button>
                        </div>
                        <div className="p-4 flex items-center justify-center bg-black/50 min-h-[400px]">
                            {previewExpense.receipt_url?.endsWith('.pdf') ? (
                                <iframe src={previewExpense.receipt_url} className="w-full h-[500px] rounded" title="Receipt" />
                            ) : (
                                <img loading="lazy" decoding="async"  src={previewExpense.receipt_url} alt="Receipt" className="max-w-full max-h-[500px] object-contain rounded" />
                            )}
                        </div>
                    </DialogPanel>
                </Dialog>
            )}

            {/* Expense Detail Modal (tabbed) */}
            <ExpenseDetailModal
                show={!!detailExpense}
                onClose={() => setDetailExpense(null)}
                expense={detailExpense}
                projects={formProjects}
                onUpdate={handleDetailUpdate}
            />
        </AuthenticatedLayout>
    );
}
