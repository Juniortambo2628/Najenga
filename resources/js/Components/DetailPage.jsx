import { Head } from '@inertiajs/react';
import DashboardPage from '@/Components/DashboardPage';
import ListPanel from '@/Components/ListPanel';
import SummaryCards from '@/Components/SummaryCards';
import DetailRow from '@/Components/DetailRow';
import { rootBreadcrumbs } from '@/Config/navigation';

/** Label/value rows; falsy entries are skipped, so rows can be conditional. */
export function DetailRows({ rows, className = 'grid grid-cols-1 gap-4' }) {
    return (
        <div className={className}>
            {rows.filter(Boolean).map((row) => (
                <DetailRow key={row.label} label={row.label} value={row.value} mono={row.mono} />
            ))}
        </div>
    );
}

/** A heading and free text (a description, notes), kept as typed. */
export function DetailText({ title, children }) {
    if (!children) return null;
    return (
        <div>
            <h3 className="text-[11px] font-bold text-gray-500">{title}</h3>
            <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-gray-300">{children}</p>
        </div>
    );
}

/**
 * The one layout for a single record (an expense, receipt, photo, document,
 * milestone or person), on DashboardPage like the list pages:
 *
 *   hero         title, subtitle, breadcrumbs back to the list, badges
 *   summary      the record's key figures as summary cards
 *   main         the record itself (a file, a receipt) in a panel that fills the screen
 *   side panel   its details: label/value rows, then any extra content
 *   toolbar      what you can do with it (Edit, Download, …)
 *
 * Records with nothing to show in the main panel (a milestone, a person) put
 * their details there instead, and keep the default side panel.
 *
 * @param {string}    title
 * @param {string}    [subtitle]
 * @param {object}    parent           - The list it belongs to: { label, href }
 * @param {ReactNode} [badges]         - Next to the title (status, featured)
 * @param {Array}     [summary]        - SummaryCards cards
 * @param {object}    [main]           - { title, icon, actions? (buttons beside the title) } over the main panel
 * @param {object}    [details]        - { title, icon, subtitle, rows: [{ label, value, mono? }], content? }
 * @param {Array}     [actions]        - FloatingToolbar actions
 * @param {ReactNode} [children]       - The main panel's content
 */
export default function DetailPage({ title, subtitle, parent, badges = null, summary = [], main = {}, details = {}, actions = [], children }) {
    const rows = details.rows ?? [];
    const hasMain = children != null && children !== false;

    const detailContent = (
        <div className="space-y-6">
            {rows.length > 0 && <DetailRows rows={rows} className={hasMain ? 'grid grid-cols-1 gap-4' : 'grid grid-cols-1 gap-5 sm:grid-cols-2'} />}
            {details.content}
        </div>
    );

    return (
        <>
            <Head title={title} />

            <DashboardPage
                fill={hasMain}
                hero={{
                    title,
                    subtitle,
                    breadcrumbs: [...rootBreadcrumbs(), parent, { label: title }],
                    actions: badges,
                }}
                summary={summary.length > 0 ? <SummaryCards cards={summary} stackOnPhones /> : null}
                panel={
                    hasMain
                        ? {
                              id: `detail-${parent.label.toLowerCase()}`,
                              title: details.title || 'Details',
                              icon: details.icon || 'fa-circle-info',
                              subtitle: details.subtitle,
                              content: <div className="px-1">{detailContent}</div>,
                          }
                        : undefined
                }
                toolbar={actions.length > 0 ? { actions } : null}
            >
                <ListPanel
                    header={
                        (main.title || (!hasMain && details.title)) && (
                            <div className="flex items-center gap-3 border-b border-white/[0.08] px-5 py-3">
                                <i aria-hidden="true" className={`fas ${main.icon || details.icon || 'fa-circle-info'} text-rose-300`} />
                                <h2 className="min-w-0 flex-1 truncate text-sm font-semibold text-white">{main.title || details.title}</h2>
                                {hasMain && main.actions}
                            </div>
                        )
                    }
                    bodyClassName={hasMain ? 'p-4' : 'p-5'}
                >
                    {hasMain ? children : detailContent}
                </ListPanel>
            </DashboardPage>
        </>
    );
}
