import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('@inertiajs/react', () => ({
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

    it('fits the screen only when asked', () => {
        const { container, rerender } = render(<DashboardPage hero={{ title: 'A' }} />);
        expect(container.firstChild).toHaveAttribute('data-layout', 'flow');
        expect(container.firstChild.className).not.toContain('fit:h-');

        rerender(<DashboardPage hero={{ title: 'A' }} fill />);
        expect(container.firstChild).toHaveAttribute('data-layout', 'fill');
        expect(container.firstChild.className).toContain('fit:h-[calc(100dvh-12rem)]');
    });
});
