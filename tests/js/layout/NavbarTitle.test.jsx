import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';

vi.mock('@inertiajs/react', () => ({
    Link: ({ href, children, ...rest }) => (
        <a href={href} {...rest}>
            {children}
        </a>
    ),
    usePage: () => ({ props: {}, url: '/', component: '' }),
    router: { get: vi.fn() },
}));

import { NavbarTitle } from '../../../resources/js/Layouts/AuthenticatedLayout';
import { PageHeadingContext } from '../../../resources/js/Layouts/PageHeadingContext';
import DashboardHero from '../../../resources/js/Components/DashboardHero';

describe('NavbarTitle', () => {
    it('always shows the fallback heading on pages without a hero', () => {
        render(<NavbarTitle heading="Messages" hero={null} />);
        expect(screen.getByText('Messages')).toBeInTheDocument();
    });

    it('leaves the title to the hero while the hero is in view', () => {
        render(<NavbarTitle heading="Expenses" hero={{ visible: true, parent: null }} />);
        expect(screen.queryByText('Expenses')).toBeNull();
    });

    it('shows a compact title with its parent and a way back up once the hero scrolls away', () => {
        const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
        render(<NavbarTitle heading="Upload" hero={{ visible: false, parent: { label: 'Photos', href: '/photos' } }} />);
        expect(screen.getByText('Upload')).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'Photos' })).toHaveAttribute('href', '/photos');
        screen.getByTitle('Back to top').click();
        expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
    });
});

describe('DashboardHero visibility reporting', () => {
    let observerCallback;
    afterEach(() => {
        delete globalThis.IntersectionObserver;
    });

    it('reports when it scrolls behind the navbar, with its parent breadcrumb', () => {
        globalThis.IntersectionObserver = class {
            constructor(cb, options) {
                observerCallback = cb;
                this.options = options;
                expect(options.rootMargin).toBe('-64px 0px 0px 0px');
            }
            observe() {}
            disconnect() {}
        };
        const reportHero = vi.fn();
        render(
            <PageHeadingContext.Provider value={{ setHeading: () => {}, reportHero }}>
                <DashboardHero
                    title="Upload"
                    breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Photos', href: '/photos' }, { label: 'Upload' }]}
                />
            </PageHeadingContext.Provider>,
        );
        expect(reportHero).toHaveBeenLastCalledWith({ visible: true, parent: { label: 'Photos', href: '/photos' } });
        act(() => observerCallback([{ isIntersecting: false }]));
        expect(reportHero).toHaveBeenLastCalledWith({ visible: false, parent: { label: 'Photos', href: '/photos' } });
    });
});
