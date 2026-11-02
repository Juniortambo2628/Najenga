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

describe('pages on the kit hero', () => {
    it('leaves the header to the kit hero, which shows its own compact title', () => {
        const { container } = render(<NavbarTitle heading="Expenses" hero={{ kit: true }} />);
        expect(container).toBeEmptyDOMElement();
    });
});
