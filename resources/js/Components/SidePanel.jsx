import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

/**
 * The shared page side panel of DashboardPage. Pages pass a `panel` config
 * instead of building their own side columns, so every page has the same
 * shape: content on the left, panel on the right.
 *
 *   panel = {
 *     title, icon? (Font Awesome class, e.g. 'fa-layer-group'), subtitle?,
 *     items?: [{ id, label, description?, icon?, badge? (number), count? (number) }],
 *     activeId?, onChange?(id)   — a section switcher; the page renders the active section
 *     content?: ReactNode        — tools or a list under the switcher
 *     footer?: ReactNode         — help text at the bottom (desktop only)
 *     id?: string                — remembers collapsed/expanded per panel
 *     defaultCollapsed?: bool, sheetLabel?: string (mobile button label)
 *   }
 *
 * Desktop (lg+): a card in a right-hand column that never makes the page
 * longer: its title stays put and only the items/content scroll. It collapses
 * to a slim icon rail, remembered per panel.
 * Phones: a bar under the navbar: section chips (one tap to switch), or a
 * button that opens the content as a bottom sheet.
 */

const storageKey = (panel) => `dashboard.sidePanel.${panel.id || panel.title}`;

function readCollapsed(panel) {
    try {
        const saved = localStorage.getItem(storageKey(panel));
        if (saved) return saved === 'collapsed';
    } catch {
        /* storage unavailable */
    }
    return !!panel.defaultCollapsed;
}

function Badge({ item }) {
    if (item.badge > 0) {
        return (
            <span className="ml-auto flex h-5 min-w-[1.25rem] shrink-0 items-center justify-center rounded-full bg-rose-500/15 px-1.5 text-[11px] font-semibold text-rose-200">
                {item.badge > 99 ? '99+' : item.badge}
            </span>
        );
    }
    if (item.count != null) {
        return <span className="ml-auto shrink-0 text-xs tabular-nums text-white/40">{item.count}</span>;
    }
    return null;
}

function PanelHeader({ panel, children }) {
    return (
        <div className="flex items-start gap-2.5">
            {panel.icon && <i aria-hidden="true" className={`fas ${panel.icon} mt-1 shrink-0 text-rose-300`} />}
            <div className="min-w-0 flex-1">
                <h2 className="text-base font-semibold leading-tight text-white">{panel.title}</h2>
                {panel.subtitle && <p className="mt-0.5 text-xs text-white/50">{panel.subtitle}</p>}
            </div>
            {children}
        </div>
    );
}

/** The section switcher. */
export function SidePanelNav({ panel, onPicked }) {
    const { items = [], activeId, onChange } = panel;
    if (!items.length) return null;

    return (
        <nav aria-label={panel.title}>
            <ul className="space-y-0.5">
                {items.map((item) => {
                    const active = item.id === activeId;
                    return (
                        <li key={item.id}>
                            <button
                                type="button"
                                aria-current={active ? 'true' : undefined}
                                onClick={() => {
                                    onChange?.(item.id);
                                    onPicked?.(item.id);
                                }}
                                className={`flex w-full items-start gap-2.5 rounded-xl px-2.5 py-2 text-left text-sm transition ${
                                    active ? 'bg-rose-500/10 text-white' : 'text-white/70 hover:bg-white/5 hover:text-white'
                                }`}
                            >
                                {item.icon && <i aria-hidden="true" className={`fas ${item.icon} mt-0.5 w-4 shrink-0 text-center ${active ? 'text-rose-300' : 'text-white/40'}`} />}
                                <span className="min-w-0 flex-1">
                                    <span className="block truncate font-medium">{item.label}</span>
                                    {item.description && <span className="block truncate text-xs text-white/40">{item.description}</span>}
                                </span>
                                <Badge item={item} />
                            </button>
                        </li>
                    );
                })}
            </ul>
        </nav>
    );
}

