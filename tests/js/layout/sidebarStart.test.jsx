import { describe, it, expect, vi, afterEach } from 'vitest';

vi.mock('@inertiajs/react', () => ({ Link: () => null, router: { on: () => () => {} }, usePage: () => ({ props: {} }) }));

import { isDesktop } from '../../../resources/js/Layouts/AuthenticatedLayout';

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
