import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage, Link, useForm, router } from '@inertiajs/react';
import { useState, useMemo } from 'react';
import toast from 'react-hot-toast';
import ContextToolbar from '@/Components/ContextToolbar';
import EmptyState from '@/Components/EmptyState';
import StatusBadge from '@/Components/StatusBadge';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import SearchFilterBar from '@/Components/SearchFilterBar';
import Modal from '@/Components/Modal';
import ShareProjectModal from '@/Components/ShareProjectModal';
import TextInput from '@/Components/TextInput';
import SelectInput from '@/Components/SelectInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import BulkActions from '@/Components/BulkActions';
import useMultiSelect from '@/Hooks/useMultiSelect';
import { exportToCSV } from '@/Utils/exportToCSV';
import { CURRENCY_OPTIONS, formatCurrency } from '@/Config/currencies';

export default function Projects({ projects = [] }) {
    const { auth } = usePage().props;
    const [viewMode, setViewMode] = useState('grid');
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [sortBy, setSortBy] = useState('newest');
    const { selected: selectedItems, toggle: toggleSelection, selectAll, deselectAll, clear: clearSelection, isSelected, count: selectedCount } = useMultiSelect();

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProject, setEditingProject] = useState(null);
    const [sharingProject, setSharingProject] = useState(null);

    const { data, setData, post, patch, processing, reset, errors } = useForm({
        name: '',
        description: '',
        status: 'planning',
        start_date: '',
        end_date: '',
        budget: '',
        currency: 'KES',
        location: '',
    });

    // Derived State
    const filteredProjects = useMemo(() => {
        let result = [...projects];
        if (statusFilter !== 'all') result = result.filter(project => project.status === statusFilter);
        if (searchQuery) {
            const lowerQuery = searchQuery.toLowerCase();
            result = result.filter(project =>
                project.name.toLowerCase().includes(lowerQuery) ||
                project.location?.toLowerCase().includes(lowerQuery)
            );
        }
        result.sort((a, b) => {
            if (sortBy === 'newest') return new Date(b.created_at) - new Date(a.created_at);
            if (sortBy === 'oldest') return new Date(a.created_at) - new Date(b.created_at);
            if (sortBy === 'budget_high') return (b.budget || 0) - (a.budget || 0);
            if (sortBy === 'budget_low') return (a.budget || 0) - (b.budget || 0);
            return 0;
        });
        return result;
    }, [projects, statusFilter, searchQuery, sortBy]);

    // Project Modal Handlers
    const openCreateModal = () => {
        reset();
        setEditingProject(null);
        setIsModalOpen(true);
    };

    const openEditModal = (project) => {
        setEditingProject(project);
        setData({
            name: project.name || '',
            description: project.description || '',
            status: project.status || 'planning',
            start_date: project.start_date || '',
            end_date: project.end_date || '',
            budget: project.budget || '',
            currency: project.currency || 'KES',
            location: project.location || '',
        });
        setIsModalOpen(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingProject) {
            patch(`/projects/${editingProject.id}`, {
                onSuccess: () => { setIsModalOpen(false); reset(); toast.success('Project updated'); }
            });
        } else {
            post('/projects', {
                onSuccess: () => { setIsModalOpen(false); reset(); toast.success('Project created'); }
            });
        }
    };

    const handleExport = () => {
        exportToCSV(
            [
                { key: 'name', label: 'Name' },
                { key: 'status', label: 'Status' },
                { key: 'budget', label: 'Budget' },
                { key: 'location', label: 'Location' },
                { key: 'start_date', label: 'Start Date' },
            ],
            filteredProjects,
            'projects.csv'
        );
    };

    const handleBulkDelete = async () => {
        if (!confirm(`Delete ${selectedCount} project${selectedCount !== 1 ? 's' : ''}?`)) return;
        const ids = [...selectedItems];
        let failed = 0;
        for (const id of ids) {
            try {
                await new Promise((resolve, reject) => {
                    router.delete(`/projects/${id}`, {
                        preserveScroll: true,
                        onSuccess: resolve,
                        onError: reject,
                    });
                });
            } catch {
                failed++;
            }
        }
        clearSelection();
        if (failed > 0) {
            toast.error(`Failed to delete ${failed} project${failed !== 1 ? 's' : ''}`);
        } else {
            toast.success(`${ids.length} project${ids.length !== 1 ? 's' : ''} deleted`);
        }
        router.reload({ only: ['projects'] });
    };

    // Create/Edit Modal Tabs
    const projectModalTabs = [
        {
            label: 'Details',
            icon: 'fa-info-circle',
            content: (
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <InputLabel value="Project Name *" />
                        <TextInput
                            required
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            placeholder="Enter project name"
                        />
                        <InputError message={errors.name} />
                    </div>
                    <div>
                        <InputLabel value="Description" />
                        <textarea
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            placeholder="Enter project description"
                            rows={4}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 transition-all duration-200 focus:outline-none focus:border-[#8B0000] focus:ring-1 focus:ring-[#8B0000]/50 resize-none"
                        />
                        <InputError message={errors.description} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <InputLabel value="Location" />
                            <TextInput
                                value={data.location}
                                onChange={(e) => setData('location', e.target.value)}
                                placeholder="Enter project location"
                            />
                            <InputError message={errors.location} />
                        </div>
                        <div>
                            <InputLabel value="Budget" />
                            <div className="flex gap-2">
                                <TextInput
                                    type="number"
                                    value={data.budget}
                                    onChange={(e) => setData('budget', e.target.value)}
                                    placeholder="Enter budget"
                                    className="flex-1"
                                />
                                <select
                                    value={data.currency}
                                    onChange={(e) => setData('currency', e.target.value)}
                                    className="w-24 bg-white/5 border border-white/10 rounded-xl px-3 py-3 text-sm text-white focus:border-[#8B0000] focus:ring-[#8B0000]"
                                >
                                    {CURRENCY_OPTIONS.map(opt => (
                                        <option key={opt.value} value={opt.value}>{opt.value}</option>
                                    ))}
                                </select>
                            </div>
                            <InputError message={errors.budget} />
                            <InputError message={errors.currency} />
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                        <SecondaryButton type="button" onClick={() => { setIsModalOpen(false); setEditingProject(null); reset(); }}>
                            Cancel
                        </SecondaryButton>
                        <PrimaryButton type="submit" disabled={processing}>
                            {processing ? 'Saving...' : (editingProject ? 'Update Project' : 'Create Project')}
                        </PrimaryButton>
                    </div>
                </form>
            ),
        },
        {
            label: 'Schedule',
            icon: 'fa-calendar',
            content: (
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <InputLabel value="Status" />
                            <SelectInput
                                value={data.status}
                                onChange={(e) => setData('status', e.target.value)}
                            >
                                <option value="planning">Planning</option>
                                <option value="active">Active</option>
                                <option value="on_hold">On Hold</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                            </SelectInput>
                            <InputError message={errors.status} />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <InputLabel value="Start Date" />
                            <TextInput
                                type="date"
                                value={data.start_date}
                                onChange={(e) => setData('start_date', e.target.value)}
                            />
                            <InputError message={errors.start_date} />
                        </div>
                        <div>
                            <InputLabel value="End Date" />
                            <TextInput
                                type="date"
                                value={data.end_date}
                                onChange={(e) => setData('end_date', e.target.value)}
                            />
                            <InputError message={errors.end_date} />
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                        <SecondaryButton type="button" onClick={() => { setIsModalOpen(false); setEditingProject(null); reset(); }}>
                            Cancel
                        </SecondaryButton>
                        <PrimaryButton type="submit" disabled={processing}>
                            {processing ? 'Saving...' : (editingProject ? 'Update Project' : 'Create Project')}
                        </PrimaryButton>
                    </div>
                </form>
            ),
        },
    ];

    return (
        <AuthenticatedLayout>
            <Head title="Projects" />

            <div>
                {/* Context Toolbar */}
                <ContextToolbar
                    pageTitle="Projects"
                    pageSubtitle={`${filteredProjects.length} project${filteredProjects.length !== 1 ? 's' : ''}`}
                    actions={
                        <>
                            <BulkActions
                                selectedCount={selectedCount}
                                totalCount={filteredProjects.length}
                                onSelectAll={() => selectAll(filteredProjects.map(p => p.id))}
                                onDeselectAll={deselectAll}
                                actions={
                                    <button className="text-white hover:text-gray-200" title="Delete Selected" onClick={handleBulkDelete}>
                                        <i className="fas fa-trash"></i>
                                    </button>
                                }
                            />
                            <button onClick={handleExport} className="px-4 py-2 bg-white/5 border border-white/10 text-gray-300 rounded-xl hover:bg-white/10 transition text-sm font-medium">
                                <i className="fas fa-download mr-2"></i> Export
                            </button>
                            <PrimaryButton onClick={openCreateModal}>
                                <i className="fas fa-plus"></i> New Project
                            </PrimaryButton>
                        </>
                    }
                >
                    <SearchFilterBar
                        searchValue={searchQuery}
                        onSearchChange={setSearchQuery}
                        filters={[
                            {
                                name: 'status',
                                value: statusFilter,
                                onChange: setStatusFilter,
                                label: 'All Status',
                                options: [
                                    { value: 'planning', label: 'Planning' },
                                    { value: 'active', label: 'Active' },
                                    { value: 'completed', label: 'Completed' },
                                ],
                            },
                            {
                                name: 'sort',
                                value: sortBy,
                                onChange: setSortBy,
                                label: 'Newest First',
                                options: [
                                    { value: 'oldest', label: 'Oldest First' },
                                    { value: 'budget_high', label: 'Budget: High to Low' },
                                    { value: 'budget_low', label: 'Budget: Low to High' },
                                ],
                            },
                        ]}
                        viewMode={viewMode}
                        onViewModeChange={setViewMode}
                        viewModeOptions={[
                            { value: 'grid', icon: 'fa-th-large' },
                            { value: 'list', icon: 'fa-list' },
                        ]}
                    />
                </ContextToolbar>

                {/* Grid/List View */}
                {filteredProjects.length === 0 ? (
                    <EmptyState
                        icon="fa-project-diagram"
                        title="No projects found"
                        message="Create your first project to get started."
                        action={{ label: 'New Project', onClick: openCreateModal }}
                    />
                ) : (
                    <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
                        {filteredProjects.map((project) => (
                            <div key={project.id} className={`group bg-gradient-to-br from-[#1a0508]/80 via-[#120306]/80 to-[#0a0102]/80 backdrop-blur-xl border border-white/[0.06] hover:border-[#8B0000]/30 rounded-2xl p-5 transition-all hover:shadow-xl hover:shadow-[#8B0000]/10 ${viewMode === 'list' ? 'flex items-center justify-between gap-6' : ''} ${isSelected(project.id) ? 'ring-1 ring-[#8B0000]/50' : ''}`}>
                                <div className={viewMode === 'list' ? 'flex-1' : ''}>
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                checked={isSelected(project.id)}
                                                onChange={() => toggleSelection(project.id)}
                                                className="rounded border-white/20 bg-white/5 text-[#8B0000] focus:ring-[#8B0000]"
                                            />
                                            <StatusBadge status={project.status} />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => openEditModal(project)}
                                                className="text-gray-400 hover:text-white transition p-2"
                                                title="Edit Project"
                                            >
                                                <i className="fas fa-edit"></i>
                                            </button>
                                            <button
                                                onClick={() => setSharingProject(project)}
                                                className="text-gray-400 hover:text-white transition p-2"
                                                title="Share Project"
                                            >
                                                <i className="fas fa-share-alt"></i>
                                            </button>
                                        </div>
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-[#DC143C] transition">{project.name}</h3>
                                    <p className="text-gray-400 text-sm mb-4 line-clamp-2">{project.description}</p>
                                     {viewMode === 'grid' && (
                                        <div className="grid grid-cols-2 gap-4 text-sm text-gray-300 mb-4">
                                            <div><i className="fas fa-map-marker-alt w-5 text-gray-500"></i> {project.location}</div>
                                            <div><i className="fas fa-money-bill-wave w-5 text-gray-500"></i> {formatCurrency(project.budget, project.currency)}</div>
                                        </div>
                                    )}
                                </div>

                                {viewMode === 'list' ? (
                                    <div className="flex items-center gap-8 text-right">
                                        <div>
                                            <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Budget</p>
                                            <p className="text-white font-bold">{formatCurrency(project.budget, project.currency)}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Location</p>
                                            <p className="text-white">{project.location}</p>
                                        </div>
                                        <button className="text-[#DC143C] hover:text-white transition">
                                            <i className="fas fa-arrow-right"></i>
                                        </button>
                                    </div>
                                ) : (
                                    <div className="pt-4 border-t border-white/5 flex justify-between items-center">
                                        <span className="text-xs text-gray-500">Last updated recently</span>
                                        <Link href={route('projects.show', project.id)} className="text-[#DC143C] font-semibold text-sm hover:text-[#8B0000] transition flex items-center">
                                            View Details <i className="fas fa-arrow-right ml-1"></i>
                                        </Link>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Share Modal */}
            <ShareProjectModal
                show={!!sharingProject}
                onClose={() => setSharingProject(null)}
                project={sharingProject || { id: 0, name: '' }}
                onSuccess={() => setSharingProject(null)}
            />

            {/* Create/Edit Project Modal (Tabbed) */}
            <Modal
                show={isModalOpen}
                onClose={() => { setIsModalOpen(false); setEditingProject(null); reset(); }}
                maxWidth="3xl"
                tabs={projectModalTabs}
                title={editingProject ? 'Edit Project' : 'New Project'}
                subtitle={editingProject ? 'Update Project' : 'Create Project'}
            />
        </AuthenticatedLayout>
    );
}
