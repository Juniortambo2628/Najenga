import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';

/** How many filters are set to something other than their default (the first option, or `defaultValue`). */
export function countActiveFilters(filters = []) {
    return filters.filter((f) => f.value !== (f.defaultValue ?? f.options?.[0]?.value)).length;
}

const actionClass = {
    primary: 'bg-gradient-to-r from-[rgb(139,0,0)] to-[rgb(220,20,60)] text-white hover:shadow-lg hover:shadow-[rgb(139,0,0)]/25',
    secondary: 'border border-white/10 bg-white/5 text-gray-200 hover:bg-white/10 hover:text-white',
    danger: 'border border-red-500/30 bg-red-500/10 text-red-300 hover:bg-red-500/20 hover:text-red-200',
};

/** One toolbar action: a button, or an Inertia link when it has `href`. */
function Action({ action, compact }) {
    const className = `inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed ${actionClass[action.variant || 'secondary']}`;
    const content = (
        <>
            {action.icon && <i aria-hidden="true" className={`fas ${action.icon}`}></i>}
            <span className={compact ? 'sr-only' : 'hidden sm:inline'}>{action.label}</span>
        </>
    );
    return action.href ? (
        <Link href={action.href} className={className} title={action.label} aria-label={action.label}>{content}</Link>
    ) : (
        <button type="button" onClick={action.onClick} disabled={action.disabled} className={className} title={action.label} aria-label={action.label}>
            {content}
        </button>
    );
}

/** Closes `open` on a click outside `ref` or on Escape. */
function useDismiss(ref, open, close) {
    useEffect(() => {
        if (!open) return undefined;
        const onPointer = (e) => ref.current && !ref.current.contains(e.target) && close();
        const onKey = (e) => e.key === 'Escape' && close();
        document.addEventListener('mousedown', onPointer);
        document.addEventListener('keydown', onKey);
        return () => {
            document.removeEventListener('mousedown', onPointer);
            document.removeEventListener('keydown', onKey);
        };
    }, [ref, open, close]);
}

