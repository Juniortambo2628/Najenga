import { useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import { AdminPageHero, AdminPageLayout } from '@okjt/dashboard';
import PageActivityPanel, { ACTIVITY_PANEL_PAGES } from '@/Components/PageActivityPanel';
import { usePageHeading } from '@/Layouts/PageHeadingContext';

/**
 * The side panel pages with lists get when they have none of their own:
 * who's here, latest changes, History and Share. Collapsed to a rail at
 * first, so lists keep their width; desktop only.
 */
const ACTIVITY_PANEL = {
    id: 'page-activity',
    title: 'Activity',
    icon: 'fa-users',
    defaultCollapsed: true,
    desktopOnly: true,
    content: <PageActivityPanel />,
};

/**
 * The one layout every dashboard page renders through: the kit's
 * AdminPageLayout and AdminPageHero in Najenga's bold look.
 *
 *   1. hero (title, breadcrumbs, subtitle, actions)
 *   2. summary cards (optional)
 *   3. the page's content, with the shared side panel on its right (optional)
 *   + the shared floating toolbar (search, filters, view, actions, selection)
 *
 * @param {object}    hero      - { title, subtitle, breadcrumbs: [{ label, href? }], actions }
 * @param {ReactNode} [summary] - Usually a SummaryCards element
 * @param {object}    [toolbar] - The toolbar's props (search, filters, view, actions, selection); leave out for none
 * @param {object}    [panel]   - Side panel config; without one, list pages get the Activity panel;
 *                                `panel={false}` turns that off.
 * @param {boolean}   [fill]    - The content is an AdminListPanel that scrolls its own rows
 * @param {Function}  [onClick] - Click handler on the page (e.g. to close a context menu)
 * @param {string}    [className]     - Extra classes for the page wrapper
 * @param {string}    [bodyClassName] - Extra classes for the content column
 */
export default function DashboardPage({ hero, summary = null, toolbar = null, panel: ownPanel, fill = false, onClick, className = '', bodyClassName = '', children }) {
    const { component } = usePage();
    const panel = ownPanel ?? (ownPanel !== false && ACTIVITY_PANEL_PAGES.includes(component) ? ACTIVITY_PANEL : null);

    // The kit's hero shows the compact title in the header itself.
    const { setHeading, reportHero } = usePageHeading();
    useEffect(() => {
        setHeading(hero?.title);
        reportHero?.({ kit: true });
    }, [hero?.title, setHeading, reportHero]);

    return (
        <AdminPageLayout
            variant="bold"
            hero={<AdminPageHero variant="bold" {...hero} />}
            summary={summary}
            toolbar={toolbar}
            panel={panel ?? false}
            fill={fill}
            onClick={onClick}
            className={className}
            bodyClassName={bodyClassName}
        >
            {children}
        </AdminPageLayout>
    );
}
