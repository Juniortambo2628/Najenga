import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { useState, useMemo, lazy, Suspense, useCallback } from 'react';
import ContextMenu from '@/Components/ContextMenu';
const ExpenseSheet = lazy(() => import('@/Components/ExpenseSheet'));
import ExpenseForm from '@/Components/ExpenseForm';
import ExpenseDetailModal from '@/Components/ExpenseDetailModal';
import ContextToolbar from '@/Components/ContextToolbar';
import EmptyState from '@/Components/EmptyState';
import SearchFilterBar from '@/Components/SearchFilterBar';
import PrimaryButton from '@/Components/PrimaryButton';
import DashboardHero from '@/Components/DashboardHero';
import Modal from '@/Components/Modal';
import BulkActions from '@/Components/BulkActions';
import useMultiSelect from '@/Hooks/useMultiSelect';
import { exportToCSV } from '@/Utils/exportToCSV';
import toast from 'react-hot-toast';
import axios from 'axios';

export default function Expenses({ expenses = [], projects = [] }) {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [previewExpense, setPreviewExpense] = useState(null);
    
    // View Mode & Project Context
    const [viewMode, setViewMode] = useState('list');
    const [activeProjectId, setActiveProjectId] = useState(null);

    const { data, setData, post, processing, reset, errors } = useForm({
        title: '',
        amount: '',
        category: '',
        project_id: '',
        expense_date: new Date().toISOString().split('T')[0],
        description: '',
        payment_method: 'cash'
    });
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [sortBy, setSortBy] = useState('date_desc');
    
    // Selection State
    const { selected: selectedItems, toggle: toggleSelection, selectAll, deselectAll, clear: clearSelection, isSelected, count: selectedCount } = useMultiSelect();
    
    // Action State
    const [contextMenu, setContextMenu] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedExpense, setSelectedExpense] = useState(null);
    const [detailExpense, setDetailExpense] = useState(null);

    const editForm = useForm({
        title: '',
        amount: '',
        category: '',
        project_id: '',
        expense_date: '',
        description: '',
        payment_method: 'cash'
    });

    const activeProject = useMemo(
        () => projects.find(p => String(p.id) === String(activeProjectId)),
        [projects, activeProjectId]
    );

    // Extract unique categories for filter
    const categories = useMemo(() => {
        const unique = new Set(expenses.map(e => e.category));
        return ['all', ...Array.from(unique)];
    }, [expenses]);

    const filteredExpenses = useMemo(() => {
        let result = [...expenses];

        // Filter by active project
        if (activeProjectId) {
            result = result.filter(expense => String(expense.project_id) === String(activeProjectId));
        }

        // Filter by Category
        if (categoryFilter !== 'all') {
            result = result.filter(expense => expense.category === categoryFilter);
        }

        // Search
        if (searchQuery) {
            const lowerQuery = searchQuery.toLowerCase();
            result = result.filter(expense => 
                expense.title.toLowerCase().includes(lowerQuery) ||
                expense.project_name?.toLowerCase().includes(lowerQuery)
            );
        }

        // Sort
        result.sort((a, b) => {
            if (sortBy === 'date_desc') return new Date(b.expense_date) - new Date(a.expense_date);
            if (sortBy === 'date_asc') return new Date(a.expense_date) - new Date(b.expense_date);
            if (sortBy === 'amount_high') return b.amount - a.amount;
            if (sortBy === 'amount_low') return a.amount - b.amount;
            return 0;
        });

        return result;
    }, [expenses, categoryFilter, searchQuery, sortBy, activeProjectId]);

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
    const handleActionClick = (e, expense) => {
        e.preventDefault();
        e.stopPropagation();
        setContextMenu({
            x: e.clientX,
            y: e.clientY,
            target: expense
        });
    };

    const closeContextMenu = () => setContextMenu(null);

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

    const handleDelete = (expense) => {
        if (confirm(`Are you sure you want to delete "${expense.title}"?`)) {
            router.delete(`/expenses/${expense.id}`, {
                preserveScroll: true,
                onSuccess: () => closeContextMenu()
            });
        }
    };

    const contextMenuOptions = [
        { label: 'View', icon: 'fa-eye', action: () => handleView(contextMenu?.target) },
        { label: 'Edit', icon: 'fa-edit', action: () => handleEdit(contextMenu?.target) },
        { label: 'Delete', icon: 'fa-trash', danger: true, action: () => handleDelete(contextMenu?.target) },
    ];

    const handleBulkDelete = async () => {
        if (!confirm(`Delete ${selectedCount} expense${selectedCount !== 1 ? 's' : ''}?`)) return;
        const ids = [...selectedItems];
        try {
            const res = await axios.delete('/expenses/batch', { data: { ids } });
            toast.success(res.data.message || `${ids.length} expense${ids.length !== 1 ? 's' : ''} deleted`);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to delete expenses');
        }
        clearSelection();
        router.reload({ only: ['expenses'] });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Expenses" />

            <div onClick={closeContextMenu}>
                <DashboardHero
                    title="Expenses"
                    subtitle={`${filteredExpenses.length} expense${filteredExpenses.length !== 1 ? 's' : ''}${activeProject ? ` in ${activeProject.name}` : ''}`}
                    breadcrumbs={[
                        { label: 'Home', href: '/home' },
                        { label: 'Dashboard', href: '/dashboard' },
                        { label: 'Expenses' },
                    ]}
                />
                <ContextToolbar
                    projects={projects}
                    currentProjectId={activeProjectId}
                    onProjectChange={setActiveProjectId}
                    selectedCount={selectedCount}
                    actions={
                        <PrimaryButton onClick={() => { reset(); setIsAddModalOpen(true); }}>
                            <i className="fas fa-plus mr-1"></i>Add Expense
                        </PrimaryButton>
                    }
                >
                    <div className="flex items-center gap-3 flex-wrap">
                        <BulkActions
                            selectedCount={selectedCount}
                            totalCount={filteredExpenses.length}
                            onSelectAll={() => selectAll(filteredExpenses.map(e => e.id))}
                            onDeselectAll={deselectAll}
                            actions={
                                <button className="text-white hover:text-gray-200" title="Delete Selected" onClick={handleBulkDelete}>
                                    <i className="fas fa-trash"></i>
                                </button>
                            }
                        />
                    </div>
                    <SearchFilterBar
                        searchValue={searchQuery}
                        onSearchChange={setSearchQuery}
                        filters={[
                            {
                                name: 'category',
                                label: 'All Categories',
                                value: categoryFilter,
                                onChange: setCategoryFilter,
                                options: categories.map(c => ({ value: c, label: c === 'all' ? 'All Categories' : c })),
                            },
                            {
                                name: 'sort',
                                label: 'Sort by',
                                value: sortBy,
                                onChange: setSortBy,
                                options: [
                                    { value: 'date_desc', label: 'Newest First' },
                                    { value: 'date_asc', label: 'Oldest First' },
                                    { value: 'amount_high', label: 'Highest Amount' },
                                    { value: 'amount_low', label: 'Lowest Amount' },
                                ],
                            },
                        ]}
                        viewMode={viewMode}
                        onViewModeChange={setViewMode}
                        viewModeOptions={[
                            { value: 'list', icon: 'fa-list' },
                            { value: 'sheet', icon: 'fa-table' },
                        ]}
                    />
                </ContextToolbar>

                {filteredExpenses.length === 0 && viewMode !== 'sheet' && (
                    <EmptyState 
                        icon="fa-receipt" 
                        title="No expenses found" 
                        message={searchQuery || categoryFilter !== 'all' ? "Try adjusting your filters" : "Start tracking your project expenses"}
                        action={!searchQuery && categoryFilter === 'all' ? { label: 'Add Expense', onClick: () => { reset(); setIsAddModalOpen(true); } } : null}
                    />
                )}

                {/* Expenses List / Sheet */}
                {viewMode === 'sheet' ? (
                    <Suspense fallback={
                        <div className="flex items-center justify-center py-20">
                            <div className="text-gray-400 text-sm">Loading spreadsheet...</div>
                        </div>
                    }>
                        <ExpenseSheet
                            expenses={filteredExpenses}
                            projects={projects}
                            defaultProjectId={activeProjectId}
                        />
                    </Suspense>
                ) : filteredExpenses.length > 0 ? (
                    <div className="bg-gray-900/50 border border-white/10 rounded-2xl overflow-x-auto">
                            <table className="min-w-full text-left text-gray-400">
                                <thead className="bg-black/20 text-gray-200 uppercase text-xs font-semibold">
                                    <tr>
                                        <th className="px-6 py-4 w-10">
                                            <input
                                                type="checkbox"
                                                checked={selectedCount === filteredExpenses.length && filteredExpenses.length > 0}
                                                onChange={() => selectedCount === filteredExpenses.length ? deselectAll() : selectAll(filteredExpenses.map(e => e.id))}
                                                className="rounded border-white/20 bg-white/5 text-[#8B0000] focus:ring-[#8B0000]"
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
                                            <td colSpan="8" className="px-6 py-12 text-center text-gray-500">
                                                No expenses found matching your criteria.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredExpenses.map((expense) => (
                                            <tr key={expense.id} className={`hover:bg-white/5 transition cursor-pointer ${isSelected(expense.id) ? 'bg-white/5' : ''}`} onClick={() => handleView(expense)}>
                                                <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                                                    <input
                                                        type="checkbox"
                                                        checked={isSelected(expense.id)}
                                                        onChange={() => toggleSelection(expense.id)}
                                                        className="rounded border-white/20 bg-white/5 text-[#8B0000] focus:ring-[#8B0000]"
                                                    />
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="block text-white font-medium text-base">{expense.title}</span>
                                                    {expense.purpose && (
                                                        <span className="block text-xs text-gray-500 mt-1">{expense.purpose}</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-sm">{expense.recipient || '—'}</td>
                                                <td className="px-6 py-4">
                                                    <div className="text-xs">
                                                        {expense.reference_number && (
                                                            <span className="block text-gray-300 font-mono">{expense.reference_number}</span>
                                                        )}
                                                        <span className="text-gray-500">{expense.payment_method ? (expense.payment_method === 'mobile_money' ? 'M-Pesa' : expense.payment_method) : '—'}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right text-white font-mono font-medium">
                                                    KES {Number(expense.amount).toLocaleString()}
                                                </td>
                                                <td className="px-6 py-4 text-center text-sm">
                                                    <span>{expense.expense_date}</span>
                                                    {expense.time && <span className="block text-xs text-gray-500">{expense.time}</span>}
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    {expense.receipt_url ? (
                                                        <button
                                                            onClick={() => setPreviewExpense(expense)}
                                                            className="text-[#DC143C] hover:text-[rgb(139,0,0)] transition text-sm"
                                                            title="View receipt"
                                                        >
                                                            <i className="fas fa-file-image"></i>
                                                        </button>
                                                    ) : (
                                                        <span className="text-gray-600">—</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <button 
                                                        onClick={(e) => handleActionClick(e, expense)}
                                                        className="w-8 h-8 rounded-full text-gray-400 hover:bg-white/10 hover:text-white transition flex items-center justify-center mx-auto"
                                                    >
                                                        <i className="fas fa-ellipsis-h"></i>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                    </div>
                ) : null}
            </div>
            <Modal show={isAddModalOpen || isEditModalOpen} onClose={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); setSelectedExpense(null); }} maxWidth="lg">
                <div className="p-6">
                    <h2 className="text-xl font-bold text-white mb-4">{isEditModalOpen ? 'Edit Expense' : 'Add Expense'}</h2>
                    <ExpenseForm
                        expense={isEditModalOpen ? selectedExpense : null}
                        projects={projects}
                        onSubmit={(formData) => {
                            if (isEditModalOpen) {
                                editForm.setData(formData);
                                editForm.patch(`/expenses/${selectedExpense.id}`, {
                                    onSuccess: () => { setIsEditModalOpen(false); setSelectedExpense(null); editForm.reset(); }
                                });
                            } else {
                                setData(formData);
                                post('/expenses', {
                                    onSuccess: () => { setIsAddModalOpen(false); reset(); }
                                });
                            }
                        }}
                        onCancel={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); setSelectedExpense(null); }}
                    />
                </div>
            </Modal>

            {/* Context Menu */}
            {contextMenu && (
                <ContextMenu 
                    options={contextMenuOptions} 
                    position={{ x: contextMenu.x, y: contextMenu.y }} 
                    onClose={closeContextMenu} 
                />
            )}

            {/* Receipt Preview Modal */}
            {previewExpense && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={() => setPreviewExpense(null)}>
                    <div className="bg-gray-900 border border-white/10 rounded-2xl max-w-2xl w-full mx-4 overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-center p-4 border-b border-white/10">
                            <h3 className="text-lg font-bold text-white">
                                {previewExpense.reference_number || 'Receipt'} — {previewExpense.recipient || previewExpense.title}
                            </h3>
                            <button onClick={() => setPreviewExpense(null)} className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition">
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        <div className="p-4 flex items-center justify-center bg-black/50 min-h-[400px]">
                            {previewExpense.receipt_url?.endsWith('.pdf') ? (
                                <iframe src={previewExpense.receipt_url} className="w-full h-[500px] rounded" title="Receipt" />
                            ) : (
                                <img src={previewExpense.receipt_url} alt="Receipt" className="max-w-full max-h-[500px] object-contain rounded" />
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Expense Detail Modal (tabbed) */}
            <ExpenseDetailModal
                show={!!detailExpense}
                onClose={() => setDetailExpense(null)}
                expense={detailExpense}
                projects={projects}
                onUpdate={handleDetailUpdate}
            />
        </AuthenticatedLayout>
    );
}