function FiltersMenu({ filters }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);
    useDismiss(ref, open, () => setOpen(false));
    const active = countActiveFilters(filters);

    return (
        <div className="relative" ref={ref}>
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                aria-expanded={open}
                className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition border ${active ? 'border-[#DC143C]/40 bg-[#8B0000]/15 text-white' : 'border-white/10 bg-white/5 text-gray-200 hover:bg-white/10'}`}
            >
                <i aria-hidden="true" className="fas fa-sliders-h"></i>
                <span className="hidden sm:inline">Filters</span>
                {active > 0 && (
                    <span className="min-w-[1.25rem] h-5 px-1 rounded-full bg-[#DC143C] text-[11px] leading-5 text-white text-center">{active}</span>
                )}
            </button>
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.97 }}
                        transition={{ duration: 0.15 }}
                        className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-72 max-w-[calc(100vw-2rem)] rounded-2xl border border-white/[0.08] bg-surface-overlay p-4 shadow-2xl space-y-3"
                    >
                        {filters.map((filter) => (
                            <label key={filter.name} className="block">
                                <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-400">{filter.title || filter.label}</span>
                                <select
                                    value={filter.value}
                                    onChange={(e) => filter.onChange(e.target.value)}
                                    className="w-full py-2"
                                >
                                    {filter.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                                </select>
                            </label>
                        ))}
                        {active > 0 && (
                            <button
                                type="button"
                                onClick={() => filters.forEach((f) => f.onChange(f.defaultValue ?? f.options?.[0]?.value))}
                                className="text-xs font-semibold text-rose-300 hover:text-white transition"
                            >
                                Reset filters
                            </button>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function MoreMenu({ actions }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);
    useDismiss(ref, open, () => setOpen(false));
    return (
        <div className="relative" ref={ref}>
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                aria-expanded={open}
                aria-label="More actions"
                className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold border border-white/10 bg-white/5 text-gray-200 hover:bg-white/10 transition"
            >
                <i aria-hidden="true" className="fas fa-ellipsis-h"></i>
                <span className="hidden sm:inline">More</span>
            </button>
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.97 }}
                        transition={{ duration: 0.15 }}
                        className="absolute bottom-full right-0 mb-3 min-w-[12rem] rounded-xl border border-white/[0.08] bg-surface-overlay py-2 shadow-2xl"
                    >
                        {actions.map((action) => {
                            const className = `flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition hover:bg-white/[0.06] ${action.variant === 'danger' ? 'text-red-300' : 'text-gray-200'}`;
                            const content = (
                                <>
                                    {action.icon && <i aria-hidden="true" className={`fas ${action.icon} w-4 text-center`}></i>}
                                    {action.label}
                                </>
                            );
                            return action.href ? (
                                <Link key={action.id} href={action.href} className={className} onClick={() => setOpen(false)}>{content}</Link>
                            ) : (
                                <button key={action.id} type="button" disabled={action.disabled} className={className} onClick={() => { setOpen(false); action.onClick?.(); }}>
                                    {content}
                                </button>
                            );
                        })}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

const Divider = () => <div aria-hidden="true" className="hidden sm:block w-px h-6 bg-white/10 mx-0.5" />;

/**
 * The one toolbar every dashboard page shares, floating at the bottom centre
 * of the content area (centred beside the sidebar via --sidebar-w, which
 * AuthenticatedLayout sets). Pages describe what goes in it:
 *
 * @param {object} [search]    { value, onChange, placeholder } — the page's list filter ("/" focuses it)
 * @param {object} [project]   { projects, currentId, onChange } — the project the page shows
 * @param {Array}  [filters]   [{ name, label, title?, value, onChange, options: [{ value, label }], defaultValue? }]
 *                             — shown in a Filters panel with a count of active ones (sort orders too)
 * @param {object} [view]      { modes: [{ value, icon, label? }], current, onChange }
 * @param {Array}  [actions]   [{ id, label, icon, onClick | href, variant: primary|secondary|danger, disabled? }]
 *                             — the first two (four without search/filters) show; the rest go under More
 * @param {object} [selection] { count, total, onSelectAll, onDeselectAll, actions } — while count > 0
 *                             the toolbar shows the selection and its actions instead
 * @param {ReactNode} [children] Custom controls, before the actions
 *
 * It can be tucked away; while hidden, a dot marks a list that is still
 * searched or filtered.
 */
export default function FloatingToolbar({ search, project, filters = [], view, actions = [], selection, children }) {
    const [visible, setVisible] = useState(true);
    const searchRef = useRef(null);
    const selecting = selection && selection.count > 0;

    // "/" focuses the page's search, unless typing somewhere already.
    useEffect(() => {
        if (!search) return undefined;
        const onKey = (e) => {
            if (e.key !== '/' || e.metaKey || e.ctrlKey || e.altKey) return;
            const tag = e.target?.tagName;
            if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || e.target?.isContentEditable) return;
            e.preventDefault();
            setVisible(true);
            requestAnimationFrame(() => searchRef.current?.focus());
        };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [search]);

    const hasLeading = !!search || filters.length > 0 || !!view || !!project;
    const max = hasLeading ? 2 : 4;
    const primary = actions.slice(0, max);
    const overflow = actions.slice(max);
    const narrowed = !!search?.value || countActiveFilters(filters) > 0 || !!project?.currentId;

    // Fixed to the content area: centred over it beside the sidebar on large screens.
    const position = 'fixed z-40 bottom-[max(0.75rem,env(safe-area-inset-bottom))] sm:bottom-6 left-1/2 lg:left-[calc(50%_+_var(--sidebar-w,16rem)_/_2)] transition-[left] duration-300';
    // Centred with framer-motion's x, not a translate class: motion writes an
    // inline transform that would wipe out Tailwind's.
    const centre = { x: '-50%' };

    if (typeof document === 'undefined') return null;
    if (!hasLeading && !actions.length && !selection && !children) return null;

    return createPortal(
        <AnimatePresence initial={false}>
            {visible ? (
                <motion.div
                    key="toolbar"
                    role="toolbar"
                    aria-label="Page tools"
                    initial={{ ...centre, opacity: 0, y: 24 }}
                    animate={{ ...centre, opacity: 1, y: 0 }}
                    exit={{ ...centre, opacity: 0, y: 16 }}
                    transition={{ type: 'spring', stiffness: 320, damping: 28 }}
                    className={`${position} w-max max-w-[calc(100vw-1rem)] lg:max-w-[calc(100vw_-_var(--sidebar-w,16rem)_-_2rem)]`}
                >
                    <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 rounded-2xl border border-white/[0.08] bg-surface-sidebar/90 p-1.5 sm:p-2 shadow-[0_16px_48px_rgba(0,0,0,0.55)] backdrop-blur-xl">
                        {selecting ? (
                            <>
                                <span className="px-2 text-sm font-semibold text-white whitespace-nowrap">{selection.count} selected</span>
                                {selection.onSelectAll && (
                                    <button
                                        type="button"
                                        onClick={selection.count === selection.total ? selection.onDeselectAll : selection.onSelectAll}
                                        className="rounded-xl px-3 py-2 text-sm font-semibold text-gray-300 hover:bg-white/[0.06] hover:text-white transition"
                                    >
                                        {selection.count === selection.total ? 'Deselect all' : `Select all ${selection.total}`}
                                    </button>
                                )}
                                <Divider />
                                {(selection.actions || []).map((action) => <Action key={action.id} action={action} />)}
                                <button
                                    type="button"
                                    onClick={selection.onDeselectAll}
                                    aria-label="Clear selection"
                                    title="Clear selection"
                                    className="rounded-xl p-2 text-gray-400 hover:bg-white/[0.06] hover:text-white transition"
                                >
                                    <i aria-hidden="true" className="fas fa-times"></i>
                                </button>
                            </>
                        ) : (
                            <>
                                {project && project.projects?.length > 0 && (
                                    <label className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 pl-3 text-sm">
                                        <i aria-hidden="true" className="fas fa-project-diagram text-[#DC143C] text-xs"></i>
                                        <span className="sr-only">Project</span>
                                        <select
                                            value={project.currentId || ''}
                                            onChange={(e) => project.onChange(e.target.value || null)}
                                            className="max-w-[11rem] border-0 bg-transparent py-2 pl-0 pr-8 text-sm focus:ring-0"
                                        >
                                            <option value="">All projects</option>
                                            {project.projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                                        </select>
                                    </label>
                                )}
                                {search && (
                                    <div className="relative">
                                        <i aria-hidden="true" className="fas fa-search pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400"></i>
                                        <input
                                            ref={searchRef}
                                            type="search"
                                            value={search.value}
                                            onChange={(e) => search.onChange(e.target.value)}
                                            placeholder={search.placeholder || 'Search…'}
                                            aria-label={search.placeholder || 'Search this page'}
                                            className="w-40 sm:w-56 sm:focus:w-72 rounded-xl border border-white/10 bg-white/5 py-2 pl-9 pr-9 text-sm transition-all"
                                        />
                                        <kbd className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 hidden sm:block rounded border border-white/15 px-1.5 text-[10px] text-gray-400">/</kbd>
                                    </div>
                                )}
                                {filters.length > 0 && <FiltersMenu filters={filters} />}
                                {view && view.modes?.length > 1 && (
                                    <div className="flex gap-1 rounded-xl border border-white/10 bg-black/30 p-1">
                                        {view.modes.map((mode) => (
                                            <button
                                                key={mode.value}
                                                type="button"
                                                onClick={() => view.onChange(mode.value)}
                                                aria-label={mode.label || `${mode.value} view`}
                                                aria-pressed={view.current === mode.value}
                                                title={mode.label || `${mode.value} view`}
                                                className={`rounded-lg px-2.5 py-1 text-sm transition-colors ${view.current === mode.value ? 'bg-[#8B0000] text-white' : 'text-gray-400 hover:text-white'}`}
                                            >
                                                <i aria-hidden="true" className={`fas ${mode.icon}`}></i>
                                            </button>
                                        ))}
                                    </div>
                                )}
                                {hasLeading && (children || actions.length > 0) && <Divider />}
                                {children}
                                {primary.map((action) => <Action key={action.id} action={action} />)}
                                {overflow.length > 0 && <MoreMenu actions={overflow} />}
                            </>
                        )}
                        <button
                            type="button"
                            onClick={() => setVisible(false)}
                            aria-label="Hide toolbar"
                            title="Hide toolbar"
                            className="rounded-xl p-2 text-gray-500 hover:bg-white/[0.06] hover:text-white transition"
                        >
                            <i aria-hidden="true" className="fas fa-chevron-down"></i>
                        </button>
                    </div>
                </motion.div>
            ) : (
                <motion.button
                    key="toolbar-show"
                    type="button"
                    initial={{ ...centre, opacity: 0, y: 16 }}
                    animate={{ ...centre, opacity: 1, y: 0 }}
                    exit={{ ...centre, opacity: 0, y: 16 }}
                    onClick={() => setVisible(true)}
                    aria-label={narrowed || selecting ? 'Show toolbar (search, filters or selection active)' : 'Show toolbar'}
                    title={narrowed || selecting ? 'Show toolbar (search, filters or selection active)' : 'Show toolbar'}
                    className={`${position} rounded-full border border-white/10 bg-surface-sidebar/90 p-3 text-gray-200 shadow-xl backdrop-blur-xl hover:text-white`}
                >
                    <i aria-hidden="true" className="fas fa-chevron-up"></i>
                    {(narrowed || selecting) && <span className="absolute right-1 top-1 h-2.5 w-2.5 rounded-full bg-[#DC143C]" />}
                </motion.button>
            )}
        </AnimatePresence>,
        document.body,
    );
}
