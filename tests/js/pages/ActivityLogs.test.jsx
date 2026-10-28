import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('@inertiajs/react', () => ({
    Head: () => null,
    Link: ({ href, children, preserveScroll, ...rest }) => <a href={href} {...rest}>{children}</a>,
    usePage: () => ({ props: { auth: { user: { id: 1 } } } }),
}));
vi.mock('@/Layouts/AuthenticatedLayout', () => ({ default: ({ children }) => <div>{children}</div> }));

import ActivityLogs from '../../../resources/js/Pages/ActivityLogs';

const changes = {
    data: [{
        id: 3, event: 'updated', type: 'expense', record_id: 5, project_id: 7, label: 'Cement',
        user: { id: 2, name: 'Mary Manager' }, at: new Date().toISOString(),
        changes: [{ field: 'amount', before: '15300', after: '20000' }], restorable: true, undoable: true,
    }],
    links: [],
};
const logs = { data: [{ id: 1, action: 'auth.login', description: 'Signed in', ip_address: '10.0.0.1', created_at: '2026-10-28T08:00:00Z' }], links: [] };

describe('ActivityLogs', () => {
    it('shows changes from the version history, read-only', () => {
        render(<ActivityLogs tab="changes" changes={changes} logs={logs} />);
        expect(screen.getByRole('tab', { name: /Changes/ })).toHaveAttribute('aria-selected', 'true');
        expect(screen.getByText('Mary Manager')).toBeInTheDocument();
        expect(screen.getByText('Cement')).toBeInTheDocument();
        expect(screen.getByText('20,000')).toBeInTheDocument();
        // Restoring lives in the navbar's version history.
        expect(screen.queryByRole('button', { name: /Restore|Undo/ })).toBeNull();
        expect(screen.queryByText('Signed in')).toBeNull();
    });

    it('shows sign-ins and account events on their own tab', () => {
        render(<ActivityLogs tab="account" changes={changes} logs={logs} />);
        expect(screen.getByRole('tab', { name: /Sign-ins/ })).toHaveAttribute('aria-selected', 'true');
        expect(screen.getByText('Signed in')).toBeInTheDocument();
        expect(screen.getByText('auth.login')).toBeInTheDocument();
        expect(screen.queryByText('Cement')).toBeNull();
    });
});
