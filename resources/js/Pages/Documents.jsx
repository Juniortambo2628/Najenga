import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState, useMemo, Fragment } from 'react';
import ContextMenu from '@/Components/ContextMenu';
import PreviewModal from '@/Components/PreviewModal';
import CommentsSection from '@/Components/CommentsSection';
import ImageAnnotator from '@/Components/ImageAnnotator';
import { Document as PdfDocument, Page, pdfjs } from 'react-pdf';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import FloatingToolbar from '@/Components/FloatingToolbar';
import EmptyState from '@/Components/EmptyState';
import PrimaryButton from '@/Components/PrimaryButton';
import Modal from '@/Components/Modal';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import SelectInput from '@/Components/SelectInput';
import SecondaryButton from '@/Components/SecondaryButton';
import useMultiSelect from '@/Hooks/useMultiSelect';
import useActiveProject from '@/Hooks/useActiveProject';
import useContextMenu from '@/Hooks/useContextMenu';
import useFilteredItems from '@/Hooks/useFilteredItems';
import useFileDownload from '@/Hooks/useFileDownload';
import useBatchDownload from '@/Hooks/useBatchDownload';
import useHashHighlight from '@/Hooks/useHashHighlight';
import DashboardHero from '@/Components/DashboardHero';
import { rootBreadcrumbs } from '@/Config/navigation';
import ShareProjectModal from '@/Components/ShareProjectModal';

// Configure PDF worker (served locally, no CDN round-trip)
pdfjs.GlobalWorkerOptions.workerSrc = '/js/pdf.worker.min.mjs';
if (pdfjs.setVerbosityLevel) pdfjs.setVerbosityLevel(pdfjs.VerbosityLevel?.ERRORS ?? 1);

