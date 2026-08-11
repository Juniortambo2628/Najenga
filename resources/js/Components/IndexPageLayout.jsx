import { useState, useMemo } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import ContextToolbar from '@/Components/ContextToolbar';
import SearchFilterBar from '@/Components/SearchFilterBar';
import EmptyState from '@/Components/EmptyState';
import ContextMenu from '@/Components/ContextMenu';

export default function IndexPageLayout({
    title,
    projects = [],
    items = [],
    renderItem,
    emptyState,
    filters = [],
    sortOptions = [],
    viewModeOptions,
    defaultViewMode = 'list',
    searchFields = [],
    contextMenuOptions = null,
    contextMenu,
    closeContextMenu,
    onItemContextMenu,
    actions,
    bulkActions,
    selectedCount = 0,
    children,
}) {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeProjectId, setActiveProjectId] = useState(null);
    const [viewMode, setViewMode] = useState(defaultViewMode);
    const [activeFilters, setActiveFilters] = useState(() =>
        Object.fromEntries(filters.map(f => [f.name, f.defaultValue || 'all']))
    );
    const [sortBy, setSortBy] = useState(sortOptions[0]?.value || '');

    const activeProject = useMemo(
        () => projects.find(p => String(p.id) === String(activeProjectId)),
        [projects, activeProjectId]
    );

    const filteredItems = useMemo(() => {
        let result = [...items];

        if (activeProjectId) {
            result = result.filter(item => String(item.project_id) === String(activeProjectId));
        }

        for (const [key, value] of Object.entries(activeFilters)) {
            if (value && value !== 'all') {
                result = result.filter(item => item[key] === value);
            }
        }

        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            result = result.filter(item =>
                searchFields.some(field => {
                    const val = item[field];
                    return val && String(val).toLowerCase().includes(q);
                })
            );
        }

        if (sortBy) {
            const opt = sortOptions.find(o => o.value === sortBy);
            if (opt?.sortFn) {
                result.sort(opt.sortFn);
            }
        }

        return result;
    }, [items, activeProjectId, activeFilters, searchQuery, sortBy, searchFields, sortOptions]);

    const filterConfig = filters.map(f => ({
        ...f,
        value: activeFilters[f.name] || 'all',
        onChange: (val) => setActiveFilters(prev => ({ ...prev, [f.name]: val })),
    }));

    return (
        <AuthenticatedLayout>
            <Head title={title} />
            <div onClick={closeContextMenu}>
                <ContextToolbar
                    projects={projects}
                    currentProjectId={activeProjectId}
                    onProjectChange={setActiveProjectId}
                    pageTitle={title}
                    pageSubtitle={`${filteredItems.length} item${filteredItems.length !== 1 ? 's' : ''}${activeProject ? ` in ${activeProject.name}` : ''}`}
                    actions={actions}
                    selectedCount={selectedCount}
                    bulkActions={bulkActions}
                >
                    <SearchFilterBar
                        searchValue={searchQuery}
                        onSearchChange={setSearchQuery}
                        filters={filterConfig}
                        viewMode={viewModeOptions ? viewMode : undefined}
                        onViewModeChange={viewModeOptions ? setViewMode : undefined}
                        viewModeOptions={viewModeOptions}
                    />
                </ContextToolbar>

                {filteredItems.length === 0 ? (
                    <EmptyState
                        icon={emptyState?.icon || 'fa-inbox'}
                        title={emptyState?.title || 'No items found'}
                        message={emptyState?.message || 'Try adjusting your filters'}
                        action={emptyState?.action}
                    />
                ) : (
                    renderItem(filteredItems, viewMode)
                )}

                {children}
            </div>

            {contextMenu && contextMenuOptions && (
                <ContextMenu
                    options={contextMenuOptions}
                    position={{ x: contextMenu.x, y: contextMenu.y }}
                    onClose={closeContextMenu}
                />
            )}
        </AuthenticatedLayout>
    );
}
