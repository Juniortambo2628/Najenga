import { createContext, useContext } from 'react';

/**
 * Single source of truth for the page heading shown in the top navbar.
 *
 * DashboardHero reports the title it renders (setHeading) and whether it is
 * still in view below the header, with its parent breadcrumb (reportHero);
 * AuthenticatedLayout consumes both. While the hero is in view the navbar
 * leaves the title to it; once the hero scrolls behind the navbar, a compact
 * title (parent crumb, title, back to top) takes its place.
 * Pages that render no DashboardHero fall back to the first segment of the
 * Inertia page component name (e.g. `Projects/Show` -> `Projects`), always
 * shown.
 */
export const defaultPageHeading = {
    setHeading: () => {},
    reportHero: () => {},
};

export const PageHeadingContext = createContext(defaultPageHeading);

export function usePageHeading() {
    return useContext(PageHeadingContext);
}

export function fallbackHeading(component) {
    if (!component) return '';
    return component.split('/')[0] || '';
}
