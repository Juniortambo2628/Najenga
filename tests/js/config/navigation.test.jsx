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
    NAV_ITEMS,
    navItemsFor,
    rootBreadcrumbs,
} from '../../../resources/js/Config/navigation';
import Breadcrumb from '../../../resources/js/Components/Breadcrumb';

describe('NAV_ITEMS', () => {
    it('is the single source of sidebar entries', () => {
        expect(NAV_ITEMS.length).toBeGreaterThan(0);
        NAV_ITEMS.forEach((item) => {
            expect(item.name).toBeTruthy();
            expect(item.href).toMatch(/^\//);
            expect(item.icon).toBeTruthy();
        });
    });

    it('has unique names and hrefs', () => {
        expect(new Set(NAV_ITEMS.map((i) => i.name)).size).toBe(NAV_ITEMS.length);
        expect(new Set(NAV_ITEMS.map((i) => i.href)).size).toBe(NAV_ITEMS.length);
    });

    it('links the activity log page, which has no other way in', () => {
        // /activity-logs renders Pages/ActivityLogs.jsx but appears in no
        // other component and no breadcrumb, so the sidebar is its only door.
        expect(NAV_ITEMS.map((i) => i.href)).toContain('/activity-logs');
    });
});

describe('navItemsFor', () => {
    it('gives admins everything', () => {
        expect(navItemsFor('admin')).toHaveLength(NAV_ITEMS.length);
    });

    it('hides role-restricted items from staff', () => {
        const names = navItemsFor('staff').map((i) => i.name);
        expect(names).not.toContain('Analytics');
        expect(names).not.toContain('Users');
        expect(names).toContain('Projects');
        expect(names).toContain('Dashboard');
    });
});

describe('rootBreadcrumbs', () => {
    it('returns the dashboard as the single root', () => {
        expect(rootBreadcrumbs()).toEqual([
            { label: 'Dashboard', href: '/dashboard' },
        ]);
    });

    it('returns a fresh array each call so callers can spread and extend it', () => {
        const a = rootBreadcrumbs();
        const b = rootBreadcrumbs();
        expect(a).not.toBe(b);
        a.push({ label: 'x' });
        expect(rootBreadcrumbs()).toHaveLength(1);
    });
});

describe('Breadcrumb', () => {
    it('renders nothing when there are no items', () => {
        const { container } = render(<Breadcrumb items={[]} />);
        expect(container.firstChild).toBeNull();
    });

    it('renders linked items as anchors and the last item as plain text', () => {
        render(<Breadcrumb items={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Projects' }]} />);
        expect(screen.getByRole('link', { name: 'Dashboard' })).toHaveAttribute('href', '/dashboard');
        expect(screen.queryByRole('link', { name: 'Projects' })).toBeNull();
        expect(screen.getByText('Projects')).toBeInTheDocument();
    });

    it('separates items with a chevron', () => {
        const { container } = render(
            <Breadcrumb items={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Projects' }]} />
        );
        expect(container.querySelectorAll('.fa-chevron-right')).toHaveLength(1);
    });
});
