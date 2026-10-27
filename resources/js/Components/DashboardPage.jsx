import DashboardHero from '@/Components/DashboardHero';
import FloatingToolbar from '@/Components/FloatingToolbar';
import { SidePanelAside, SidePanelMobileBar } from '@/Components/SidePanel';

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
 * `fill` fits the page to the screen on desktops tall enough (the `fit`
 * screen): hero and summary stay put and only the body of a ListPanel inside
 * scrolls. Other screens scroll the page as usual.
 *
 * @param {object}    hero      - DashboardHero props: { title, subtitle, breadcrumbs, actions }
 * @param {ReactNode} [summary] - Usually a SummaryCards element
 * @param {object}    [toolbar] - FloatingToolbar props; leave out for no toolbar
 * @param {object}    [panel]   - Side panel config (see SidePanel); on phones it
 *                                becomes a chip bar or bottom sheet under the navbar
 * @param {boolean}   [fill]    - Fit the screen; the content's ListPanel scrolls
 * @param {Function}  [onClick] - Click handler on the page (e.g. to close a context menu)
 */
export default function DashboardPage({ hero, summary = null, toolbar = null, panel = null, fill = false, onClick, children }) {
    // Navbar 4rem + main's padding (2rem top, 6rem bottom for the toolbar).
    const fit = fill ? 'fit:h-[calc(100dvh-12rem)] fit:flex fit:flex-col' : '';

    return (
        <div onClick={onClick} className={fit} data-layout={fill ? 'fill' : 'flow'}>
            <div className={fill ? 'fit:shrink-0' : ''}>
                <DashboardHero {...hero} />
                {summary && <div className="mb-6">{summary}</div>}
            </div>

            {toolbar && <FloatingToolbar {...toolbar} />}

            {panel && <SidePanelMobileBar panel={panel} />}

            <div className={`${panel ? 'lg:flex lg:gap-5' : ''} ${fill ? 'fit:flex-1 fit:min-h-0' : ''}`}>
                <div className={`min-w-0 ${panel ? 'lg:flex-1' : ''} ${fill ? 'fit:h-full fit:flex fit:flex-col' : ''}`}>{children}</div>
                {panel && <SidePanelAside key={panel.id || panel.title} panel={panel} />}
            </div>
        </div>
    );
}
