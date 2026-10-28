import { describe, it, expect, vi, afterEach } from 'vitest';

vi.mock('@inertiajs/react', () => ({ Link: () => null, router: { on: () => () => {} }, usePage: () => ({ props: {} }) }));

import { isCurrent, isDesktop } from '../../../resources/js/Layouts/AuthenticatedLayout';

const original = window.matchMedia;
afterEach(() => {
    window.matchMedia = original;
});

describe('sidebar start state', () => {
    it('starts open on desktops and closed below lg', () => {
        window.matchMedia = vi.fn((query) => ({ matches: query === '(min-width: 1024px)' }));
        expect(isDesktop()).toBe(true);

        window.matchMedia = vi.fn(() => ({ matches: false }));
        expect(isDesktop()).toBe(false);
    });
});

describe('the current sidebar entry', () => {
    it('matches full route() URLs against the page path, and pages under them', () => {
        expect(isCurrent('/expenses', 'http://localhost/expenses')).toBe(true);
        expect(isCurrent('/expenses/12/edit', 'http://localhost/expenses')).toBe(true);
        expect(isCurrent('/expenses?page=2', '/expenses')).toBe(true);
        expect(isCurrent('/expenses-archive', '/expenses')).toBe(false);
        expect(isCurrent('/receipts', 'http://localhost/receipt-verification')).toBe(false);
    });
});
