import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { useState, useMemo } from 'react';
import DashboardHero from '@/Components/DashboardHero';
import ContextToolbar from '@/Components/ContextToolbar';
import EmptyState from '@/Components/EmptyState';
import StatusBadge from '@/Components/StatusBadge';
import Modal from '@/Components/Modal';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import TextInput from '@/Components/TextInput';
import SelectInput from '@/Components/SelectInput';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import Card from '@/Components/Card';
import BulkActions from '@/Components/BulkActions';
import useMultiSelect from '@/Hooks/useMultiSelect';
import { formatCurrency } from '@/Config/currencies';
import toast from 'react-hot-toast';

const TABS = [
    { key: 'all', label: 'All Activity', icon: 'fa-stream' },
    { key: 'milestones', label: 'Milestones', icon: 'fa-flag' },
    { key: 'expenses', label: 'Expenses', icon: 'fa-receipt' },
    { key: 'photos', label: 'Photos', icon: 'fa-images' },
    { key: 'documents', label: 'Documents', icon: 'fa-file-alt' },
];

const TYPE_CONFIG = {
    milestone: { color: 'from-[rgb(139,0,0)] to-[rgb(220,20,60)]', bg: 'bg-[#8B0000]', icon: 'fa-flag', textColor: 'text-[#DC143C]' },
    expense: { color: 'from-yellow-500 to-orange-500', bg: 'bg-yellow-500', icon: 'fa-receipt', textColor: 'text-yellow-400' },
    photo: { color: 'from-cyan-500 to-blue-500', bg: 'bg-cyan-500', icon: 'fa-images', textColor: 'text-cyan-400' },
    document: { color: 'from-purple-500 to-pink-500', bg: 'bg-purple-500', icon: 'fa-file-alt', textColor: 'text-purple-400' },
};

