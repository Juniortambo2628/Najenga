import DashboardHero from '@/Components/DashboardHero';
import FloatingToolbar from '@/Components/FloatingToolbar';
import { SidePanelAside, SidePanelMobileBar } from '@/Components/SidePanel';
import { usePage } from '@inertiajs/react';
import PageActivityPanel, { ACTIVITY_PANEL_PAGES } from '@/Components/PageActivityPanel';

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
 * The one layout every dashboard page renders through, so each page has the
 * same shape:
 *
 *   1. hero (title, breadcrumbs, subtitle)
 *   2. summary cards (optional)
 *   3. the page's content, with the shared side panel on its right (optional)
 *   + the shared floating toolbar (search, project, filters, view, actions, selection)
 *
 * Pages pass config, not markup: no page builds its own hero or toolbar wrapper.
 *
 * On desktops tall enough (the `fit` screen) every page fits the screen: the
 * hero and summary stay in view, and only the content column and the side
 * panel scroll, each on its own. With `fill`, the content is a ListPanel
 * that takes the rest of the height and scrolls its own rows (its header
 * and footer stay put). Other screens scroll the page as usual.
 *
 * @param {object}    hero      - DashboardHero props: { title, subtitle, breadcrumbs, actions }
 * @param {ReactNode} [summary] - Usually a SummaryCards element
 * @param {object}    [toolbar] - FloatingToolbar props; leave out for no toolbar
 * @param {object}    [panel]   - Side panel config (see SidePanel); on phones it
 *                                becomes a chip bar or bottom sheet under the navbar.
 *                                Without one, list pages get the Activity panel;
 *                                `panel={false}` turns that off.
 * @param {boolean}   [fill]    - The content is a ListPanel that scrolls its own rows
 * @param {Function}  [onClick] - Click handler on the page (e.g. to close a context menu)
 * @param {string}    [className]     - Extra classes for the page wrapper (e.g. a max width)
 * @param {string}    [bodyClassName] - Extra classes for the content column (e.g. spacing between sections)
 */
export default function DashboardPage({ hero, summary = null, toolbar = null, panel: ownPanel, fill = false, onClick, className = '', bodyClassName = '', children }) {
    const { component } = usePage();
    const panel = ownPanel ?? (ownPanel !== false && ACTIVITY_PANEL_PAGES.includes(component) ? ACTIVITY_PANEL : null);
    // Navbar 4rem + main's padding (2rem top, 6rem bottom for the toolbar).
    const classes = `fit:h-[calc(100dvh-12rem)] fit:flex fit:flex-col ${className}`.trim();
    // Without a ListPanel to scroll, the content column scrolls itself.
    const body = fill
        ? 'fit:h-full fit:flex fit:flex-col'
        : 'fit:h-full fit:overflow-y-auto fit:overscroll-contain fit:-mx-1 fit:px-1 fit:pb-2';

    return (
        <div onClick={onClick} className={classes} data-layout={fill ? 'fill' : 'fit'}>
            <div className="fit:shrink-0">
                <DashboardHero {...hero} />
                {summary && <div className="mb-6">{summary}</div>}
            </div>

            {toolbar && <FloatingToolbar {...toolbar} />}

            {panel && !panel.desktopOnly && <SidePanelMobileBar panel={panel} />}

            <div className={`fit:flex-1 fit:min-h-0 ${panel ? 'lg:flex lg:gap-5' : ''}`}>
                <div data-scroll-region={fill ? undefined : true} className={`min-w-0 ${panel ? 'lg:flex-1' : ''} ${body} ${bodyClassName}`}>
                    {children}
                </div>
                {panel && <SidePanelAside key={panel.id || panel.title} panel={panel} />}
            </div>
        </div>
    );
}
