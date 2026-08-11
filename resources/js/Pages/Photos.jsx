import ImageAnnotator from '@/Components/ImageAnnotator';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

import { Head, router } from '@inertiajs/react';
import { useState, useMemo, useRef, useEffect } from 'react';
import ContextMenu from '@/Components/ContextMenu';
import PreviewModal from '@/Components/PreviewModal';
import CommentsSection from '@/Components/CommentsSection';
import FileUploadModal from '@/Components/FileUploadModal';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import useMultiSelect from '@/Hooks/useMultiSelect';
import ContextToolbar from '@/Components/ContextToolbar';
import EmptyState from '@/Components/EmptyState';
import PrimaryButton from '@/Components/PrimaryButton';
import PhotoCard from '@/Components/PhotoCard';
import SearchFilterBar from '@/Components/SearchFilterBar';
import BulkActions from '@/Components/BulkActions';

export default function Photos({ photos = [], projects = [] }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeProjectId, setActiveProjectId] = useState(null);
    
    // Modal State
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    
    // Selection State
    const { selected: selectedItems, toggle: toggleSelection, selectAll, deselectAll, clear: clearSelection, isSelected, count: selectedCount } = useMultiSelect();

    // Context Menu State
    const [contextMenu, setContextMenu] = useState(null);

    // Preview State
    const [previewPhoto, setPreviewPhoto] = useState(null);

    const activeProject = useMemo(
        () => projects.find(p => String(p.id) === String(activeProjectId)),
        [projects, activeProjectId]
    );

    const filteredPhotos = useMemo(() => {
        let result = [...photos];
        if (activeProjectId) {
            result = result.filter(photo => String(photo.project_id) === String(activeProjectId));
        }
        if (searchQuery) {
            const lowerQuery = searchQuery.toLowerCase();
            result = result.filter(photo => 
                photo.title.toLowerCase().includes(lowerQuery) ||
                photo.project_name.toLowerCase().includes(lowerQuery)
            );
        }
        return result;
    }, [photos, activeProjectId, searchQuery]);

    // Timeline State
    const [viewMode, setViewMode] = useState('grid');
    const [timelineGroup, setTimelineGroup] = useState('month');

    // Grouping Logic
    const groupedPhotos = useMemo(() => {
        if (viewMode !== 'timeline') return {};

        const groups = {};
        
        filteredPhotos.forEach(photo => {
            const date = new Date(photo.photo_date);
            let key = '';

            if (isNaN(date.getTime())) {
                key = 'Undated';
            } else {
                switch(timelineGroup) {
                    case 'day':
                        key = date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
                        break;
                    case 'week':
                        const firstDay = new Date(date);
                        firstDay.setDate(date.getDate() - date.getDay());
                        key = `Week of ${firstDay.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
                        break;
                    case 'month':
                        key = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
                        break;
                    case 'year':
                        key = date.getFullYear().toString();
                        break;
                    default:
                        key = 'All';
                }
            }

            if (!groups[key]) groups[key] = [];
            groups[key].push(photo);
        });

        return groups;
    }, [filteredPhotos, viewMode, timelineGroup]);

    // Handlers
    const handleContextMenu = (e, photo) => {
        e.preventDefault();
        if (!isSelected(photo.id)) {
            toggleSelection(photo.id, false);
        }
        setContextMenu({
            x: e.clientX,
            y: e.clientY,
            target: photo
        });
    };

    const closeContextMenu = () => setContextMenu(null);

    const contextMenuOptions = [
        { label: 'Preview', icon: 'fa-eye', action: () => setPreviewPhoto(contextMenu?.target) },
        { label: 'Download', icon: 'fa-download', action: () => {
            const link = document.createElement('a');
            link.href = `/storage/${contextMenu?.target.file_path.split('/').map(seg => encodeURIComponent(seg)).join('/')}`;
            link.download = contextMenu?.target.original_name || 'download';
            link.click();
        }},
        { label: 'Share', icon: 'fa-share-alt', action: () => alert('Sharing not implemented yet') },
        { label: 'Delete', icon: 'fa-trash', danger: true, action: async () => {
            if (confirm(`Delete ${selectedCount > 1 ? `${selectedCount} items` : 'this item'}?`)) {
                for (const id of selectedItems) {
                    await router.delete(`/photos/${id}`);
                }
                clearSelection();
                toast.success('Photos deleted successfully');
            }
        }},
    ];

    return (
        <AuthenticatedLayout>
            <Head title="Photos" />

            <FileUploadModal
                isOpen={isUploadModalOpen}
                onClose={() => setIsUploadModalOpen(false)}
                uploadUrl="/photos"
                acceptedFileTypes={{ 'image/*': [] }}
                title="Upload Photos"
            />

            <div onClick={closeContextMenu}>
                {/* Context Toolbar */}
                <ContextToolbar
                    projects={projects}
                    currentProjectId={activeProjectId}
                    onProjectChange={setActiveProjectId}
                    pageTitle="Photos"
                    pageSubtitle={`${filteredPhotos.length} photo${filteredPhotos.length !== 1 ? 's' : ''}${activeProject ? ` in ${activeProject.name}` : ''}`}
                    selectedCount={selectedCount}
                    bulkActions={
                        <>
                            <button className="text-white hover:text-gray-200" title="Download Selected"><i className="fas fa-download"></i></button>
                            <button
                                className="text-white hover:text-gray-200"
                                title="Delete Selected"
                                onClick={async () => {
                                    if (confirm(`Delete ${selectedCount} items?`)) {
                                        for (const id of selectedItems) {
                                            await router.delete(`/photos/${id}`);
                                        }
                                        clearSelection();
                                        toast.success('Photos deleted successfully');
                                    }
                                }}
                            >
                                <i className="fas fa-trash"></i>
                            </button>
                            <button className="text-white hover:text-gray-200" onClick={clearSelection} title="Clear Selection"><i className="fas fa-times"></i></button>
                        </>
                    }
                    actions={
                        <PrimaryButton onClick={() => setIsUploadModalOpen(true)}>
                            <i className="fas fa-upload"></i> Upload Photo
                        </PrimaryButton>
                    }
                >
                    <div className="flex items-center gap-3 flex-wrap">
                        <BulkActions
                            selectedCount={selectedCount}
                            totalCount={filteredPhotos.length}
                            onSelectAll={() => selectAll(filteredPhotos.map(p => p.id))}
                            onDeselectAll={deselectAll}
                            actions={
                                <>
                                    <button className="text-white hover:text-gray-200" title="Download Selected"><i className="fas fa-download"></i></button>
                                    <button
                                        className="text-white hover:text-gray-200"
                                        title="Delete Selected"
                                        onClick={async () => {
                                            if (confirm(`Delete ${selectedCount} items?`)) {
                                                for (const id of selectedItems) {
                                                    await router.delete(`/photos/${id}`);
                                                }
                                                clearSelection();
                                                toast.success('Photos deleted successfully');
                                            }
                                        }}
                                    >
                                        <i className="fas fa-trash"></i>
                                    </button>
                                    <button className="text-white hover:text-gray-200" onClick={clearSelection} title="Clear Selection"><i className="fas fa-times"></i></button>
                                </>
                            }
                        />
                        <SearchFilterBar
                            searchValue={searchQuery}
                            onSearchChange={setSearchQuery}
                            filters={[]}
                            viewMode={viewMode}
                            onViewModeChange={setViewMode}
                            viewModeOptions={[
                                { value: 'grid', label: 'Grid', icon: 'fa-th' },
                                { value: 'timeline', label: 'Timeline', icon: 'fa-clock' },
                            ]}
                        />
                    </div>
                </ContextToolbar>

                {/* Timeline Grouping Options */}
                {viewMode === 'timeline' && (
                    <div className="flex bg-black/50 border border-white/10 rounded-xl p-1 mb-6 w-fit animate-in fade-in slide-in-from-left-2">
                        {['day', 'week', 'month', 'year'].map(g => (
                            <button 
                                key={g}
                                onClick={() => setTimelineGroup(g)}
                                className={`px-3 py-1.5 rounded-lg transition text-xs uppercase font-bold ${timelineGroup === g ? 'bg-white text-black' : 'text-gray-500 hover:text-gray-300'}`}
                            >
                                {g}
                            </button>
                        ))}
                    </div>
                )}

                {/* Content */}
                {filteredPhotos.length === 0 ? (
                    <EmptyState
                        icon="fa-images"
                        title="No photos found"
                        message="Upload photos to your projects to see them here."
                    />
                ) : viewMode === 'grid' ? (
                    // Grid View
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4" onContextMenu={(e) => e.preventDefault()}>
                        {filteredPhotos.map((photo) => (
                           <PhotoCard 
                                key={photo.id} 
                                photo={photo} 
                                selected={isSelected(photo.id)} 
                                onToggle={(multi) => toggleSelection(photo.id, multi)}
                                onContextMenu={(e) => handleContextMenu(e, photo)}
                                onPreview={() => setPreviewPhoto(photo)}
                           />
                        ))}
                    </div>
                ) : (
                    // Timeline View
                    <div className="space-y-8" onContextMenu={(e) => e.preventDefault()}>
                        {Object.entries(groupedPhotos).map(([groupTitle, photos]) => (
                            <div key={groupTitle} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="px-4 py-1.5 bg-[#8B0000] rounded-full text-white font-bold text-sm shadow-lg whitespace-nowrap">
                                        {groupTitle}
                                    </div>
                                    <div className="h-[1px] bg-gradient-to-r from-[#8B0000]/50 to-transparent flex-1"></div>
                                    <span className="text-gray-500 text-xs font-mono">{photos.length} photos</span>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 pl-4 border-l-2 border-[#8B0000]/20">
                                    {photos.map((photo) => (
                                        <PhotoCard 
                                            key={photo.id} 
                                            photo={photo} 
                                            selected={isSelected(photo.id)} 
                                            onToggle={(multi) => toggleSelection(photo.id, multi)}
                                            onContextMenu={(e) => handleContextMenu(e, photo)}
                                            onPreview={() => setPreviewPhoto(photo)}
                                        />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Context Menu */}
            {contextMenu && (
                <ContextMenu 
                    options={contextMenuOptions} 
                    position={{ x: contextMenu.x, y: contextMenu.y }} 
                    onClose={closeContextMenu} 
                />
            )}

            <PreviewModal 
                isOpen={!!previewPhoto} 
                onClose={() => setPreviewPhoto(null)} 
                title={previewPhoto?.title || 'Photo Preview'}
            >
                <div className="flex flex-col lg:flex-row h-full overflow-hidden">
                    {/* Image Area */}
                    <div className="flex-1 bg-black/20 flex flex-col items-center justify-center relative overflow-hidden">
                        {previewPhoto && (
                            <ImageAnnotator resource={previewPhoto} type="photo" />
                        )}
                    </div>
 
                    {/* Sidebar Area */}
                    <div className="w-full lg:w-96 bg-black/40 border-l border-white/10 flex flex-col h-full overflow-hidden">
                        <div className="p-6 border-b border-white/10 shrink-0">
                            <h3 className="text-lg font-bold text-white mb-4">Details</h3>
                            
                            {/* Editable Fields */}
                            <div className="space-y-4">
                                <div>
                                    <label className="text-gray-500 text-xs uppercase tracking-wider block mb-1">Title</label>
                                    <input 
                                        type="text" 
                                        value={previewPhoto?.title || ''}
                                        onChange={(e) => {
                                            const newTitle = e.target.value;
                                            setPreviewPhoto(prev => ({...prev, title: newTitle}));
                                        }}
                                        onBlur={async () => {
                                            try {
                                                await axios.patch(`/photos/${previewPhoto.id}`, { title: previewPhoto.title });
                                                toast.success('Title updated');
                                            } catch(e) { console.error(e); }
                                        }}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-[#8B0000]"
                                    />
                                </div>
                                
                                <div>
                                    <label className="text-gray-500 text-xs uppercase tracking-wider block mb-1">Location</label>
                                    <div className="relative">
                                        <i className="fas fa-map-marker-alt absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs"></i>
                                        <input 
                                            type="text" 
                                            value={previewPhoto?.location || ''}
                                            onChange={(e) => setPreviewPhoto(prev => ({...prev, location: e.target.value}))}
                                            onBlur={async () => {
                                                try {
                                                    await axios.patch(`/photos/${previewPhoto.id}`, { location: previewPhoto.location });
                                                    toast.success('Location updated');
                                                } catch(e) { console.error(e); }
                                            }}
                                            placeholder="Add location..."
                                            className="w-full bg-white/5 border border-white/10 rounded-lg pl-8 pr-3 py-2 text-white text-sm focus:border-[#8B0000]"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        {/* Comments */}
                        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                            {previewPhoto && (
                                <CommentsSection type="photo" id={previewPhoto.id} projectId={previewPhoto.project_id} />
                            )}
                        </div>
                    </div>
                </div>
            </PreviewModal>

        </AuthenticatedLayout>
    );
}
