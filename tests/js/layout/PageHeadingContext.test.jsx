import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('@inertiajs/react', () => ({
    Link: ({ href, children, ...rest }) => (
        <a href={href} {...rest}>
            {children}
        </a>
    ),
}));

import {
    fallbackHeading,
    PageHeadingContext,
    defaultPageHeading,
} from '../../../resources/js/Layouts/PageHeadingContext';
import DashboardHero from '../../../resources/js/Components/DashboardHero';

describe('fallbackHeading', () => {
    it('uses the first segment of a nested component', () => {
        expect(fallbackHeading('Projects/Show')).toBe('Projects');
        expect(fallbackHeading('Documents/Index')).toBe('Documents');
        expect(fallbackHeading('Users/Create')).toBe('Users');
    });

    it('returns the component name for top-level pages', () => {
        expect(fallbackHeading('Messages')).toBe('Messages');
        expect(fallbackHeading('Search/Index')).toBe('Search');
        expect(fallbackHeading('Dashboard')).toBe('Dashboard');
    });

    it('returns an empty string for a missing component', () => {
        expect(fallbackHeading('')).toBe('');
        expect(fallbackHeading(undefined)).toBe('');
        expect(fallbackHeading(null)).toBe('');
    });
});

describe('defaultPageHeading', () => {
    it('is a no-op so components render outside a layout', () => {
        expect(() => defaultPageHeading.setHeading('x')).not.toThrow();
    });
});

describe('DashboardHero heading reporting', () => {
    it('reports its title to the layout', () => {
        const setHeading = vi.fn();
        render(
            <PageHeadingContext.Provider value={{ setHeading }}>
                <DashboardHero title="Receipts" />
            </PageHeadingContext.Provider>
        );
        expect(setHeading).toHaveBeenCalledWith('Receipts');
    });

    it('reports the new title when it changes', () => {
        const setHeading = vi.fn();
        const { rerender } = render(
            <PageHeadingContext.Provider value={{ setHeading }}>
                <DashboardHero title="Receipts" />
            </PageHeadingContext.Provider>
        );
        setHeading.mockClear();
        rerender(
            <PageHeadingContext.Provider value={{ setHeading }}>
                <DashboardHero title="Expenses" />
            </PageHeadingContext.Provider>
        );
        expect(setHeading).toHaveBeenCalledWith('Expenses');
    });

    it('renders outside a provider using the no-op default', () => {
        render(<DashboardHero title="Standalone" />);
        expect(screen.getByRole('heading', { name: 'Standalone' })).toBeInTheDocument();
    });
});