/** Desktop, collapsed: a slim rail with the switcher's icons. */
function SidePanelRail({ panel, onExpand }) {
    return (
        <aside
            aria-label={panel.title}
            data-side-panel="collapsed"
            className="hidden lg:flex w-12 shrink-0 flex-col items-center gap-1.5 self-start overflow-y-auto rounded-2xl border border-white/[0.08] bg-surface-panel py-2 lg:sticky lg:top-20 lg:max-h-[calc(100dvh-6.5rem)]"
        >
            <button
                type="button"
                onClick={onExpand}
                aria-label={`Show ${panel.title}`}
                title={`Show ${panel.title}`}
                className="rounded-lg p-2 text-white/50 hover:bg-white/5 hover:text-white"
            >
                <i aria-hidden="true" className="fas fa-angles-left" />
            </button>
            {panel.icon && !panel.items?.length && <i aria-hidden="true" className={`fas ${panel.icon} my-1 text-rose-300`} />}
            {panel.items?.map((item) => {
                const active = item.id === panel.activeId;
                return (
                    <button
                        key={item.id}
                        type="button"
                        onClick={() => panel.onChange?.(item.id)}
                        aria-label={item.label}
                        title={item.label}
                        aria-current={active ? 'true' : undefined}
                        className={`relative rounded-lg p-2 text-xs ${active ? 'bg-rose-500/10 text-rose-200' : 'text-white/50 hover:bg-white/5'}`}
                    >
                        {item.icon ? <i aria-hidden="true" className={`fas ${item.icon}`} /> : item.label.slice(0, 2)}
                        {item.badge > 0 && <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-rose-400" />}
                    </button>
                );
            })}
        </aside>
    );
}

/** Desktop: the right-hand column (or its collapsed rail). */
export function SidePanelAside({ panel }) {
    const [collapsed, setCollapsed] = useState(() => readCollapsed(panel));
    const toggle = (next) => {
        setCollapsed(next);
        try {
            localStorage.setItem(storageKey(panel), next ? 'collapsed' : 'expanded');
        } catch {
            /* storage unavailable */
        }
    };

    if (collapsed) return <SidePanelRail panel={panel} onExpand={() => toggle(false)} />;
    const hasItems = panel.items?.length > 0;

    return (
        <aside
            aria-label={panel.title}
            data-side-panel="expanded"
            className="hidden lg:flex w-80 shrink-0 flex-col self-start overflow-hidden rounded-2xl border border-white/[0.08] bg-surface-panel lg:sticky lg:top-20 lg:max-h-[calc(100dvh-6.5rem)] fit:max-h-full fit:self-stretch"
        >
            <div className="shrink-0 border-b border-white/[0.08] p-4 pb-3">
                <PanelHeader panel={panel}>
                    <button
                        type="button"
                        onClick={() => toggle(true)}
                        aria-label={`Hide ${panel.title}`}
                        title="Collapse panel"
                        className="-m-1 rounded-lg p-1.5 text-white/40 hover:bg-white/5 hover:text-white"
                    >
                        <i aria-hidden="true" className="fas fa-angles-right" />
                    </button>
                </PanelHeader>
            </div>
            {(hasItems || panel.content) && (
                <div className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain p-3">
                    {hasItems && <SidePanelNav panel={panel} />}
                    {panel.content && <div className="px-1">{panel.content}</div>}
                </div>
            )}
            {panel.footer && <div className="shrink-0 border-t border-white/[0.08] p-4 pt-3 text-sm text-white/50">{panel.footer}</div>}
        </aside>
    );
}

function ChipRow({ panel, onPicked }) {
    const rowRef = useRef(null);
    const { items = [], activeId, onChange } = panel;

    useEffect(() => {
        const el = rowRef.current?.querySelector('[aria-current="true"]');
        el?.scrollIntoView?.({ block: 'nearest', inline: 'center', behavior: 'smooth' });
    }, [activeId]);

    return (
        <div ref={rowRef} role="navigation" aria-label={panel.title} className="-mx-4 flex snap-x gap-2 overflow-x-auto px-4 py-0.5">
            {items.map((item) => {
                const active = item.id === activeId;
                return (
                    <button
                        key={item.id}
                        type="button"
                        aria-current={active ? 'true' : undefined}
                        onClick={() => {
                            onChange?.(item.id);
                            onPicked?.(item.id);
                        }}
                        className={`inline-flex shrink-0 snap-start items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium transition ${
                            active ? 'border-rose-400/40 bg-rose-500/15 text-white' : 'border-white/10 bg-white/5 text-white/70 hover:text-white'
                        }`}
                    >
                        {item.icon && <i aria-hidden="true" className={`fas ${item.icon} text-xs`} />}
                        <span className="max-w-[14rem] truncate">{item.label}</span>
                        {item.count != null && <span className="tabular-nums opacity-60">{item.count}</span>}
                        {item.badge > 0 && <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-rose-400" />}
                    </button>
                );
            })}
        </div>
    );
}

function BottomSheet({ panel, onClose }) {
    useEffect(() => {
        const onKey = (e) => e.key === 'Escape' && onClose();
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [onClose]);

    return (
        <motion.div
            className="fixed inset-0 z-[60] flex items-end justify-center bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
        >
            <motion.div
                role="dialog"
                aria-modal="true"
                aria-label={panel.title}
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 32, stiffness: 320 }}
                onClick={(e) => e.stopPropagation()}
                className="flex max-h-[78dvh] w-full flex-col rounded-t-3xl border-t border-white/10 bg-surface-overlay pb-[env(safe-area-inset-bottom)] shadow-2xl"
            >
                <div className="shrink-0 space-y-3 border-b border-white/[0.08] px-4 pb-3 pt-2">
                    <div aria-hidden="true" className="mx-auto h-1.5 w-10 rounded-full bg-white/15" />
                    <PanelHeader panel={panel}>
                        <button type="button" onClick={onClose} aria-label="Close panel" className="-m-1 rounded-lg p-1.5 text-white/60 hover:bg-white/5">
                            <i aria-hidden="true" className="fas fa-xmark" />
                        </button>
                    </PanelHeader>
                    {panel.items?.length > 0 && <ChipRow panel={panel} />}
                </div>
                <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4">{panel.content}</div>
            </motion.div>
        </motion.div>
    );
}

/** Phones and tablets: the bar under the navbar (chips, or a button that opens the sheet). */
export function SidePanelMobileBar({ panel }) {
    const [open, setOpen] = useState(false);
    const hasContent = !!panel.content;
    const hasItems = panel.items?.length > 0;
    if (!hasContent && !hasItems) return null;

    return (
        <div className="sticky top-16 z-20 -mx-4 mb-4 border-b border-white/[0.06] bg-surface/95 px-4 py-2 backdrop-blur lg:hidden">
            {hasItems && <ChipRow panel={panel} onPicked={hasContent ? () => setOpen(true) : undefined} />}
            {hasContent && !hasItems && (
                <button
                    type="button"
                    onClick={() => setOpen(true)}
                    aria-haspopup="dialog"
                    className="flex w-full items-center justify-between gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-white"
                >
                    <span className="flex min-w-0 items-center gap-2">
                        {panel.icon && <i aria-hidden="true" className={`fas ${panel.icon} text-rose-300`} />}
                        <span className="truncate">{panel.sheetLabel || panel.title}</span>
                    </span>
                    <i aria-hidden="true" className="fas fa-chevron-up text-xs text-white/50" />
                </button>
            )}
            <AnimatePresence>{open && hasContent && <BottomSheet panel={panel} onClose={() => setOpen(false)} />}</AnimatePresence>
        </div>
    );
}
