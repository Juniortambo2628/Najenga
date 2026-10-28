import { format, formatDistanceToNow, isToday, isYesterday } from 'date-fns';

const EVENT_WORDS = { created: 'added', updated: 'edited', deleted: 'deleted', restored: 'restored' };
const TYPE_WORDS = { project: 'project', expense: 'expense', receipt: 'receipt', document: 'document', photo: 'photo', milestone: 'milestone' };

const dayLabel = (date) => (isToday(date) ? 'Today' : isYesterday(date) ? 'Yesterday' : format(date, 'EEEE, d MMM yyyy'));

/** "expense_date" -> "Expense date". */
const fieldLabel = (field) => field.replace(/_id$/, '').replace(/_/g, ' ').replace(/^\w/, (c) => c.toUpperCase());

/** Numbers read as numbers ("15300.00" -> "15,300"); everything else as stored. */
const shown = (value) => {
    if (value === null || value === undefined || value === '') return '—';
    return /^-?\d+(\.\d+)?$/.test(String(value)) ? Number(value).toLocaleString() : String(value);
};

function Change({ change }) {
    return (
        <li className="break-words text-xs text-gray-400">
            <span className="font-medium text-gray-300">{fieldLabel(change.field)}: </span>
            {change.before !== null && (
                <>
                    <del className="text-gray-500 decoration-rose-400/60">{shown(change.before)}</del>
                    {' → '}
                </>
            )}
            <span className="text-gray-100">{shown(change.after)}</span>
        </li>
    );
}

const restoreButton =
    'inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-2 py-1 text-xs text-gray-300 transition hover:bg-white/5 hover:text-white disabled:opacity-50';

function Version({ version, showType, canRestore, onRestore, restoring }) {
    const who = version.user?.name || 'Someone';
    const when = new Date(version.at);
    return (
        <li className="flex gap-3 py-3">
            <span aria-hidden="true" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[rgb(139,0,0)] to-[rgb(220,20,60)] text-[11px] font-bold text-white">
                {who.charAt(0).toUpperCase()}
            </span>
            <div className="min-w-0 flex-1 space-y-1">
                <p className="text-sm leading-snug text-gray-300">
                    <span className="font-medium text-white">{who}</span> {EVENT_WORDS[version.event] || version.event}{' '}
                    {showType && <span>{TYPE_WORDS[version.type] || version.type} </span>}
                    <span className="font-medium text-white">{version.label || `#${version.record_id}`}</span>
                </p>
                <p className="text-[11px] text-gray-500">
                    <time dateTime={version.at} title={format(when, 'PPpp')}>{formatDistanceToNow(when, { addSuffix: true })}</time>
                </p>
                {version.changes?.length > 0 && (
                    <ul className="space-y-0.5 pt-0.5">
                        {version.changes.slice(0, 5).map((change) => <Change key={change.field} change={change} />)}
                        {version.changes.length > 5 && <li className="text-[11px] text-gray-500">+{version.changes.length - 5} more fields</li>}
                    </ul>
                )}
                {canRestore && (version.restorable || version.undoable) && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                        {version.undoable && (
                            <button type="button" onClick={() => onRestore(version, true)} disabled={restoring} className={restoreButton}>
                                <i aria-hidden="true" className="fas fa-rotate-left" />
                                Undo this change
                            </button>
                        )}
                        {version.restorable && (
                            <button type="button" onClick={() => onRestore(version, false)} disabled={restoring} className={restoreButton}>
                                <i aria-hidden="true" className={`fas ${version.event === 'deleted' ? 'fa-trash-arrow-up' : 'fa-clock-rotate-left'}`} />
                                {version.event === 'deleted' ? 'Restore deleted item' : 'Restore this version'}
                            </button>
                        )}
                    </div>
                )}
            </div>
        </li>
    );
}

/**
 * Versions grouped by day: who changed which record, field by field. With
 * `onRestore(version, undo)`, the versions `canRestore(version)` allows get
 * Undo / Restore buttons.
 */
export default function VersionList({ versions, showType = true, canRestore = () => false, onRestore, restoring = false }) {
    let lastDay = null;
    return (
        <ul>
            {versions.map((version) => {
                const day = dayLabel(new Date(version.at));
                const header = day !== lastDay ? day : null;
                lastDay = day;
                return (
                    <li key={version.id}>
                        {header && (
                            <h3 className="sticky top-0 z-10 bg-surface-overlay/95 pb-1 pt-3 text-[11px] font-bold uppercase tracking-wider text-gray-500 backdrop-blur">
                                {header}
                            </h3>
                        )}
                        <ul className="divide-y divide-white/5">
                            <Version
                                version={version}
                                showType={showType}
                                canRestore={!!onRestore && canRestore(version)}
                                onRestore={onRestore}
                                restoring={restoring}
                            />
                        </ul>
                    </li>
                );
            })}
        </ul>
    );
}
