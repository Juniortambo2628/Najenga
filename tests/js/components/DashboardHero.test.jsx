import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('@inertiajs/react', () => ({
    Link: ({ href, children, ...rest }) => (
        <a href={href} {...rest}>
            {children}
        </a>
    ),
}));

import DashboardHero from '../../../resources/js/Components/DashboardHero';

describe('DashboardHero', () => {
    it('renders the title and subtitle', () => {
        render(<DashboardHero title="Receipts" subtitle="All scans" />);
        expect(screen.getByRole('heading', { name: 'Receipts' })).toBeInTheDocument();
        expect(screen.getByText('All scans')).toBeInTheDocument();
    });

    it('renders breadcrumbs as links', () => {
        render(
            <DashboardHero
                title="Show"
                breadcrumbs={[
                    { label: 'Dashboard', href: '/dashboard' },
                    { label: 'Receipts', href: '/receipts' },
                    { label: 'INV-1' },
                ]}
            />
        );
        expect(screen.getByRole('link', { name: 'Dashboard' })).toHaveAttribute('href', '/dashboard');
        expect(screen.getByRole('link', { name: 'Receipts' })).toHaveAttribute('href', '/receipts');
        expect(screen.getByText('INV-1')).toBeInTheDocument();
        expect(screen.queryByRole('link', { name: 'INV-1' })).toBeNull();
    });

    it('renders the actions slot instead of dropping it', () => {
        render(
            <DashboardHero
                title="Users"
                actions={<button type="button">Verify Receipt</button>}
            />
        );
        expect(screen.getByRole('button', { name: 'Verify Receipt' })).toBeInTheDocument();
    });

    it('omits the actions wrapper when no actions are given', () => {
        const { container } = render(<DashboardHero title="Dashboard" />);
        expect(container.querySelector('.flex.items-center.gap-2.flex-wrap')).toBeNull();
    });

    it('renders multiple actions together', () => {
        render(
            <DashboardHero
                title="Users"
                actions={
                    <>
                        <button type="button">Add User</button>
                        <button type="button">Delete Selected</button>
                    </>
                }
            />
        );
        expect(screen.getByRole('button', { name: 'Add User' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Delete Selected' })).toBeInTheDocument();
    });
});