function TimelineItem({ item, onEdit, onDelete, isSelected, onToggle }) {
    const config = TYPE_CONFIG[item.type] || TYPE_CONFIG.milestone;

    return (
        <div className={`relative flex gap-6 ${isSelected ? 'opacity-75' : ''}`}>
            <div className="flex flex-col items-center">
                <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onToggle(item.id)}
                    className="rounded border-white/20 bg-white/5 text-[#8B0000] focus:ring-[#8B0000] mt-3"
                />
                <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 z-10 mt-2 bg-gradient-to-r ${config.color}`}>
                    <i className={`fas ${config.icon} text-white`}></i>
                </div>
            </div>

            <div className="flex-1 bg-gray-900/50 border border-white/10 rounded-2xl p-6 hover:border-white/20 transition">
                <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-3">
                        <h3 className="text-xl font-semibold text-white">{item.title}</h3>
                        <span className={`text-[10px] uppercase tracking-widest font-bold px-2 py-0.5 rounded-full bg-white/5 ${config.textColor}`}>
                            {item.type}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        {item.status && <StatusBadge status={item.status} />}
                        {item.type === 'milestone' && (
                            <>
                                <button onClick={() => onEdit(item)} className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition" title="Edit">
                                    <i className="fas fa-pen text-sm"></i>
                                </button>
                                <button onClick={() => onDelete(item)} className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition" title="Delete">
                                    <i className="fas fa-trash text-sm"></i>
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {item.description && <p className="text-gray-400 mb-3">{item.description}</p>}

                <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                    {item.date && (
                        <span><i className="fas fa-calendar mr-2"></i>{item.date}</span>
                    )}
                    {item.end_date && (
                        <span><i className="fas fa-flag-checkered mr-2"></i>End: {item.end_date}</span>
                    )}
                    {item.project_name && (
                        <span><i className="fas fa-project-diagram mr-2"></i>{item.project_name}</span>
                    )}
                    {item.type === 'expense' && (
                        <>
                            <span className={`font-mono font-medium ${config.textColor}`}>
                                {formatCurrency(item.amount)}
                            </span>
                            {item.category && <span className="bg-white/10 px-2 py-0.5 rounded text-xs">{item.category}</span>}
                        </>
                    )}
                    {item.type === 'photo' && item.location && (
                        <span><i className="fas fa-map-marker-alt mr-2"></i>{item.location}</span>
                    )}
                    {item.type === 'document' && item.document_type && (
                        <span className="bg-white/10 px-2 py-0.5 rounded text-xs">{item.document_type}</span>
                    )}
                </div>
            </div>
        </div>
    );
}

function StatsBar({ expenses, photos, documents, milestones }) {
    const totalSpend = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
    const stats = [
        { label: 'Milestones', value: milestones.length, icon: 'fa-flag', color: 'text-[#DC143C]' },
        { label: 'Expenses', value: expenses.length, icon: 'fa-receipt', color: 'text-yellow-400' },
        { label: 'Total Spend', value: formatCurrency(totalSpend), icon: 'fa-money-bill', color: 'text-green-400' },
        { label: 'Photos', value: photos.length, icon: 'fa-images', color: 'text-cyan-400' },
        { label: 'Documents', value: documents.length, icon: 'fa-file-alt', color: 'text-purple-400' },
    ];

    return (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
            {stats.map((s) => (
                <div key={s.label} className="bg-gray-900/50 border border-white/10 rounded-xl p-4 text-center">
                    <i className={`fas ${s.icon} ${s.color} text-lg mb-1`}></i>
                    <div className="text-white font-bold text-lg">{s.value}</div>
                    <div className="text-gray-500 text-xs uppercase tracking-wider">{s.label}</div>
                </div>
            ))}
        </div>
    );
}

export default function Timeline({ timelines = [], expenses = [], photos = [], documents = [], projects = [] }) {
    const [activeTab, setActiveTab] = useState('all');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTimeline, setEditingTimeline] = useState(null);
    const [filterProject, setFilterProject] = useState(null);
    const { selected: selectedItems, toggle: toggleSelection, selectAll, deselectAll, clear: clearSelection, isSelected, count: selectedCount } = useMultiSelect();

    const { data, setData, post, patch, processing, errors, reset } = useForm({
        title: '',
        description: '',
        project_id: '',
        start_date: '',
        end_date: '',
        status: 'pending',
    });

    // Combine all items for the "All" tab
    const allItems = useMemo(() => {
        const items = [];

        timelines.forEach((t) => items.push({ ...t, type: 'milestone', date: t.start_date, sortDate: t.start_date }));
        expenses.forEach((e) => items.push({ ...e, type: 'expense', sortDate: e.date }));
        photos.forEach((p) => items.push({ ...p, type: 'photo', sortDate: p.date }));
        documents.forEach((d) => items.push({ ...d, type: 'document', sortDate: d.date }));

        return items.sort((a, b) => (b.sortDate || '').localeCompare(a.sortDate || ''));
    }, [timelines, expenses, photos, documents]);

    const filteredItems = useMemo(() => {
        let items = allItems;
        if (filterProject) {
            items = items.filter((i) => String(i.project_id) === String(filterProject));
        }
        return items;
    }, [allItems, filterProject]);

    const tabData = useMemo(() => {
        const filter = (arr) => filterProject ? arr.filter((i) => String(i.project_id) === String(filterProject)) : arr;
        return {
            all: filteredItems,
            milestones: filter(timelines),
            expenses: filter(expenses),
            photos: filter(photos),
            documents: filter(documents),
        };
    }, [filteredItems, timelines, expenses, photos, documents, filterProject]);

    const currentItems = tabData[activeTab] || [];

    function openModal(timeline = null) {
        setEditingTimeline(timeline);
        if (timeline) {
            setData({
                title: timeline.title || '',
                description: timeline.description || '',
                project_id: timeline.project_id || '',
                start_date: timeline.start_date || '',
                end_date: timeline.end_date || '',
                status: timeline.status || 'pending',
            });
        } else {
            reset();
        }
        setIsModalOpen(true);
    }

    function closeModal() {
        setIsModalOpen(false);
        setEditingTimeline(null);
        reset();
    }

    function handleSubmit(e) {
        e.preventDefault();
        if (editingTimeline) {
            patch(`/timelines/${editingTimeline.id}`, { onSuccess: () => closeModal() });
        } else {
            post('/timelines', { onSuccess: () => closeModal() });
        }
    }

    function handleDelete(item) {
        if (item.type !== 'milestone') return;
        if (confirm('Are you sure you want to delete this milestone?')) {
            router.delete(`/timelines/${item.id}`);
        }
    }

    async function handleBulkDelete() {
        if (!confirm(`Delete ${selectedCount} item${selectedCount !== 1 ? 's' : ''}?`)) return;
        const ids = [...selectedItems];
        let failed = 0;
        for (const id of ids) {
            const item = allItems.find((i) => i.id === id && i.type === 'milestone');
            if (!item) continue;
            try {
                await new Promise((resolve, reject) => {
                    router.delete(`/timelines/${item.id}`, { preserveScroll: true, onSuccess: resolve, onError: reject });
                });
            } catch { failed++; }
        }
        clearSelection();
        if (failed > 0) toast.error(`Failed to delete ${failed} item${failed !== 1 ? 's' : ''}`);
        else toast.success(`${ids.length} item${ids.length !== 1 ? 's' : ''} deleted`);
        router.reload({ only: ['timelines'] });
    }

    return (
        <AuthenticatedLayout>
            <Head title="Timeline" />

            <div>
                <DashboardHero
                    title="Timeline"
                    subtitle="Track all project activity across milestones, expenses, photos, and documents"
                    breadcrumbs={[
                        { label: 'Home', href: '/home' },
                        { label: 'Dashboard', href: '/dashboard' },
                        { label: 'Timeline' },
                    ]}
                />

                <ContextToolbar
                    projects={projects}
                    currentProjectId={filterProject}
                    onProjectChange={(val) => setFilterProject(val)}
                    actions={
                        <PrimaryButton onClick={() => openModal()}>
                            <i className="fas fa-plus"></i> Add Milestone
                        </PrimaryButton>
                    }
                />

                <StatsBar expenses={expenses} photos={photos} documents={documents} milestones={timelines} />

                {/* Tabs */}
                <div className="flex gap-1 mb-6 bg-gray-900/50 border border-white/10 rounded-xl p-1 w-fit overflow-x-auto">
                    {TABS.map((tab) => {
                        const count = tabData[tab.key]?.length || 0;
                        return (
                            <button
                                key={tab.key}
                                onClick={() => { setActiveTab(tab.key); clearSelection(); }}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap ${
                                    activeTab === tab.key
                                        ? 'bg-gradient-to-r from-[rgb(139,0,0)] to-[rgb(220,20,60)] text-white shadow-lg'
                                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                                }`}
                            >
                                <i className={`fas ${tab.icon}`}></i>
                                {tab.label}
                                {count > 0 && (
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${activeTab === tab.key ? 'bg-white/20' : 'bg-white/10'}`}>
                                        {count}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Bulk Actions */}
                {selectedCount > 0 && (
                    <div className="flex items-center gap-3 mb-4 px-4 py-2 bg-[#8B0000]/15 border border-[#8B0000]/30 rounded-xl">
                        <span className="text-sm font-semibold text-[#DC143C]">{selectedCount} selected</span>
                        <div className="w-px h-4 bg-[#8B0000]/30"></div>
                        <button onClick={handleBulkDelete} className="text-white hover:text-gray-200 text-sm">
                            <i className="fas fa-trash mr-1"></i> Delete
                        </button>
                        <button onClick={deselectAll} className="text-gray-400 hover:text-white text-sm">
                            <i className="fas fa-times mr-1"></i> Clear
                        </button>
                    </div>
                )}

                {/* Content */}
                {activeTab === 'all' ? (
                    currentItems.length === 0 ? (
                        <EmptyState
                            icon="fa-stream"
                            title="No activity yet"
                            message="Add milestones, expenses, photos, or documents to see them on the timeline"
                            action={{ label: 'Add Milestone', onClick: () => openModal() }}
                        />
                    ) : (
                        <div className="relative">
                            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[rgb(139,0,0)] to-[rgb(220,20,60)]"></div>
                            <div className="space-y-6">
                                {currentItems.map((item) => (
                                    <TimelineItem
                                        key={`${item.type}-${item.id}`}
                                        item={item}
                                        onEdit={openModal}
                                        onDelete={handleDelete}
                                        isSelected={isSelected(item.id)}
                                        onToggle={toggleSelection}
                                    />
                                ))}
                            </div>
                        </div>
                    )
                ) : activeTab === 'milestones' ? (
                    currentItems.length === 0 ? (
                        <EmptyState
                            icon="fa-flag"
                            title="No milestones yet"
                            message="Add milestones to track your project progress"
                            action={{ label: 'Add Milestone', onClick: () => openModal() }}
                        />
                    ) : (
                        <div className="relative">
                            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[rgb(139,0,0)] to-[rgb(220,20,60)]"></div>
                            <div className="space-y-6">
                                {currentItems.map((item) => (
                                    <TimelineItem
                                        key={item.id}
                                        item={{ ...item, type: 'milestone' }}
                                        onEdit={openModal}
                                        onDelete={handleDelete}
                                        isSelected={isSelected(item.id)}
                                        onToggle={toggleSelection}
                                    />
                                ))}
                            </div>
                        </div>
                    )
                ) : activeTab === 'expenses' ? (
                    currentItems.length === 0 ? (
                        <EmptyState icon="fa-receipt" title="No expenses" message="Add expenses to see them on the timeline" />
                    ) : (
                        <div className="space-y-3">
                            {currentItems.map((expense) => (
                                <div key={expense.id} className="bg-gray-900/50 border border-white/10 rounded-2xl p-5 flex items-center justify-between hover:border-yellow-500/30 transition">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 flex items-center justify-center">
                                            <i className="fas fa-receipt text-white text-sm"></i>
                                        </div>
                                        <div>
                                            <h4 className="text-white font-medium">{expense.title}</h4>
                                            <div className="flex items-center gap-3 text-sm text-gray-500">
                                                <span>{expense.date}</span>
                                                <span>{expense.project_name}</span>
                                                {expense.category && <span className="bg-white/10 px-2 py-0.5 rounded text-xs">{expense.category}</span>}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-yellow-400 font-mono font-bold">{formatCurrency(expense.amount)}</div>
                                        {expense.status && <StatusBadge status={expense.status} />}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )
                ) : activeTab === 'photos' ? (
                    currentItems.length === 0 ? (
                        <EmptyState icon="fa-images" title="No photos" message="Upload photos to see them on the timeline" />
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                            {currentItems.map((photo) => (
                                <div key={photo.id} className="bg-gray-900/50 border border-white/10 rounded-2xl overflow-hidden hover:border-cyan-500/30 transition group">
                                    <div className="aspect-square bg-white/5 flex items-center justify-center overflow-hidden">
                                        {photo.file_path ? (
                                            <img
                                                src={`/storage/${photo.file_path.split('/').map((s) => encodeURIComponent(s)).join('/')}`}
                                                alt={photo.title}
                                                className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                                            />
                                        ) : (
                                            <i className="fas fa-image text-3xl text-gray-600"></i>
                                        )}
                                    </div>
                                    <div className="p-3">
                                        <h4 className="text-white text-sm font-medium truncate">{photo.title}</h4>
                                        <div className="flex items-center justify-between mt-1">
                                            <span className="text-gray-500 text-xs">{photo.date}</span>
                                            {photo.project_name && <span className="text-gray-500 text-[10px] truncate max-w-[100px]">{photo.project_name}</span>}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )
                ) : (
                    // Documents tab
                    currentItems.length === 0 ? (
                        <EmptyState icon="fa-file-alt" title="No documents" message="Upload documents to see them on the timeline" />
                    ) : (
                        <div className="space-y-3">
                            {currentItems.map((doc) => (
                                <div key={doc.id} className="bg-gray-900/50 border border-white/10 rounded-2xl p-5 flex items-center justify-between hover:border-purple-500/30 transition">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                                            <i className="fas fa-file-alt text-white text-sm"></i>
                                        </div>
                                        <div>
                                            <h4 className="text-white font-medium">{doc.title}</h4>
                                            <div className="flex items-center gap-3 text-sm text-gray-500">
                                                <span>{doc.date}</span>
                                                <span>{doc.project_name}</span>
                                                {doc.document_type && <span className="bg-white/10 px-2 py-0.5 rounded text-xs">{doc.document_type}</span>}
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        {doc.file_path && (
                                            <a
                                                href={`/storage/${doc.file_path.split('/').map((s) => encodeURIComponent(s)).join('/')}`}
                                                download
                                                className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition"
                                            >
                                                <i className="fas fa-download"></i>
                                            </a>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )
                )}
            </div>

            <Modal show={isModalOpen} onClose={closeModal} maxWidth="md">
                <div className="p-8">
                    <h2 className="text-xl font-bold text-white mb-6">
                        {editingTimeline ? 'Edit Milestone' : 'Add Milestone'}
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <InputLabel value="Title" />
                            <TextInput value={data.title} onChange={(e) => setData('title', e.target.value)} placeholder="Milestone title" className="mt-1 block w-full" />
                            <InputError message={errors.title} className="mt-1" />
                        </div>
                        <div>
                            <InputLabel value="Description" />
                            <textarea
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                rows={3}
                                className="mt-1 block w-full px-4 py-2.5 bg-gray-800 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[rgb(139,0,0)] focus:border-transparent resize-none"
                                placeholder="Describe this milestone"
                            />
                            <InputError message={errors.description} className="mt-1" />
                        </div>
                        <div>
                            <InputLabel value="Project" />
                            <SelectInput value={data.project_id} onChange={(e) => setData('project_id', e.target.value)} placeholder="Select a project" className="mt-1 block w-full">
                                {projects.map((p) => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </SelectInput>
                            <InputError message={errors.project_id} className="mt-1" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <InputLabel value="Start Date" />
                                <TextInput type="date" value={data.start_date} onChange={(e) => setData('start_date', e.target.value)} className="mt-1 block w-full" />
                                <InputError message={errors.start_date} className="mt-1" />
                            </div>
                            <div>
                                <InputLabel value="End Date" />
                                <TextInput type="date" value={data.end_date} onChange={(e) => setData('end_date', e.target.value)} className="mt-1 block w-full" />
                                <InputError message={errors.end_date} className="mt-1" />
                            </div>
                        </div>
                        <div>
                            <InputLabel value="Status" />
                            <SelectInput value={data.status} onChange={(e) => setData('status', e.target.value)} className="mt-1 block w-full">
                                <option value="pending">Pending</option>
                                <option value="in_progress">In Progress</option>
                                <option value="completed">Completed</option>
                                <option value="delayed">Delayed</option>
                            </SelectInput>
                            <InputError message={errors.status} className="mt-1" />
                        </div>
                        <div className="flex justify-end gap-3 pt-5 border-t border-white/10">
                            <SecondaryButton onClick={closeModal} type="button">Cancel</SecondaryButton>
                            <PrimaryButton type="submit" disabled={processing}>
                                {processing ? 'Saving...' : editingTimeline ? 'Update Milestone' : 'Create Milestone'}
                            </PrimaryButton>
                        </div>
                    </form>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
