import { createContext, useContext } from 'react';

/**
 * Single source of truth for the page heading shown in the top navbar.
 *
 * DashboardHero reports the title it renders; AuthenticatedLayout consumes it.
 * Pages that render no DashboardHero fall back to the first segment of the
 * Inertia page component name (e.g. `Projects/Show` -> `Projects`).
 */
export const defaultPageHeading = {
    setHeading: () => {},
};

export const PageHeadingContext = createContext(defaultPageHeading);

export function usePageHeading() {
    return useContext(PageHeadingContext);
}

export function fallbackHeading(component) {
    if (!component) return '';
    return component.split('/')[0] || '';
}
