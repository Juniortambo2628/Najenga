import ImageAnnotator from '@/Components/ImageAnnotator';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { useState, useMemo } from 'react';
import ContextMenu from '@/Components/ContextMenu';
import PreviewModal from '@/Components/PreviewModal';
import CommentsSection from '@/Components/CommentsSection';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import useMultiSelect from '@/Hooks/useMultiSelect';
import useActiveProject from '@/Hooks/useActiveProject';
import useContextMenu from '@/Hooks/useContextMenu';
import useFilteredItems from '@/Hooks/useFilteredItems';
import useAction from '@/Hooks/useAction';
import useFileDownload from '@/Hooks/useFileDownload';
import useBatchDownload from '@/Hooks/useBatchDownload';
import useHashHighlight from '@/Hooks/useHashHighlight';
import EmptyState from '@/Components/EmptyState';
import PrimaryButton from '@/Components/PrimaryButton';
import PhotoCard from '@/Components/PhotoCard';
import DashboardPage from '@/Components/DashboardPage';
import { rootBreadcrumbs } from '@/Config/navigation';
import SharePanel from '@/Components/SharePanel';
import useActiveProjectId from '@/Hooks/useActiveProjectId';
import useVisibleActions from '@/Hooks/useVisibleActions';

/** Dates the camera (or a person) gave; everything else was worked out from the file. */
const EXACT_SOURCES = ['exif', 'manual'];

/** The Library panel's views: everything, by when taken, by how sure the date is; each with its count. */
export function photoViews(photos, now = new Date()) {
    const taken = (p) => new Date(p.photo_date);
    const thisMonth = (p) => taken(p).getFullYear() === now.getFullYear() && taken(p).getMonth() === now.getMonth();
    const thisYear = (p) => taken(p).getFullYear() === now.getFullYear();
    const counted = (item) => ({ ...item, count: photos.filter(item.match).length });
    return [
        counted({ id: 'all', label: 'All photos', icon: 'fa-images', match: () => true }),
        counted({ id: 'this-month', group: 'Taken', label: 'This month', icon: 'fa-calendar-day', match: thisMonth }),
        counted({ id: 'this-year', group: 'Taken', label: 'Earlier this year', icon: 'fa-calendar', match: (p) => thisYear(p) && !thisMonth(p) }),
        counted({ id: 'older', group: 'Taken', label: 'Before this year', icon: 'fa-box-archive', match: (p) => !thisYear(p) }),
        counted({
            id: 'exact',
            group: 'Date',
            label: 'From the camera',
            description: 'Or set by hand',
            icon: 'fa-camera',
            match: (p) => EXACT_SOURCES.includes(p.date_source),
        }),
        counted({
            id: 'estimated',
            group: 'Date',
            label: 'Worth checking',
            description: 'Worked out from the file',
            icon: 'fa-circle-question',
            match: (p) => !EXACT_SOURCES.includes(p.date_source),
        }),
    ];
}

