import { useCallback, useEffect, useState } from 'react';
import { router, usePage } from '@inertiajs/react';
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import axios from 'axios';
import useAction from '@/Hooks/useAction';
import useActiveProjectId from '@/Hooks/useActiveProjectId';
import useVisibleActions from '@/Hooks/useVisibleActions';
import VersionList from '@/Components/VersionList';

/** The record type each page lists, for its "This page" history. */
export const PAGE_TYPES = {
    Expenses: { type: 'expense', label: 'Expenses' },
    Photos: { type: 'photo', label: 'Photos' },
    Documents: { type: 'document', label: 'Documents' },
    Timeline: { type: 'milestone', label: 'Timeline' },
    'Receipts/Index': { type: 'receipt', label: 'Receipts' },
    Overview: { type: 'project', label: 'Projects' },
};

/**
 * Version history, opened from the navbar: every change to the records on
 * the current page (or all of them), within the project picked in the
 * navbar, with who made it and field-level changes. Owners, managers and
 * editors can restore a version; the page then reloads its data.
 */
export default function HistoryDrawer({ show, onClose }) {
    const { component } = usePage();
    const page = PAGE_TYPES[component] ?? null;
    const [projectId] = useActiveProjectId();
    const { canEditRecord } = useVisibleActions();
    const [scope, setScope] = useState(page ? 'page' : 'all');
    const [state, setState] = useState({ status: 'idle', versions: [], nextPage: null });

    const type = scope === 'page' ? page?.type : null;

    const load = useCallback(
        async (pageNumber = 1) => {
            setState((s) => ({ ...s, status: pageNumber === 1 ? 'loading' : 'more' }));
            try {
                const { data } = await axios.get(route('history.index'), {
                    params: { type: type || undefined, project_id: projectId || undefined, page: pageNumber },
                });
                setState((s) => ({
                    status: 'ready',
                    versions: pageNumber === 1 ? data.data : [...s.versions, ...data.data],
                    nextPage: data.current_page < data.last_page ? data.current_page + 1 : null,
                }));
            } catch {
                setState((s) => ({ ...s, status: 'error' }));
            }
        },
        [type, projectId],
    );

    useEffect(() => {
        if (show) load(1);
    }, [show, load]);

    useEffect(() => {
        if (show) setScope(page ? 'page' : 'all');
        // Each opening starts on the current page's history.
    }, [show]);

    const restore = useAction((version, undo) => axios.post(route('history.restore', version.id), undo ? { undo: true } : {}), {
        key: () => 'restore',
        confirm: (version, undo) => ({
            title: undo ? 'Undo this change?' : version.event === 'deleted' ? 'Restore this deleted item?' : 'Restore this version?',
            message: `"${version.label || `#${version.record_id}`}" goes back to how it was ${undo ? 'before this change' : 'then'}. The current version stays in the history, so this can be undone too.`,
            confirmLabel: undo ? 'Undo' : 'Restore',
        }),
        success: (res) => res.data.message,
        error: 'Could not restore this version',
        onSuccess: () => {
            load(1);
            router.reload();
        },
    });

    return (
        <Dialog open={show} onClose={onClose} className="relative z-50">
            <div className="fixed inset-0 bg-black/50" aria-hidden="true" />
            <div className="fixed inset-0 flex justify-end">
                <DialogPanel className="flex h-full w-full max-w-md flex-col border-l border-white/10 bg-surface-overlay shadow-2xl">
                    <div className="shrink-0 space-y-3 border-b border-white/10 px-4 py-3">
                        <div className="flex items-center gap-2">
                            <i aria-hidden="true" className="fas fa-clock-rotate-left text-[#DC143C]" />
                            <DialogTitle className="flex-1 text-lg font-semibold text-white">Version history</DialogTitle>
                            <button type="button" onClick={onClose} aria-label="Close version history" className="rounded-lg p-1.5 text-gray-400 hover:bg-white/10 hover:text-white">
                                <i aria-hidden="true" className="fas fa-xmark" />
                            </button>
                        </div>
                        {page && (
                            <div role="radiogroup" aria-label="Show changes for" className="grid grid-cols-2 gap-1 rounded-xl border border-white/10 bg-white/5 p-1 text-xs">
                                {[
                                    { value: 'page', label: page.label },
                                    { value: 'all', label: 'All pages' },
                                ].map((option) => (
                                    <button
                                        key={option.value}
                                        type="button"
                                        role="radio"
                                        aria-checked={scope === option.value}
                                        onClick={() => setScope(option.value)}
                                        className={`rounded-lg px-3 py-1.5 font-medium transition ${scope === option.value ? 'bg-gradient-to-r from-[rgb(139,0,0)] to-[rgb(220,20,60)] text-white' : 'text-gray-400 hover:text-white'}`}
                                    >
                                        {option.label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="min-h-0 flex-1 overflow-y-auto px-4">
                        {state.status === 'loading' || state.status === 'idle' ? (
                            <p className="py-10 text-center text-sm text-gray-500">Loading history…</p>
                        ) : state.status === 'error' && state.versions.length === 0 ? (
                            <div className="space-y-2 py-10 text-center">
                                <p className="text-sm text-gray-400">Couldn&apos;t load the history.</p>
                                <button type="button" onClick={() => load(1)} className="text-sm text-[#DC143C] hover:text-white">Try again</button>
                            </div>
                        ) : state.versions.length === 0 ? (
                            <div className="space-y-1 py-12 text-center">
                                <i aria-hidden="true" className="fas fa-clock-rotate-left text-3xl text-white/10" />
                                <p className="text-sm text-gray-400">No changes recorded {scope === 'page' ? 'on this page ' : ''}yet.</p>
                                <p className="text-xs text-gray-500">Every save from now on can be restored here.</p>
                            </div>
                        ) : (
                            <VersionList
                                versions={state.versions}
                                showType={scope === 'all'}
                                canRestore={canEditRecord}
                                onRestore={restore.run}
                                restoring={restore.pending}
                            />
                        )}
                        {state.nextPage && (
                            <div className="flex justify-center py-4">
                                <button
                                    type="button"
                                    onClick={() => load(state.nextPage)}
                                    disabled={state.status === 'more'}
                                    className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-gray-300 hover:bg-white/5 hover:text-white disabled:opacity-50"
                                >
                                    {state.status === 'more' ? 'Loading…' : 'Load older changes'}
                                </button>
                            </div>
                        )}
                    </div>
                </DialogPanel>
            </div>
        </Dialog>
    );
}