export default function Documents({ documents = [], folders = [], projects = [] }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [shareTarget, setShareTarget] = useState(null);
    const [moveTarget, setMoveTarget] = useState(null);
    const [moveFolderId, setMoveFolderId] = useState('');
    const [moving, setMoving] = useState(false);

    const shareProjectFor = (item) => {
        if (!item?.project_id) {
            toast.error('This document is not part of a project yet');
            return;
        }
        setShareTarget(
            projects.find((p) => p.id === item.project_id) ||
                { id: item.project_id, name: item.project_name || 'Untitled Project' }
        );
    };
    const [typeFilter, setTypeFilter] = useState('all');
    const [activeProjectId, setActiveProjectId] = useState(null);
    const [viewMode, setViewMode] = useState('grid'); // Default to grid
    
    // Selection State
    const { selected: selectedItems, toggle: toggleSelection, selectAll, deselectAll, clear: clearSelection, isSelected, count: selectedCount } = useMultiSelect();
    
    // Context Menu State
    const { contextMenu, openContextMenu, closeContextMenu } = useContextMenu();

    // Preview State
    const [previewDoc, setPreviewDoc] = useState(null);

    // Folder Navigation State
    const [currentFolderId, setCurrentFolderId] = useState(null);
    const highlightedDoc = useHashHighlight('doc-');
    const [isNewFolderModalOpen, setIsNewFolderModalOpen] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');

    const activeProject = useActiveProject(projects, activeProjectId);

    // Extract unique types
    const types = useMemo(() => {
        const unique = new Set(documents.map(d => d.document_type));
        return ['all', ...Array.from(unique)];
    }, [documents]);

    // Current folder's subfolders
    const currentSubfolders = useMemo(() => {
        return folders.filter(f => f.parent_id === currentFolderId);
    }, [folders, currentFolderId]);

    // Breadcrumb path
    const breadcrumbs = useMemo(() => {
        const crumbs = [];
        let folderId = currentFolderId;
        while (folderId) {
            const folder = folders.find(f => f.id === folderId);
            if (folder) {
                crumbs.unshift(folder);
                folderId = folder.parent_id;
            } else {
                break;
            }
        }
        return crumbs;
    }, [folders, currentFolderId]);

    const folderAndTypeFiltered = useMemo(() => {
        let result = documents.filter(doc => doc.folder_id === currentFolderId);
        if (typeFilter !== 'all') result = result.filter(doc => doc.document_type === typeFilter);
        return result;
    }, [documents, typeFilter, currentFolderId]);

    const filteredDocuments = useFilteredItems(folderAndTypeFiltered, {
        projectId: activeProjectId,
        searchQuery,
        searchFields: ['title', 'project_name'],
    });

    // Handlers
    const handleContextMenu = (e, doc) => {
        if (!isSelected(doc.id)) selectAll([doc.id]);
        openContextMenu(e, doc);
    };

    const download = useFileDownload();

    const downloadBatch = useBatchDownload();

    const downloadSelectedDocuments = async () => {
        const ok = await downloadBatch('/documents/download', [...selectedItems], 'documents.zip');
        if (ok) {
            toast.success('Documents downloaded');
        } else {
            toast.error('Failed to download documents');
        }
    };

    const openMoveModal = (doc) => {
        setMoveTarget(doc);
        setMoveFolderId(doc?.folder_id ? String(doc.folder_id) : '');
    };

    const handleMove = async () => {
        setMoving(true);
        try {
            await axios.patch(route('documents.move', moveTarget.id), { folder_id: moveFolderId || null });
            toast.success('Document moved');
            setMoveTarget(null);
            setMoveFolderId('');
            router.reload({ only: ['documents'] });
        } catch (e) {
            toast.error(e.response?.data?.errors?.folder_id?.[0] || 'Failed to move document');
        } finally {
            setMoving(false);
        }
    };

    const contextMenuOptions = [
        { label: 'Preview', icon: 'fa-eye', action: () => setPreviewDoc(contextMenu?.target) },
        { label: 'Download', icon: 'fa-download', action: () =>
            download(contextMenu?.target.file_path, contextMenu?.target.original_name || 'download')
        },
        { label: 'Share', icon: 'fa-share-alt', action: () => shareProjectFor(contextMenu?.target) },
        { label: 'Move to Folder', icon: 'fa-folder-open', action: () => openMoveModal(contextMenu?.target) },
        { label: 'Delete', icon: 'fa-trash', danger: true, action: async () => {
            if (confirm(`Delete ${selectedCount > 1 ? `${selectedCount} items` : 'this item'}?`)) {
                try {
                    const ids = [...selectedItems];
                    await axios.delete('/documents/batch', { data: { ids } });
                    clearSelection();
                    toast.success(`${ids.length} document${ids.length !== 1 ? 's' : ''} deleted`);
                    router.reload({ only: ['documents'] });
                } catch (e) {
                    toast.error('Failed to delete documents');
                }
            }
        }},
    ];

    const deleteSelectedDocuments = async () => {
        if (!confirm(`Delete ${selectedCount} items?`)) return;
        try {
            const ids = [...selectedItems];
            await axios.delete('/documents/batch', { data: { ids } });
            clearSelection();
            toast.success(`${ids.length} document${ids.length !== 1 ? 's' : ''} deleted`);
            router.reload({ only: ['documents'] });
        } catch (e) {
            toast.error('Failed to delete documents');
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Documents" />

            <div onClick={closeContextMenu}>
                <DashboardHero
                    title="Documents"
                    subtitle={`${filteredDocuments.length} document${filteredDocuments.length !== 1 ? 's' : ''}${activeProject ? ` in ${activeProject.name}` : ''}`}
                    breadcrumbs={[
                        ...rootBreadcrumbs(),
                        { label: 'Documents' },
                    ]}
                />
                {/* Context Toolbar */}
                <FloatingToolbar
                    project={{ projects, currentId: activeProjectId, onChange: setActiveProjectId }}
                    search={{ value: searchQuery, onChange: setSearchQuery, placeholder: 'Search documents' }}
                    filters={[
                        {
                            name: 'type',
                            title: 'Type',
                            value: typeFilter,
                            onChange: setTypeFilter,
                            options: types.map(t => ({ value: t, label: t === 'all' ? 'All Types' : t })),
                        },
                    ]}
                    view={{
                        current: viewMode,
                        onChange: setViewMode,
                        modes: [
                            { value: 'grid', icon: 'fa-th-large', label: 'Grid View' },
                            { value: 'list', icon: 'fa-list', label: 'List View' },
                        ],
                    }}
                    actions={[
                        { id: 'upload', label: 'Upload', icon: 'fa-upload', href: route('documents.create'), variant: 'primary' },
                        { id: 'folder', label: 'New Folder', icon: 'fa-folder-plus', onClick: () => setIsNewFolderModalOpen(true) },
                    ]}
                    selection={{
                        count: selectedCount,
                        total: filteredDocuments.length,
                        onSelectAll: () => selectAll(filteredDocuments.map(d => d.id)),
                        onDeselectAll: deselectAll,
                        actions: [
                            { id: 'download', label: 'Download Selected', icon: 'fa-download', onClick: downloadSelectedDocuments },
                            { id: 'delete', label: 'Delete Selected', icon: 'fa-trash', variant: 'danger', onClick: deleteSelectedDocuments },
                        ],
                    }}
                />

                {/* Breadcrumb Navigation */}
                <div className="flex items-center gap-2 mb-4 text-sm overflow-x-auto pb-1">
                    <button
                        onClick={() => setCurrentFolderId(null)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition whitespace-nowrap ${
                            currentFolderId === null ? 'bg-[#8B0000]/20 text-[#DC143C] font-semibold' : 'text-gray-400 hover:text-white hover:bg-white/5'
                        }`}
                    >
                        <i aria-hidden="true" className="fas fa-home text-xs"></i> All Documents
                    </button>
                    {breadcrumbs.map((crumb) => (
                        <Fragment key={crumb.id}>
                            <i aria-hidden="true" className="fas fa-chevron-right text-gray-400 text-[10px]"></i>
                            <button
                                onClick={() => setCurrentFolderId(crumb.id)}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition whitespace-nowrap ${
                                    currentFolderId === crumb.id ? 'bg-[#8B0000]/20 text-[#DC143C] font-semibold' : 'text-gray-400 hover:text-white hover:bg-white/5'
                                }`}
                            >
                                <i aria-hidden="true" className="fas fa-folder text-xs"></i> {crumb.name}
                            </button>
                        </Fragment>
                    ))}
                </div>

                {/* Empty State */}
                {filteredDocuments.length === 0 && folders.length === 0 && (
                    <EmptyState 
                        icon="fa-file-alt" 
                        title="No documents yet" 
                        message="Upload documents to keep them organized"
                        action={{ label: 'Upload Document', onClick: () => router.get(route('documents.create')) }}
                    />
                )}

                {/* Documents List/Grid */}
                {filteredDocuments.length === 0 && currentSubfolders.length === 0 ? (
                    <EmptyState
                        icon="fa-file-alt"
                        title={currentFolderId ? 'This folder is empty' : 'No documents found'}
                        message="Upload documents to your projects to see them here."
                    />
                ) : viewMode === 'list' ? (
                    <div className="bg-black/50 border border-white/10 rounded-2xl overflow-hidden" onContextMenu={(e) => e.preventDefault()}>
                        <div className="divide-y divide-white/5">
                            {/* Folder rows */}
                            {currentSubfolders.map((folder) => (
                                <div 
                                    key={`folder-${folder.id}`}
                                    className="flex items-center justify-between p-4 transition group cursor-pointer border-l-4 border-transparent hover:bg-white/5 hover:border-amber-500/50"
                                    onDoubleClick={() => setCurrentFolderId(folder.id)}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-6 h-6 mr-2"></div>
                                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center shadow-lg group-hover:scale-105 transition">
                                            <i aria-hidden="true" className="fas fa-folder text-white text-xl"></i>
                                        </div>
                                        <div>
                                            <h4 className="text-white font-medium group-hover:text-amber-400 transition">{folder.name}</h4>
                                            <p className="text-gray-400 text-xs">Folder</p>
                                        </div>
                                    </div>
                                    <button
                                        aria-label={`Delete folder ${folder.name}`}
                                        onClick={(e) => { e.stopPropagation(); if (confirm(`Delete folder "${folder.name}"? Documents inside will be moved to root.`)) router.delete(`/folders/${folder.id}`, { preserveScroll: true }); }}
                                        className="p-2 rounded-lg text-gray-400 hover:bg-red-500/20 hover:text-red-400 transition opacity-0 group-hover:opacity-100 group-focus-within:opacity-100"
                                    >
                                        <i aria-hidden="true" className="fas fa-trash text-xs"></i>
                                    </button>
                                </div>
                            ))}
                            {/* Document rows */}
                            {filteredDocuments.map((doc) => (
                                <div 
                                    key={doc.id} 
                                    id={`doc-${doc.id}`}
                                    className={`flex items-center justify-between p-4 transition group cursor-pointer border-l-4
                                        ${isSelected(doc.id) ? 'bg-white/5 border-[#DC143C]' : highlightedDoc === String(doc.id) ? 'bg-amber-500/10 border-amber-400/70 ring-1 ring-inset ring-amber-400/50' : 'border-transparent hover:bg-white/5 hover:border-white/10'}
                                    `}
                                    onClick={(e) => toggleSelection(doc.id, e.ctrlKey || e.metaKey)}
                                    onContextMenu={(e) => handleContextMenu(e, doc)}
                                    onDoubleClick={() => setPreviewDoc(doc)}
                                >
                                    <div className="flex items-center gap-4">
                                        <button
                                            type="button"
                                            onClick={(e) => { e.stopPropagation(); toggleSelection(doc.id, e.ctrlKey || e.metaKey); }}
                                            aria-pressed={isSelected(doc.id)}
                                            aria-label={`Select ${doc.title}`}
                                            className={`w-6 h-6 rounded border flex items-center justify-center mr-2 transition
                                                ${isSelected(doc.id) ? 'bg-[#DC143C] border-[#DC143C]' : 'border-gray-400 bg-transparent'}
                                            `}
                                        >
                                            {isSelected(doc.id) && <i aria-hidden="true" className="fas fa-check text-white text-xs"></i>}
                                        </button>

                                        <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-[rgb(139,0,0)] to-[rgb(220,20,60)] flex items-center justify-center shadow-lg group-hover:scale-105 transition">
                                            <i aria-hidden="true" className={`fas ${
                                                doc.document_type === 'invoice' ? 'fa-file-invoice-dollar' :
                                                doc.document_type === 'plan' ? 'fa-ruler-combined' :
                                                'fa-file-alt'
                                            } text-white text-xl`}></i>
                                        </div>
                                        <div>
                                            <h4 className="text-white font-medium group-hover:text-[#DC143C] transition">
                                                <Link href={route('documents.show', doc.id)} onClick={(e) => e.stopPropagation()}>
                                                    {doc.title}
                                                </Link>
                                            </h4>
                                            <p className="text-gray-400 text-sm">
                                                <span className="bg-white/10 px-2 py-0.5 rounded text-xs mr-2 text-gray-300">{doc.document_type}</span>
                                                {doc.project_name}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <span className="text-gray-400 text-sm hidden md:block">{doc.document_date}</span>
                                        <button aria-label={`Download ${doc.title}`} className="p-2 rounded-lg text-gray-400 hover:bg-white/10 hover:text-white transition">
                                            <i aria-hidden="true" className="fas fa-download"></i>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6" onContextMenu={(e) => e.preventDefault()}>
                         {/* Folder Cards */}
                         {currentSubfolders.map((folder) => (
                            <div 
                                key={`folder-${folder.id}`}
                                className="relative group bg-black/40 border border-white/10 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:border-amber-500/30 aspect-[4/5] flex flex-col cursor-pointer"
                                onDoubleClick={() => setCurrentFolderId(folder.id)}
                            >
                                <div className="flex-1 overflow-hidden bg-white/5 relative flex flex-col items-center justify-center gap-3 group-hover:scale-105 transition duration-500">
                                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center shadow-xl">
                                        <i aria-hidden="true" className="fas fa-folder-open text-4xl text-white"></i>
                                    </div>
                                    <span className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Folder</span>
                                </div>
                                <div className="p-4 bg-black/20 border-t border-white/5 flex items-center justify-between">
                                    <h4 className="text-white font-semibold truncate group-hover:text-amber-400 transition" title={folder.name}>
                                        {folder.name}
                                    </h4>
                                    <button
                                        aria-label={`Delete folder ${folder.name}`}
                                        onClick={(e) => { e.stopPropagation(); if (confirm(`Delete folder "${folder.name}"?`)) router.delete(`/folders/${folder.id}`, { preserveScroll: true }); }}
                                        className="p-1.5 rounded-lg text-gray-400 hover:bg-red-500/20 hover:text-red-400 transition opacity-0 group-hover:opacity-100 group-focus-within:opacity-100"
                                    >
                                        <i aria-hidden="true" className="fas fa-trash text-xs"></i>
                                    </button>
                                </div>
                            </div>
                         ))}
                         {/* Document Cards */}
                         {filteredDocuments.map((doc) => {
                             const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].some(ext => doc.file_path.toLowerCase().endsWith(ext));
                             const isPdf = doc.file_path.toLowerCase().endsWith('.pdf');
                             const isDoc = doc.file_path.toLowerCase().endsWith('.doc') || doc.file_path.toLowerCase().endsWith('.docx');
                             const isExcel = doc.file_path.toLowerCase().endsWith('.xls') || doc.file_path.toLowerCase().endsWith('.xlsx');

                             return (
                                <div 
                                    key={doc.id}
                                    className={`relative group bg-black/40 border border-white/10 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:border-[#8B0000]/50 aspect-[4/5] flex flex-col
                                        ${isSelected(doc.id) ? 'ring-2 ring-[#DC143C] border-[#DC143C]' : ''}
                                    `}
                                    onClick={(e) => toggleSelection(doc.id, e.ctrlKey || e.metaKey)}
                                    onContextMenu={(e) => handleContextMenu(e, doc)}
                                    onDoubleClick={() => setPreviewDoc(doc)}
                                >
                                    {/* Thumbnail Area */}
                                    <div className="flex-1 overflow-hidden bg-white/5 relative flex items-center justify-center">
                                         {isImage ? (
                                            <img loading="lazy" decoding="async" 
                                                src={doc.thumb_url || `/storage/${doc.file_path.split('/').map(seg => encodeURIComponent(seg)).join('/')}`}
                                                className="w-full h-full object-cover transition duration-500 group-hover:scale-110"
                                                alt={doc.title}
                                            />
                                        ) : isPdf ? (
                                            <div className="w-full h-full overflow-hidden bg-gray-100 relative group-hover:scale-110 transition duration-500">
                                                <PdfDocument
                                                    file={`/storage/${doc.file_path.split('/').map(seg => encodeURIComponent(seg)).join('/')}`}
                                                    className="w-full h-full flex items-start justify-center overflow-hidden"
                                                    loading={
                                                        <div className="flex h-full items-center justify-center">
                                                            <i aria-hidden="true" className="fas fa-spinner fa-spin text-gray-400"></i>
                                                        </div>
                                                    }
                                                    error={
                                                        <div className="flex flex-col items-center justify-center h-full gap-3">
                                                             <div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-xl bg-gradient-to-br from-red-500 to-red-700">
                                                                 <i aria-hidden="true" className="fas fa-file-pdf text-3xl text-white"></i>
                                                             </div>
                                                             <span className="text-[10px] uppercase tracking-widest text-gray-600 font-bold">PDF</span>
                                                        </div>
                                                    }
                                                >
                                                    <Page 
                                                        pageNumber={1} 
                                                        width={250}
                                                        renderTextLayer={false}
                                                        renderAnnotationLayer={false}
                                                    />
                                                </PdfDocument>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center gap-3 group-hover:scale-110 transition duration-500">
                                                 <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-xl bg-gradient-to-br
                                                     ${isExcel ? 'from-green-500 to-green-700' : isDoc ? 'from-blue-500 to-blue-700' : 'from-gray-500 to-gray-700'}
                                                 `}>
                                                     <i aria-hidden="true" className={`fas ${
                                                         isExcel ? 'fa-file-excel' : isDoc ? 'fa-file-word' : 'fa-file-alt'
                                                     } text-3xl text-white`}></i>
                                                 </div>
                                                 <span className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">
                                                     {doc.file_path.split('.').pop()}
                                                 </span>
                                            </div>
                                        )}

                                        {/* Selection Checkbox */}
                                        <button
                                            type="button"
                                            onClick={(e) => { e.stopPropagation(); toggleSelection(doc.id, e.ctrlKey || e.metaKey); }}
                                            aria-pressed={isSelected(doc.id)}
                                            aria-label={`Select ${doc.title}`}
                                            className={`absolute top-4 right-4 w-6 h-6 rounded-full border-2 flex items-center justify-center transition shadow-lg
                                            ${isSelected(doc.id) ? 'bg-[#DC143C] border-[#DC143C]' : 'bg-black/40 border-white/50 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100'}
                                        `}>
                                            {isSelected(doc.id) && <i aria-hidden="true" className="fas fa-check text-white text-xs"></i>}
                                        </button>

                                        {/* Quick Actions Overlay */}
                                        <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 group-focus-within:translate-y-0 transition-transform bg-gradient-to-t from-black via-black/80 to-transparent flex justify-center gap-4">
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); setPreviewDoc(doc); }}
                                                className="w-10 h-10 rounded-full bg-white/10 hover:bg-[#8B0000] text-white transition flex items-center justify-center"
                                                title="Preview"
                                            >
                                                <i aria-hidden="true" className="fas fa-eye"></i>
                                            </button>
                                            <button 
                                                onClick={(e) => { 
                                                    e.stopPropagation(); 
                                                    download(doc.file_path, doc.original_name || 'download');
                                                }}
                                                className="w-10 h-10 rounded-full bg-white/10 hover:bg-[#8B0000] text-white transition flex items-center justify-center"
                                                title="Download"
                                            >
                                                <i aria-hidden="true" className="fas fa-download"></i>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Info Area */}
                                    <div className="p-4 bg-black/20 border-t border-white/5">
                                        <h4 className="text-white font-semibold truncate group-hover:text-[#DC143C] transition" title={doc.title}>
                                            {doc.title}
                                        </h4>
                                        <div className="flex justify-between items-center mt-1">
                                            <p className="text-gray-400 text-xs truncate max-w-[60%]">{doc.project_name}</p>
                                            <p className="text-gray-400 text-[10px]">{doc.document_date}</p>
                                        </div>
                                    </div>
                                </div>
                             );
                         })}
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
                isOpen={!!previewDoc} 
                onClose={() => setPreviewDoc(null)} 
                title={previewDoc?.title || 'Document Preview'}
            >
                <div className="flex flex-col lg:flex-row h-full overflow-hidden">
                    {/* Content Area */}
                    <div className="flex-1 bg-black/20 flex flex-col items-center justify-center relative overflow-hidden">
                        {previewDoc && (() => {
                            const fp = previewDoc.file_path.toLowerCase();
                            const fileUrl = `/storage/${previewDoc.file_path.split('/').map(segment => encodeURIComponent(segment)).join('/')}`;
                            const isPdf = fp.endsWith('.pdf');
                            const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].some(ext => fp.endsWith(ext));
                            const isOffice = fp.endsWith('.docx') || fp.endsWith('.doc') || fp.endsWith('.xlsx') || fp.endsWith('.xls') || fp.endsWith('.pptx') || fp.endsWith('.ppt');
                            const isText = fp.endsWith('.txt') || fp.endsWith('.csv') || fp.endsWith('.json') || fp.endsWith('.xml') || fp.endsWith('.md');

                            if (isPdf) {
                                return <iframe src={fileUrl} className="w-full h-full rounded-lg shadow-lg border-0" title="PDF Preview" />;
                            }
                            if (isImage) {
                                return <ImageAnnotator resource={previewDoc} type="document" />;
                            }
                            if (isOffice) {
                                return (
                                    <iframe
                                        src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(window.location.origin + fileUrl)}`}
                                        className="w-full h-full rounded-lg shadow-lg border-0"
                                        title="Document Preview"
                                    />
                                );
                            }
                            if (isText) {
                                return (
                                    <div className="w-full h-full overflow-auto p-6">
                                        <pre className="text-gray-300 text-sm font-mono whitespace-pre-wrap bg-black/30 rounded-xl p-4 border border-white/10">
                                            Loading...
                                        </pre>
                                    </div>
                                );
                            }
                            return (
                                <div className="text-center p-8">
                                    <div className="w-20 h-20 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4">
                                        <i aria-hidden="true" className="fas fa-file text-4xl text-gray-400"></i>
                                    </div>
                                    <p className="text-gray-400 mb-4 font-medium">Preview not available for this file type.</p>
                                    <a 
                                        href={fileUrl} 
                                        download 
                                        className="inline-flex items-center gap-2 px-6 py-2 bg-[#8B0000] text-white rounded-lg hover:bg-[#DC143C] transition font-bold"
                                    >
                                        <i aria-hidden="true" className="fas fa-download"></i>
                                        Download to View
                                    </a>
                                </div>
                            );
                        })()}
                    </div>
 
                     {/* Sidebar Area */}
                     <div className="w-full lg:w-96 bg-black/40 border-l border-white/10 flex flex-col h-full overflow-hidden">
                        <div className="p-6 border-b border-white/10 shrink-0">
                            <h3 className="text-lg font-bold text-white mb-4">Details</h3>
                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="documents-title" className="text-gray-400 text-xs uppercase tracking-wider block mb-1">Title</label>
                                    <input id="documents-title" 
                                        type="text" 
                                        value={previewDoc?.title || ''}
                                        onChange={(e) => setPreviewDoc(prev => ({...prev, title: e.target.value}))}
                                        onBlur={async () => {
                                            try {
                                                await axios.patch(`/documents/${previewDoc.id}`, { title: previewDoc.title });
                                                toast.success('Title updated');
                                            } catch(e) { console.error(e); }
                                        }}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-[#8B0000]"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <span className="text-gray-400 text-xs uppercase tracking-wider block mb-1">Type</span>
                                        <span className="text-gray-300 text-xs font-mono bg-white/5 px-2 py-1 rounded inline-block">{previewDoc?.document_type}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-400 text-xs uppercase tracking-wider block mb-1">Date</span>
                                        <span className="text-gray-300 text-xs">{previewDoc?.document_date}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        {/* Comments */}
                        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                            {previewDoc && (
                                <CommentsSection type="document" id={previewDoc.id} projectId={previewDoc.project_id} />
                            )}
                        </div>
                    </div>
                </div>
            </PreviewModal>

            {/* New Folder Modal */}
            <Modal show={isNewFolderModalOpen} onClose={() => { setIsNewFolderModalOpen(false); setNewFolderName(''); }} maxWidth="md">
                <div className="p-6">
                    <h3 className="text-lg font-bold text-white flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[rgb(139,0,0)] to-[rgb(220,20,60)] flex items-center justify-center">
                            <i aria-hidden="true" className="fas fa-folder-plus text-white text-sm"></i>
                        </div>
                        Create New Folder
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <InputLabel htmlFor="documents-folder-name" value="Folder Name" />
                            <TextInput
                                id="documents-folder-name"
                                value={newFolderName}
                                onChange={(e) => setNewFolderName(e.target.value)}
                                placeholder="e.g. Contracts, Invoices, Plans..."
                                autoFocus
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && newFolderName.trim()) {
                                        const projectId = documents[0]?.project_id;
                                        if (projectId) {
                                            router.post(route('folders.store'), {
                                                name: newFolderName.trim(),
                                                project_id: projectId,
                                                parent_id: currentFolderId,
                                            }, { preserveScroll: true });
                                            setNewFolderName('');
                                            setIsNewFolderModalOpen(false);
                                        }
                                    }
                                }}
                            />
                        </div>
                    </div>
                    <div className="mt-6 flex justify-end gap-3">
                        <SecondaryButton onClick={() => { setIsNewFolderModalOpen(false); setNewFolderName(''); }}>
                            Cancel
                        </SecondaryButton>
                        <PrimaryButton
                            onClick={() => {
                                if (!newFolderName.trim()) return;
                                const projectId = documents[0]?.project_id;
                                if (projectId) {
                                    router.post(route('folders.store'), {
                                        name: newFolderName.trim(),
                                        project_id: projectId,
                                        parent_id: currentFolderId,
                                    }, { preserveScroll: true });
                                    setNewFolderName('');
                                    setIsNewFolderModalOpen(false);
                                }
                            }}
                            disabled={!newFolderName.trim()}
                        >
                            Create Folder
                        </PrimaryButton>
                    </div>
                </div>
            </Modal>

            {shareTarget && (
                <ShareProjectModal show onClose={() => setShareTarget(null)} project={shareTarget} />
            )}

            {moveTarget && (
                <Modal show onClose={() => setMoveTarget(null)} maxWidth="md">
                    <div className="p-6">
                        <h3 className="text-lg font-bold text-white flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[rgb(139,0,0)] to-[rgb(220,20,60)] flex items-center justify-center">
                                <i className="fas fa-folder-open text-white text-sm"></i>
                            </div>
                            Move "{moveTarget.title}"
                        </h3>
                        <InputLabel value="Destination folder" />
                        <SelectInput
                            value={moveFolderId}
                            onChange={(e) => setMoveFolderId(e.target.value)}
                            className="mt-1 block w-full"
                        >
                            <option value="">Root (no folder)</option>
                            {folders
                                .filter((f) => f.project_id === moveTarget.project_id)
                                .map((f) => (
                                    <option key={f.id} value={f.id}>{f.name}</option>
                                ))}
                        </SelectInput>
                        <div className="flex justify-end gap-3 pt-4 mt-6 border-t border-white/10">
                            <SecondaryButton type="button" onClick={() => setMoveTarget(null)}>Cancel</SecondaryButton>
                            <PrimaryButton type="button" onClick={handleMove} disabled={moving}>
                                {moving ? 'Moving...' : 'Move'}
                            </PrimaryButton>
                        </div>
                    </div>
                </Modal>
            )}

        </AuthenticatedLayout>
    );
}
