import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';

const routerGet = vi.fn();

vi.mock('@inertiajs/react', () => ({
    Head: () => null,
    Link: ({ href, children, ...rest }) => <a href={href} {...rest}>{children}</a>,
    router: { get: (...args) => routerGet(...args), reload: vi.fn() },
    usePage: () => ({ props: { auth: { user: { id: 1, projects: [] } } }, component: 'Dashboard' }),
}));
vi.mock('@/Layouts/AuthenticatedLayout', () => ({ default: ({ children }) => children }));
// The default activity panel fetches who's here and the latest changes;
// these tests cover the page shell, so a placeholder stands in for it.
vi.mock('@/Components/PageActivityPanel', () => ({
    default: () => <p>Activity panel</p>,
    ACTIVITY_PANEL_PAGES: ['Dashboard'],
}));

import Dashboard from '../../../resources/js/Pages/Dashboard';
import SearchIndex, { searchViews, activeType } from '../../../resources/js/Pages/Search/Index';

afterEach(() => {
    vi.useRealTimers();
    routerGet.mockClear();
});

describe('Dashboard', () => {
    it('renders through the shared layout: hero, summary cards and the toolbar action', () => {
        const { container } = render(
            <Dashboard
                auth={{ user: { first_name: 'Jane', name: 'Jane Doe' } }}
                stats={{ totalExpenses: 120000, activeProjects: 2, totalPhotos: 8, totalProjects: 3 }}
                recentExpenses={[{ id: 1, title: 'cement purchase', project_name: 'Kitengela site', amount: 5000 }]}
                recentProjects={[{ id: 7, name: 'Kilimani build', location: 'Nairobi', status: 'in_progress' }]}
            />,
        );

        // The one layout every dashboard page renders through.
        expect(container.querySelector('[data-layout="fit"]')).not.toBeNull();
        expect(screen.getByRole('heading', { level: 1, name: 'Welcome back, Jane!' })).toBeInTheDocument();

        expect(screen.getByText('Total expenses')).toBeInTheDocument();
        expect(screen.getByText('Active projects')).toBeInTheDocument();

        const toolbar = screen.getByRole('toolbar', { name: 'Page tools' });
        expect(within(toolbar).getByRole('link', { name: /New project/ })).toHaveAttribute('href', '/projects/create');

        expect(screen.getByRole('link', { name: /Add expense/ })).toHaveAttribute('href', '/expenses/create');
        expect(screen.getByText('cement purchase')).toBeInTheDocument();
        expect(screen.getByText('Kilimani build')).toBeInTheDocument();
    });

    it('offers the empty states when there is nothing to show yet', () => {
        render(<Dashboard auth={{ user: { name: 'Jane Doe' } }} />);

        expect(screen.getByText('No expenses yet')).toBeInTheDocument();
        expect(screen.getByText('No projects yet')).toBeInTheDocument();
    });
});

describe('Search', () => {
    const results = [
        { id: 1, type: 'expense', title: 'Cement', subtitle: 'Kitengela site', url: '/expenses/1', date: 'Oct 1', amount: 5000 },
        { id: 2, type: 'photo', title: 'Slab pour', url: '/photos/2', date: 'Oct 2', thumb_url: '/t.jpg' },
    ];

    it('renders through the shared layout and starts with a prompt', () => {
        const { container } = render(<SearchIndex />);

        expect(container.querySelector('[data-layout="fit"]')).not.toBeNull();
        expect(screen.getByRole('heading', { level: 1, name: 'Search' })).toBeInTheDocument();
        expect(screen.getByText('Start typing to search')).toBeInTheDocument();
    });

    it('lists results as cards with their kind', () => {
        render(<SearchIndex query="cem" results={results} totals={{ expenses: 1, photos: 1, documents: 0 }} />);

        expect(screen.getByRole('heading', { level: 3, name: 'Cement' })).toBeInTheDocument();
        expect(screen.getByText('Expense')).toBeInTheDocument();
        expect(screen.getByText('Photo')).toBeInTheDocument();
        expect(screen.getByText('KES 5,000')).toBeInTheDocument();
    });

    it('searches from the toolbar once typing pauses, and narrows by kind from the panel', () => {
        vi.useFakeTimers();
        render(<SearchIndex query="" results={[]} totals={{ expenses: 4 }} />);

        fireEvent.change(screen.getByRole('searchbox', { name: 'Search documents, photos and expenses' }), {
            target: { value: 'cement' },
        });
        expect(routerGet).not.toHaveBeenCalled();
        vi.advanceTimersByTime(350);
        expect(routerGet).toHaveBeenCalledWith(
            '/search',
            { q: 'cement', type: undefined },
            expect.objectContaining({ preserveState: true, replace: true }),
        );

        const panel = screen.getByRole('complementary', { name: 'Kinds' });
        fireEvent.click(within(panel).getByRole('button', { name: /Expenses/ }));
        expect(routerGet).toHaveBeenLastCalledWith(
            '/search',
            { q: 'cement', type: 'expense' },
            expect.objectContaining({ preserveState: true, replace: true }),
        );
    });

    it('says what matched nothing, and offers to clear the search', () => {
        render(<SearchIndex query="zzz" results={[]} />);

        expect(screen.getByText('No results match “zzz”')).toBeInTheDocument();
        fireEvent.click(screen.getByRole('button', { name: 'Clear search' }));
        expect(routerGet).toHaveBeenCalledWith('/search', { q: '', type: undefined }, expect.anything());
    });

    it('counts every kind in the panel views', () => {
        expect(searchViews({ expenses: 4, photos: 2, documents: 1 }, results)).toMatchObject([
            { id: 'all', count: 2 },
            { id: 'document', count: 1 },
            { id: 'photo', count: 2 },
            { id: 'expense', count: 4 },
        ]);
        expect(activeType('photo')).toBe('photo');
        expect(activeType('nonsense')).toBe('all');
        expect(activeType(null)).toBe('all');
    });
});
