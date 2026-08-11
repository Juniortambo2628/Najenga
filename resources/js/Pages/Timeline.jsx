import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { useState } from 'react';
import PageHeader from '@/Components/PageHeader';
import EmptyState from '@/Components/EmptyState';
import StatusBadge from '@/Components/StatusBadge';
import Modal from '@/Components/Modal';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import TextInput from '@/Components/TextInput';
import SelectInput from '@/Components/SelectInput';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import BulkActions from '@/Components/BulkActions';
import useMultiSelect from '@/Hooks/useMultiSelect';
import toast from 'react-hot-toast';

export default function Timeline({ timelines = [], projects = [] }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTimeline, setEditingTimeline] = useState(null);
    const { selected: selectedItems, toggle: toggleSelection, selectAll, deselectAll, clear: clearSelection, isSelected, count: selectedCount } = useMultiSelect();

    const { data, setData, post, patch, processing, errors, reset } = useForm({
        title: '',
        description: '',
        project_id: '',
        start_date: '',
        end_date: '',
        status: 'pending',
    });

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
            patch(`/timelines/${editingTimeline.id}`, {
                onSuccess: () => closeModal(),
            });
        } else {
            post('/timelines', {
                onSuccess: () => closeModal(),
            });
        }
    }

    function handleDelete(id) {
        if (confirm('Are you sure you want to delete this milestone?')) {
            router.delete(`/timelines/${id}`);
        }
    }

    async function handleBulkDelete() {
        if (!confirm(`Delete ${selectedCount} milestone${selectedCount !== 1 ? 's' : ''}?`)) return;
        const ids = [...selectedItems];
        let failed = 0;
        for (const id of ids) {
            try {
                await new Promise((resolve, reject) => {
                    router.delete(`/timelines/${id}`, {
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
            toast.error(`Failed to delete ${failed} milestone${failed !== 1 ? 's' : ''}`);
        } else {
            toast.success(`${ids.length} milestone${ids.length !== 1 ? 's' : ''} deleted`);
        }
        router.reload({ only: ['timelines'] });
    }

    return (
        <AuthenticatedLayout>
            <Head title="Timeline" />

            <div>
                <PageHeader
                    title="Timeline"
                    subtitle="Track your project milestones and progress"
                    selectedCount={selectedCount}
                    actions={
                        <div className="flex items-center gap-3">
                            <BulkActions
                                selectedCount={selectedCount}
                                totalCount={timelines.length}
                                onSelectAll={() => selectAll(timelines.map(t => t.id))}
                                onDeselectAll={deselectAll}
                                actions={
                                    <button className="text-white hover:text-gray-200" title="Delete Selected" onClick={handleBulkDelete}>
                                        <i className="fas fa-trash"></i>
                                    </button>
                                }
                            />
                            <PrimaryButton onClick={() => openModal()}>
                                <i className="fas fa-plus"></i> Add Milestone
                            </PrimaryButton>
                        </div>
                    }
                />

                {timelines.length === 0 ? (
                    <EmptyState
                        icon="fa-calendar-alt"
                        title="No milestones yet"
                        message="Add milestones to track your project progress"
                        action={{ label: 'Add Milestone', onClick: () => openModal() }}
                    />
                ) : (
                    <div className="relative">
                        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[rgb(139,0,0)] to-[rgb(220,20,60)]"></div>

                        <div className="space-y-6">
                            {timelines.map((item) => (
                                <div key={item.id} className={`relative flex gap-6 ${isSelected(item.id) ? 'opacity-75' : ''}`}>
                                    <div className="flex flex-col items-center">
                                        <input
                                            type="checkbox"
                                            checked={isSelected(item.id)}
                                            onChange={() => toggleSelection(item.id)}
                                            className="rounded border-white/20 bg-white/5 text-[#8B0000] focus:ring-[#8B0000] mt-3"
                                        />
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 z-10 mt-2 ${item.status === 'completed' ? 'bg-green-500' : item.status === 'in_progress' ? 'bg-gradient-to-r from-[rgb(139,0,0)] to-[rgb(220,20,60)]' : 'bg-gray-700'}`}>
                                            <i className={`fas ${item.status === 'completed' ? 'fa-check' : item.status === 'in_progress' ? 'fa-spinner fa-spin' : 'fa-clock'} text-white`}></i>
                                        </div>
                                    </div>

                                    <div className="flex-1 bg-gray-900/50 border border-white/10 rounded-2xl p-6">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="text-xl font-semibold text-white">{item.title}</h3>
                                            <div className="flex items-center gap-2">
                                                <StatusBadge status={item.status} />
                                                <button
                                                    onClick={() => openModal(item)}
                                                    className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition"
                                                    title="Edit"
                                                >
                                                    <i className="fas fa-pen text-sm"></i>
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(item.id)}
                                                    className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"
                                                    title="Delete"
                                                >
                                                    <i className="fas fa-trash text-sm"></i>
                                                </button>
                                            </div>
                                        </div>
                                        <p className="text-gray-400 mb-3">{item.description}</p>
                                        <div className="flex gap-4 text-sm text-gray-500">
                                            <span><i className="fas fa-calendar mr-2"></i>Start: {item.start_date}</span>
                                            <span><i className="fas fa-flag-checkered mr-2"></i>End: {item.end_date}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
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
                            <TextInput
                                value={data.title}
                                onChange={(e) => setData('title', e.target.value)}
                                placeholder="Milestone title"
                                className="mt-1 block w-full"
                            />
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
                            <SelectInput
                                value={data.project_id}
                                onChange={(e) => setData('project_id', e.target.value)}
                                placeholder="Select a project"
                                className="mt-1 block w-full"
                            >
                                {projects.map((p) => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </SelectInput>
                            <InputError message={errors.project_id} className="mt-1" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <InputLabel value="Start Date" />
                                <TextInput
                                    type="date"
                                    value={data.start_date}
                                    onChange={(e) => setData('start_date', e.target.value)}
                                    className="mt-1 block w-full"
                                />
                                <InputError message={errors.start_date} className="mt-1" />
                            </div>
                            <div>
                                <InputLabel value="End Date" />
                                <TextInput
                                    type="date"
                                    value={data.end_date}
                                    onChange={(e) => setData('end_date', e.target.value)}
                                    className="mt-1 block w-full"
                                />
                                <InputError message={errors.end_date} className="mt-1" />
                            </div>
                        </div>

                        <div>
                            <InputLabel value="Status" />
                            <SelectInput
                                value={data.status}
                                onChange={(e) => setData('status', e.target.value)}
                                className="mt-1 block w-full"
                            >
                                <option value="pending">Pending</option>
                                <option value="in_progress">In Progress</option>
                                <option value="completed">Completed</option>
                                <option value="delayed">Delayed</option>
                            </SelectInput>
                            <InputError message={errors.status} className="mt-1" />
                        </div>

                        <div className="flex justify-end gap-3 pt-5 border-t border-white/10">
                            <SecondaryButton onClick={closeModal} type="button">
                                Cancel
                            </SecondaryButton>
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
