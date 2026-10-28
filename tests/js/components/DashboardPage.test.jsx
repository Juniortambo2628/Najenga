import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

const page = vi.hoisted(() => ({ component: 'Profile/Edit', props: { auth: { projects: [] } } }));
vi.mock('@inertiajs/react', () => ({
    usePage: () => page,
    Link: ({ href, children, ...rest }) => (
        <a href={href} {...rest}>
            {children}
        </a>
    ),
}));

import DashboardPage from '../../../resources/js/Components/DashboardPage';

describe('DashboardPage', () => {
    it('renders the hero, summary and content in order', () => {
        const { container } = render(
            <DashboardPage hero={{ title: 'Receipts', subtitle: '3 receipts' }} summary={<p>Summary here</p>}>
                <p>Rows here</p>
            </DashboardPage>,
        );
        expect(screen.getByRole('heading', { name: 'Receipts' })).toBeInTheDocument();
        const text = container.textContent;
        expect(text.indexOf('Receipts')).toBeLessThan(text.indexOf('Summary here'));
        expect(text.indexOf('Summary here')).toBeLessThan(text.indexOf('Rows here'));
    });

    it('renders the shared toolbar from config', () => {
        render(
            <DashboardPage
                hero={{ title: 'Expenses' }}
                toolbar={{ actions: [{ id: 'add', label: 'Add Expense', href: '/expenses/create' }] }}
            />,
        );
        expect(screen.getByRole('link', { name: 'Add Expense' })).toHaveAttribute('href', '/expenses/create');
    });

    it('renders no toolbar without config', () => {
        render(<DashboardPage hero={{ title: 'Profile' }} />);
        expect(screen.queryByRole('toolbar')).toBeNull();
        expect(screen.queryByRole('link')).toBeNull();
    });

    it('always fits the screen: the content column scrolls, or its ListPanel does with fill', () => {
        const { container, rerender } = render(<DashboardPage hero={{ title: 'A' }}>body</DashboardPage>);
        expect(container.firstChild).toHaveAttribute('data-layout', 'fit');
        expect(container.firstChild.className).toContain('fit:h-[calc(100dvh-12rem)]');
        const column = container.querySelector('[data-scroll-region]');
        expect(column).toHaveTextContent('body');
        expect(column.className).toContain('fit:overflow-y-auto');

        rerender(<DashboardPage hero={{ title: 'A' }} fill>body</DashboardPage>);
        expect(container.firstChild).toHaveAttribute('data-layout', 'fill');
        expect(container.firstChild.className).toContain('fit:h-[calc(100dvh-12rem)]');
        // The ListPanel inside scrolls its own rows instead.
        expect(container.querySelector('[data-scroll-region]')).toBeNull();
    });
});

describe('DashboardPage side panel', () => {
    it('renders the panel beside the content and on phones', () => {
        render(
            <DashboardPage
                hero={{ title: 'Documents' }}
                panel={{ title: 'Folders', items: [{ id: 'all', label: 'All files' }], activeId: 'all' }}
            >
                <p>Files</p>
            </DashboardPage>,
        );
        // Desktop aside and the phone chip bar both name the panel.
        expect(screen.getByRole('complementary', { name: 'Folders' })).toBeInTheDocument();
        expect(screen.getAllByRole('button', { name: /All files/ })).toHaveLength(2);
    });
});

describe('DashboardPage classes', () => {
    it('passes wrapper and body classes through', () => {
        const { container } = render(
            <DashboardPage hero={{ title: 'WhatsApp' }} className="max-w-6xl mx-auto" bodyClassName="space-y-6">
                <p>A</p>
                <p>B</p>
            </DashboardPage>,
        );
        expect(container.firstChild.className).toContain('max-w-6xl');
        expect(screen.getByText('A').parentElement.className).toContain('space-y-6');
    });
});

describe('DashboardPage activity panel', () => {
    it('gives list pages without a panel the Activity panel, collapsed to a rail', () => {
        page.component = 'Expenses';
        try {
            localStorage.clear();
        } catch {
            /* storage unavailable */
        }
        const { rerender } = render(<DashboardPage hero={{ title: 'Expenses' }}><p>Rows</p></DashboardPage>);
        expect(screen.getByRole('button', { name: 'Show Activity' })).toBeInTheDocument();

        rerender(<DashboardPage hero={{ title: 'Expenses' }} panel={false}><p>Rows</p></DashboardPage>);
        expect(screen.queryByRole('button', { name: 'Show Activity' })).toBeNull();

        rerender(<DashboardPage hero={{ title: 'Expenses' }} panel={{ title: 'Folders', items: [{ id: 'all', label: 'All files' }] }}><p>Rows</p></DashboardPage>);
        expect(screen.queryByRole('button', { name: 'Show Activity' })).toBeNull();
        page.component = 'Profile/Edit';
    });

    it('leaves other pages alone', () => {
        render(<DashboardPage hero={{ title: 'Profile' }}><p>Form</p></DashboardPage>);
        expect(screen.queryByRole('button', { name: 'Show Activity' })).toBeNull();
    });
});
