import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router, Link } from '@inertiajs/react';
import { useState, useMemo } from 'react';
import DashboardPage from '@/Components/DashboardPage';
import EmptyState from '@/Components/EmptyState';
import StatusBadge from '@/Components/StatusBadge';
import Modal from '@/Components/Modal';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import TextInput from '@/Components/TextInput';
import SelectInput from '@/Components/SelectInput';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import useMultiSelect from '@/Hooks/useMultiSelect';
import useBulkDelete from '@/Hooks/useBulkDelete';
import useAction, { visit } from '@/Hooks/useAction';
import useFilteredItems from '@/Hooks/useFilteredItems';
import { formatCurrency } from '@/Config/currencies';
import { rootBreadcrumbs } from '@/Config/navigation';
import useActiveProjectId from '@/Hooks/useActiveProjectId';
import useVisibleActions from '@/Hooks/useVisibleActions';

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
                    aria-label={`Select ${item.title}`}
                    className="rounded border-gray-400 bg-white/5 text-[#DC143C] focus:ring-[#DC143C] mt-3"
                />
                <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 z-10 mt-2 bg-gradient-to-r ${config.color}`}>
                    <i aria-hidden="true" className={`fas ${config.icon} text-white`}></i>
                </div>
            </div>

            <div className="flex-1 bg-surface-panel/90 border border-white/[0.08] rounded-2xl p-6 hover:border-white/20 transition">
                <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-3">
                        {item.type === 'milestone' ? (
                            <Link href={`/timeline/${item.id}`} className="text-xl font-semibold text-white hover:text-red-400 transition">
                                {item.title}
                            </Link>
                        ) : (
                            <h3 className="text-xl font-semibold text-white">{item.title}</h3>
                        )}
                        <span className={`text-[10px] uppercase tracking-widest font-bold px-2 py-0.5 rounded-full bg-white/5 ${config.textColor}`}>
                            {item.type}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        {item.status && <StatusBadge status={item.status} />}
                        {item.type === 'milestone' && onEdit && (
                            <>
                                <button onClick={() => onEdit(item)} className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition" title="Edit">
                                    <i aria-hidden="true" className="fas fa-pen text-sm"></i>
                                </button>
                                <button onClick={() => onDelete(item)} className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition" title="Delete">
                                    <i aria-hidden="true" className="fas fa-trash text-sm"></i>
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {item.description && <p className="text-gray-400 mb-3">{item.description}</p>}

                <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                    {item.date && (
                        <span><i aria-hidden="true" className="fas fa-calendar mr-2"></i>{item.date}</span>
                    )}
                    {item.end_date && (
                        <span><i aria-hidden="true" className="fas fa-flag-checkered mr-2"></i>End: {item.end_date}</span>
                    )}
                    {item.project_name && (
                        <span><i aria-hidden="true" className="fas fa-project-diagram mr-2"></i>{item.project_name}</span>
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
                        <span><i aria-hidden="true" className="fas fa-map-marker-alt mr-2"></i>{item.location}</span>
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
                <div key={s.label} className="bg-surface-panel/90 border border-white/[0.08] rounded-xl p-4 text-center">
                    <i aria-hidden="true" className={`fas ${s.icon} ${s.color} text-lg mb-1`}></i>
                    <div className="text-white font-bold text-lg">{s.value}</div>
                    <div className="text-gray-400 text-xs uppercase tracking-wider">{s.label}</div>
                </div>
            ))}
        </div>
    );
}

export default function Timeline({ timelines = [], expenses = [], photos = [], documents = [], projects = [] }) {
    const [activeTab, setActiveTab] = useState('all');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTimeline, setEditingTimeline] = useState(null);
    const [filterProject] = useActiveProjectId();
    const { canEdit, visible, canEditRecord } = useVisibleActions();
    const { selected: selectedItems, toggle: toggleSelection, selectAll, deselectAll, clear: clearSelection, isSelected, count: selectedCount } = useMultiSelect();

    const { data, setData, patch, processing, errors, reset } = useForm({
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

    const filteredItems = useFilteredItems(allItems, { projectId: filterProject });

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

    function openModal(timeline) {
        setEditingTimeline(timeline);
        setData({
            title: timeline.title || '',
            description: timeline.description || '',
            project_id: timeline.project_id || '',
            start_date: timeline.start_date || '',
            end_date: timeline.end_date || '',
            status: timeline.status || 'pending',
        });
        setIsModalOpen(true);
    }

    function closeModal() {
        setIsModalOpen(false);
        setEditingTimeline(null);
        reset();
    }

    function handleSubmit(e) {
        e.preventDefault();
        if (!editingTimeline) return;
        patch(`/timelines/${editingTimeline.id}`, { onSuccess: () => closeModal() });
    }

    const deleteMilestone = useAction((item) => visit('delete', `/timelines/${item.id}`), {
        confirm: 'Delete this milestone?',
        key: (item) => item.id,
    });
    function handleDelete(item) {
        if (item.type === 'milestone') deleteMilestone.run(item);
    }

    const handleBulkDelete = useBulkDelete({
        selected: selectedItems,
        noun: 'item',
        path: (id) => {
            const item = allItems.find((i) => i.id === id && i.type === 'milestone');
            return item ? `/timelines/${item.id}` : null;
        },
        onDone: clearSelection,
        reload: ['timelines'],
    });

    return (
        <AuthenticatedLayout>
            <Head title="Timeline" />

            <DashboardPage
                hero={{
                    title: 'Timeline',
                    subtitle: 'Track all project activity across milestones, expenses, photos, and documents',
                    breadcrumbs: [
                        ...rootBreadcrumbs(),
                        { label: 'Timeline' },
                    ],
                }}
                toolbar={{
                    actions: visible([{ id: 'add', label: 'Add Milestone', icon: 'fa-plus', href: route('timeline.create'), variant: 'primary' }]),
                }}
            >

                <StatsBar expenses={expenses} photos={photos} documents={documents} milestones={timelines} />

                {/* Tabs */}
                <div className="flex gap-1 mb-6 bg-surface-panel/90 border border-white/[0.08] rounded-xl p-1 w-fit overflow-x-auto">
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
                                <i aria-hidden="true" className={`fas ${tab.icon}`}></i>
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
                            <i aria-hidden="true" className="fas fa-trash mr-1"></i> Delete
                        </button>
                        <button onClick={deselectAll} className="text-gray-400 hover:text-white text-sm">
                            <i aria-hidden="true" className="fas fa-times mr-1"></i> Clear
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
                            action={canEdit ? { label: 'Add Milestone', onClick: () => router.get(route('timeline.create')) } : undefined}
                        />
                    ) : (
                        <div className="relative">
                            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[rgb(139,0,0)] to-[rgb(220,20,60)]"></div>
                            <div className="space-y-6">
                                {currentItems.map((item) => (
                                    <TimelineItem
                                        key={`${item.type}-${item.id}`}
                                        item={item}
                                        onEdit={canEditRecord(item) ? openModal : undefined}
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
                            action={canEdit ? { label: 'Add Milestone', onClick: () => router.get(route('timeline.create')) } : undefined}
                        />
                    ) : (
                        <div className="relative">
                            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[rgb(139,0,0)] to-[rgb(220,20,60)]"></div>
                            <div className="space-y-6">
                                {currentItems.map((item) => (
                                    <TimelineItem
                                        key={item.id}
                                        item={{ ...item, type: 'milestone' }}
                                        onEdit={canEditRecord(item) ? openModal : undefined}
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
                                <div key={expense.id} className="bg-surface-panel/90 border border-white/[0.08] rounded-2xl p-5 flex items-center justify-between hover:border-yellow-500/30 transition">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 flex items-center justify-center">
                                            <i aria-hidden="true" className="fas fa-receipt text-white text-sm"></i>
                                        </div>
                                        <div>
                                            <h4 className="text-white font-medium">{expense.title}</h4>
                                            <div className="flex items-center gap-3 text-sm text-gray-400">
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
                                <div key={photo.id} className="bg-surface-panel/90 border border-white/[0.08] rounded-2xl overflow-hidden hover:border-cyan-500/30 transition group">
                                    <div className="aspect-square bg-white/5 flex items-center justify-center overflow-hidden">
                                        {photo.file_path ? (
                                            <img loading="lazy" decoding="async" 
                                                src={`/storage/${photo.file_path.split('/').map((s) => encodeURIComponent(s)).join('/')}`}
                                                alt={photo.title}
                                                className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                                            />
                                        ) : (
                                            <i aria-hidden="true" className="fas fa-image text-3xl text-gray-400"></i>
                                        )}
                                    </div>
                                    <div className="p-3">
                                        <h4 className="text-white text-sm font-medium truncate">{photo.title}</h4>
                                        <div className="flex items-center justify-between mt-1">
                                            <span className="text-gray-400 text-xs">{photo.date}</span>
                                            {photo.project_name && <span className="text-gray-400 text-[10px] truncate max-w-[100px]">{photo.project_name}</span>}
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
                                <div key={doc.id} className="bg-surface-panel/90 border border-white/[0.08] rounded-2xl p-5 flex items-center justify-between hover:border-purple-500/30 transition">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                                            <i aria-hidden="true" className="fas fa-file-alt text-white text-sm"></i>
                                        </div>
                                        <div>
                                            <h4 className="text-white font-medium">{doc.title}</h4>
                                            <div className="flex items-center gap-3 text-sm text-gray-400">
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
                                                aria-label={`Download ${doc.title || 'document'}`}
                                                className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition"
                                            >
                                                <i aria-hidden="true" className="fas fa-download"></i>
                                            </a>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )
                )}
            </DashboardPage>

            <Modal show={isModalOpen} onClose={closeModal} maxWidth="md">
                <div className="p-8">
                    <h2 className="text-xl font-bold text-white mb-6">
                        Edit Milestone
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <InputLabel htmlFor="timeline-title" value="Title" />
                            <TextInput id="timeline-title" aria-invalid={!!errors.title} aria-describedby={errors.title ? 'timeline-title-error' : undefined} value={data.title} onChange={(e) => setData('title', e.target.value)} placeholder="Milestone title" className="mt-1 block w-full" />
                            <InputError id="timeline-title-error" message={errors.title} className="mt-1" />
                        </div>
                        <div>
                            <InputLabel htmlFor="timeline-description" value="Description" />
                            <textarea
                                id="timeline-description"
                                aria-invalid={!!errors.description}
                                aria-describedby={errors.description ? 'timeline-description-error' : undefined}
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                rows={3}
                                className="mt-1 block w-full px-4 py-2.5 bg-white/[0.06] border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[rgb(139,0,0)] focus:border-transparent resize-none"
                                placeholder="Describe this milestone"
                            />
                            <InputError id="timeline-description-error" message={errors.description} className="mt-1" />
                        </div>
                        <div>
                            <InputLabel htmlFor="timeline-project-id" value="Project" />
                            <SelectInput id="timeline-project-id" aria-invalid={!!errors.project_id} aria-describedby={errors.project_id ? 'timeline-project-id-error' : undefined} value={data.project_id} onChange={(e) => setData('project_id', e.target.value)} placeholder="Select a project" className="mt-1 block w-full">
                                {projects.map((p) => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </SelectInput>
                            <InputError id="timeline-project-id-error" message={errors.project_id} className="mt-1" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <InputLabel htmlFor="timeline-start-date" value="Start Date" />
                                <TextInput id="timeline-start-date" aria-invalid={!!errors.start_date} aria-describedby={errors.start_date ? 'timeline-start-date-error' : undefined} type="date" value={data.start_date} onChange={(e) => setData('start_date', e.target.value)} className="mt-1 block w-full" />
                                <InputError id="timeline-start-date-error" message={errors.start_date} className="mt-1" />
                            </div>
                            <div>
                                <InputLabel htmlFor="timeline-end-date" value="End Date" />
                                <TextInput id="timeline-end-date" aria-invalid={!!errors.end_date} aria-describedby={errors.end_date ? 'timeline-end-date-error' : undefined} type="date" value={data.end_date} onChange={(e) => setData('end_date', e.target.value)} className="mt-1 block w-full" />
                                <InputError id="timeline-end-date-error" message={errors.end_date} className="mt-1" />
                            </div>
                        </div>
                        <div>
                            <InputLabel htmlFor="timeline-status" value="Status" />
                            <SelectInput id="timeline-status" aria-invalid={!!errors.status} aria-describedby={errors.status ? 'timeline-status-error' : undefined} value={data.status} onChange={(e) => setData('status', e.target.value)} className="mt-1 block w-full">
                                <option value="pending">Pending</option>
                                <option value="in_progress">In Progress</option>
                                <option value="completed">Completed</option>
                                <option value="delayed">Delayed</option>
                            </SelectInput>
                            <InputError id="timeline-status-error" message={errors.status} className="mt-1" />
                        </div>
                        <div className="flex justify-end gap-3 pt-5 border-t border-white/10">
                            <SecondaryButton onClick={closeModal} type="button">Cancel</SecondaryButton>
                            <PrimaryButton type="submit" disabled={processing}>
                                {processing ? 'Saving...' : 'Update Milestone'}
                            </PrimaryButton>
                        </div>
                    </form>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
