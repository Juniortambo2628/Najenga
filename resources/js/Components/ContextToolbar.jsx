import { useState, useMemo } from 'react';
import SelectInput from '@/Components/SelectInput';

export default function ContextToolbar({
    projects = [],
    currentProjectId = null,
    onProjectChange,
    pageTitle = '',
    pageSubtitle = '',
    actions = null,
    selectedCount = 0,
    bulkActions = null,
    children,
}) {
    const currentProject = useMemo(
        () => projects.find(p => String(p.id) === String(currentProjectId)),
        [projects, currentProjectId]
    );

    return (
        <div className="bg-gray-900/60 border border-white/10 rounded-2xl px-5 py-3 mb-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
                {/* Left: Project context + page info */}
                <div className="flex items-center gap-4 min-w-0">
                    {/* Project Switcher */}
                    {projects.length > 0 && (
                        <div className="flex items-center gap-2 min-w-0">
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
                                <i className="fas fa-project-diagram text-[#DC143C] text-xs"></i>
                                {currentProject ? (
                                    <span className="text-sm font-semibold text-white truncate max-w-[160px]">
                                        {currentProject.name}
                                    </span>
                                ) : (
                                    <span className="text-sm text-gray-400">All Projects</span>
                                )}
                            </div>
                            {onProjectChange && (
                                <select
                                    value={currentProjectId || ''}
                                    onChange={(e) => onProjectChange(e.target.value || null)}
                                    className="px-2 py-1.5 rounded-lg text-xs bg-white/5 border border-white/10 text-gray-300 focus:outline-none focus:border-[#8B0000] cursor-pointer"
                                >
                                    <option value="">All Projects</option>
                                    {projects.map(p => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>
                            )}
                        </div>
                    )}

                    {/* Page Title */}
                    {pageTitle && (
                        <div className="min-w-0">
                            <h2 className="text-sm font-bold text-white truncate">{pageTitle}</h2>
                            {pageSubtitle && (
                                <p className="text-xs text-gray-500 truncate">{pageSubtitle}</p>
                            )}
                        </div>
                    )}
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 flex-wrap">
                    {/* Bulk Actions (shown when rows selected) */}
                    {selectedCount > 0 && bulkActions && (
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#8B0000]/15 border border-[#8B0000]/30">
                            <span className="text-xs font-semibold text-[#DC143C]">
                                {selectedCount} selected
                            </span>
                            <div className="w-px h-4 bg-[#8B0000]/30"></div>
                            {bulkActions}
                        </div>
                    )}

                    {/* Page Actions */}
                    {actions && (
                        <div className="flex items-center gap-2">
                            {actions}
                        </div>
                    )}
                </div>
            </div>

            {/* Additional content row (e.g., filters, tabs) */}
            {children && (
                <div className="mt-3 pt-3 border-t border-white/5">
                    {children}
                </div>
            )}
        </div>
    );
}
