import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('@inertiajs/react', () => ({
    Link: ({ href, children, ...rest }) => <a href={href} {...rest}>{children}</a>,
    usePage: () => ({ props: { flash: {} } }),
}));

import GuestLayout from '../../../resources/js/Layouts/GuestLayout';

describe('GuestLayout', () => {
    it('puts the form on a light card with a way back to the website', () => {
        render(
            <GuestLayout stepKey="login" title="Welcome Back" subtitle="Sign in to continue.">
                <h1>Sign In Account</h1>
            </GuestLayout>,
        );
        expect(screen.getByRole('heading', { level: 1, name: 'Sign In Account' })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /Back to the website/ })).toHaveAttribute('href', '/');
        // The showcase is decoration: hidden from screen readers.
        expect(screen.getByText('Welcome Back').closest('aside')).toHaveAttribute('aria-hidden', 'true');
        expect(screen.getByText('Pick a project')).toBeInTheDocument();
    });
});
