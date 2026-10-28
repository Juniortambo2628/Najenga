import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';

vi.mock('@inertiajs/react', () => ({
    Head: () => null,
    Link: ({ href, children, ...rest }) => <a href={href} {...rest}>{children}</a>,
}));

import Welcome from '../../../resources/js/Pages/Welcome';

describe('the landing page', () => {
    it('leads with the hero and offers sign-up and sign-in to visitors', () => {
        render(<Welcome auth={{ user: null }} />);
        expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Build it right.Keep every shilling in sight.');
        expect(screen.getAllByRole('link', { name: 'Start your first project' })[0]).toHaveAttribute('href', '/register');
        expect(screen.getAllByRole('link', { name: 'Sign in' })[0]).toHaveAttribute('href', '/login');
    });

    it('sends people who are signed in to their dashboard', () => {
        render(<Welcome auth={{ user: { id: 1 } }} />);
        expect(screen.getAllByRole('link', { name: 'Open your dashboard' })[0]).toHaveAttribute('href', '/dashboard');
        expect(screen.queryByRole('link', { name: 'Sign in' })).toBeNull();
    });

    it('links every section from the bar under the hero', () => {
        const { container } = render(<Welcome auth={{ user: null }} />);
        const bar = screen.getByRole('navigation', { name: 'On this page' });
        within(bar).getAllByRole('link').forEach((link) => {
            expect(container.querySelector(link.getAttribute('href'))).not.toBeNull();
        });
    });

    it('shows one feature area at a time', () => {
        render(<Welcome auth={{ user: null }} />);
        expect(screen.getByRole('tabpanel')).toHaveTextContent('Every shilling, accounted for');
        fireEvent.click(screen.getByRole('tab', { name: /Team/ }));
        expect(screen.getByRole('tab', { name: /Team/ })).toHaveAttribute('aria-selected', 'true');
    });

    it('opens one answer at a time', () => {
        render(<Welcome auth={{ user: null }} />);
        const question = screen.getByRole('button', { name: /Can I send receipts and photos on WhatsApp/ });
        expect(question).toHaveAttribute('aria-expanded', 'false');
        fireEvent.click(question);
        expect(question).toHaveAttribute('aria-expanded', 'true');
        expect(screen.getByRole('button', { name: /What is Najenga/ })).toHaveAttribute('aria-expanded', 'false');
    });
});