export default function Photos({ photos = [], projects = [] }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeProjectId] = useActiveProjectId();
    
    // Selection State
    const { selected: selectedItems, toggle: toggleSelection, selectAll, deselectAll, clear: clearSelection, isSelected, count: selectedCount } = useMultiSelect();

    // Context Menu State
    const { contextMenu, openContextMenu, closeContextMenu } = useContextMenu();

    // Preview State
    const [previewPhoto, setPreviewPhoto] = useState(null);
    const [shareTarget, setShareTarget] = useState(null);

    const shareProjectFor = (item) => {
        if (!item?.project_id) {
            toast.error('This photo is not part of a project yet');
            return;
        }
        setShareTarget(
            projects.find((p) => p.id === item.project_id) ||
                { id: item.project_id, name: item.project_name || 'Untitled Project' }
        );
    };

    const activeProject = useActiveProject(projects, activeProjectId);
    const highlightedPhoto = useHashHighlight('photo-');

    // The side panel's views (and their counts) cover the picked project.
    const [view, setView] = useState('all');
    const inProject = useFilteredItems(photos, { projectId: activeProjectId });
    const views = useMemo(() => photoViews(inProject), [inProject]);
    const currentView = views.find((v) => v.id === view) ?? views[0];
    const viewPhotos = useMemo(() => photos.filter(currentView.match), [photos, currentView]);

    const filteredPhotos = useFilteredItems(viewPhotos, {
        projectId: activeProjectId,
        searchQuery,
        searchFields: ['title', 'project_name'],
    });

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
        if (!isSelected(photo.id)) {
            toggleSelection(photo.id, false);
        }
        openContextMenu(e, photo);
    };

    const download = useFileDownload();

    const deletePhotos = useAction((ids) => axios.delete('/photos/batch', { data: { ids } }), {
        confirm: (ids, message) => message,
        success: 'Photos deleted successfully',
        error: 'Failed to delete photos',
        key: () => 'bulk',
        only: ['photos'],
        onSuccess: () => clearSelection(),
    });
    const deleteSelectedPhotos = (message) => deletePhotos.run([...selectedItems], message);

    const updatePhoto = useAction((id, fields) => axios.patch(`/photos/${id}`, fields), {
        success: (res, id, fields) => ('title' in fields ? 'Title updated' : 'Location updated'),
        error: 'Failed to save the photo',
    });

    const downloadBatch = useBatchDownload();

    const downloadSelectedPhotos = async () => {
        const ok = await downloadBatch('/photos/download', [...selectedItems], 'photos.zip');
        if (ok) {
            toast.success('Photos downloaded');
        } else {
            toast.error('Failed to download photos');
        }
    };

    const { visible, canEditRecord } = useVisibleActions();

    const contextMenuOptions = [
        { label: 'Preview', icon: 'fa-eye', readOnly: true, action: () => setPreviewPhoto(contextMenu?.target) },
        { label: 'Download', icon: 'fa-download', readOnly: true, action: () =>
            download(contextMenu?.target.file_path, contextMenu?.target.original_name || 'download')
        },
        { label: 'Share', icon: 'fa-share-alt', readOnly: true, action: () => shareProjectFor(contextMenu?.target) },
        { label: 'Delete', icon: 'fa-trash', danger: true, action: () =>
            deleteSelectedPhotos(`Delete ${selectedCount > 1 ? `${selectedCount} items` : 'this item'}?`)
        },
    ];

    return (
        <AuthenticatedLayout>
            <Head title="Photos" />

            <DashboardPage
                onClick={closeContextMenu}
                hero={{
                    title: 'Photos',
                    subtitle: `${filteredPhotos.length} photo${filteredPhotos.length !== 1 ? 's' : ''}${activeProject ? ` in ${activeProject.name}` : ''}`,
                    breadcrumbs: [
                        ...rootBreadcrumbs(),
                        { label: 'Photos' },
                    ],
                }}
                panel={{
                    id: 'photos',
                    title: 'Library',
                    icon: 'fa-images',
                    subtitle: `${inProject.length} photo${inProject.length === 1 ? '' : 's'}${activeProject ? ` in ${activeProject.name}` : ' in all projects'}`,
                    items: views.map(({ match, ...item }) => item),
                    activeId: currentView.id,
                    onChange: (id) => {
                        setView(id);
                        clearSelection();
                    },
                    footer: 'Dates come from the camera where a photo has them; otherwise from its file or folder name, or when it was uploaded.',
                }}
                toolbar={{
                    search: { value: searchQuery, onChange: setSearchQuery, placeholder: 'Search photos' },
                    view: {
                        current: viewMode,
                        onChange: setViewMode,
                        modes: [
                            { value: 'grid', icon: 'fa-th', label: 'Grid' },
                            { value: 'timeline', icon: 'fa-clock', label: 'Timeline' },
                        ],
                    },
                    actions: visible([{ id: 'upload', label: 'Upload Photo', icon: 'fa-upload', href: route('photos.create'), variant: 'primary' }]),
                    selection: {
                        count: selectedCount,
                        total: filteredPhotos.length,
                        onSelectAll: () => selectAll(filteredPhotos.map(p => p.id)),
                        onDeselectAll: deselectAll,
                        actions: visible([
                            { id: 'download', label: 'Download Selected', icon: 'fa-download', readOnly: true, onClick: downloadSelectedPhotos },
                            { id: 'delete', label: 'Delete Selected', icon: 'fa-trash', variant: 'danger', onClick: () => deleteSelectedPhotos(`Delete ${selectedCount} items?`) },
                        ]),
                    },
                }}
            >
                {/* Context Toolbar */}

                {/* Timeline Grouping Options */}
                {viewMode === 'timeline' && (
                    <div className="flex bg-black/50 border border-white/10 rounded-xl p-1 mb-6 w-fit animate-in fade-in slide-in-from-left-2">
                        {['day', 'week', 'month', 'year'].map(g => (
                            <button 
                                key={g}
                                onClick={() => setTimelineGroup(g)}
                                aria-pressed={timelineGroup === g}
                                className={`px-3 py-1.5 rounded-lg transition text-xs uppercase font-bold ${timelineGroup === g ? 'bg-white text-black' : 'text-gray-400 hover:text-gray-300'}`}
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
                        noun="photo"
                        search={searchQuery}
                        filtered={currentView.id !== 'all'}
                        onClear={() => {
                            setSearchQuery('');
                            setView('all');
                        }}
                    />
                ) : viewMode === 'grid' ? (
                    // Grid View
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4" onContextMenu={(e) => e.preventDefault()}>
                        {filteredPhotos.map((photo) => (
                           <PhotoCard 
                                key={photo.id} 
                                photo={photo} 
                                selected={isSelected(photo.id)} 
                                highlighted={highlightedPhoto === String(photo.id)}
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
                                    <span className="text-gray-400 text-xs font-mono">{photos.length} photos</span>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 pl-4 border-l-2 border-[#8B0000]/20">
                                    {photos.map((photo) => (
                                        <PhotoCard 
                                            key={photo.id} 
                                            photo={photo} 
                                            selected={isSelected(photo.id)} 
                                            highlighted={highlightedPhoto === String(photo.id)}
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
            </DashboardPage>

            {/* Context Menu */}
            {contextMenu && (
                <ContextMenu 
                    options={visible(contextMenuOptions, canEditRecord(contextMenu.target))} 
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
                                    <label htmlFor="photos-title" className="text-gray-400 text-xs uppercase tracking-wider block mb-1">Title</label>
                                    <input id="photos-title" 
                                        type="text" 
                                        value={previewPhoto?.title || ''}
                                        onChange={(e) => {
                                            const newTitle = e.target.value;
                                            setPreviewPhoto(prev => ({...prev, title: newTitle}));
                                        }}
                                        onBlur={() => updatePhoto.run(previewPhoto.id, { title: previewPhoto.title })}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-[#8B0000]"
                                    />
                                </div>
                                
                                <div>
                                    <label htmlFor="photos-location" className="text-gray-400 text-xs uppercase tracking-wider block mb-1">Location</label>
                                    <div className="relative">
                                        <i aria-hidden="true" className="fas fa-map-marker-alt absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs"></i>
                                        <input id="photos-location" 
                                            type="text" 
                                            value={previewPhoto?.location || ''}
                                            onChange={(e) => setPreviewPhoto(prev => ({...prev, location: e.target.value}))}
                                            onBlur={() => updatePhoto.run(previewPhoto.id, { location: previewPhoto.location })}
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

            {shareTarget && (
                <SharePanel show onClose={() => setShareTarget(null)} project={shareTarget} />
            )}

        </AuthenticatedLayout>
    );
}
