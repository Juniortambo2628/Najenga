/**
 * What a list shows when it has nothing to show.
 *
 * When a search or filters narrowed the list to nothing, pass `search` and/or
 * `filtered` (and `noun`): the state then says what matched nothing ("No
 * expenses match “cement”") and offers `onClear` instead of the page's usual
 * "create your first…" title, message and action.
 */
export default function EmptyState({ icon = 'fa-folder', title, message, action, compact = false, search = '', filtered = false, noun = 'item', onClear }) {
    const query = search.trim();
    if (query || filtered) {
        icon = 'fa-magnifying-glass';
        title = query ? `No ${noun}s match “${query}”` : `No ${noun}s match these filters`;
        message = query && filtered ? 'Try a different search, or clear the search and filters.' : query ? 'Try a different search.' : 'Try different filters.';
        action = onClear ? { label: query && filtered ? 'Clear search and filters' : query ? 'Clear search' : 'Clear filters', onClick: onClear } : null;
    }

    return (
        <div className={`rounded-2xl border text-center ${compact ? 'border-transparent bg-transparent px-3 py-8' : 'border-white/10 bg-black/50 p-12'}`}>
            <div className={`inline-flex items-center justify-center rounded-full bg-white/5 ${compact ? 'mb-3 h-12 w-12' : 'mb-4 h-16 w-16'}`}>
                <i aria-hidden="true" className={`fas ${icon} ${compact ? 'text-xl' : 'text-2xl'} text-gray-400`} />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-white">{title}</h3>
            <p className="mx-auto mb-6 max-w-md text-sm text-gray-400">{message}</p>
            {action && (
                <button
                    type="button"
                    onClick={action.onClick}
                    className="rounded-xl bg-[#8B0000] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#a50000]"
                >
                    {action.label}
                </button>
            )}
        </div>
    );
}
