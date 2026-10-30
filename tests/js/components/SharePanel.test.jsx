import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

const axiosMock = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() }));
vi.mock('axios', () => ({ default: axiosMock }));
vi.mock('react-hot-toast', () => ({ default: { success: vi.fn(), error: vi.fn() } }));
vi.mock('@inertiajs/react', () => ({
    router: { visit: vi.fn(), reload: vi.fn() },
    usePage: () => ({ props: { auth: { user: { id: 1, name: 'Olive Owner' } } } }),
}));
// Render the modal's content inline.
vi.mock('../../../resources/js/Components/Modal', () => ({ default: ({ show, children }) => (show ? <div>{children}</div> : null) }));

import SharePanel from '../../../resources/js/Components/SharePanel';

const project = { id: 7, name: 'Kitengela site' };
const members = [
    { id: 1, name: 'Olive Owner', email: 'o@x.com', role: 'owner', is_client: true },
    { id: 2, name: 'Mary Manager', email: 'm@x.com', role: 'owner', is_client: false }, // a co-owner
    { id: 3, name: 'Vic Viewer', email: 'v@x.com', role: 'viewer', is_client: false },
];

beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(window, 'confirm').mockReturnValue(true);
});

describe('SharePanel', () => {
    it('lets the owner invite, change roles and see pending invitations', async () => {
        axiosMock.get.mockResolvedValue({
            data: {
                members,
                invitations: [{ id: 9, email: 'new@x.com', role: 'editor', invited_by: 'Olive Owner', expires_at: new Date(Date.now() + 5 * 86400000).toISOString() }],
                my_role: 'owner',
                i_am_client: true,
                can_manage: true,
                assignable: ['owner', 'editor', 'viewer'],
            },
        });
        render(<SharePanel show project={project} onClose={vi.fn()} />);

        expect(await screen.findByLabelText('Invite by email')).toBeInTheDocument();
        expect(screen.getByLabelText('Role for Mary Manager')).toHaveValue('owner');
        expect(screen.getByRole('option', { name: 'Co-owner', selected: true })).toBeInTheDocument();
        expect(screen.getByText('Owner')).toBeInTheDocument(); // the client's badge
        expect(screen.getByLabelText('Role for Vic Viewer')).toBeInTheDocument();
        // Nobody changes the owner, the owner included.
        expect(screen.queryByLabelText('Role for Olive Owner')).toBeNull();
        expect(screen.getByText('new@x.com')).toBeInTheDocument();
        expect(screen.getByText(/expires in 5 days/)).toBeInTheDocument();

        axiosMock.patch.mockResolvedValue({ data: { message: 'Vic Viewer is now Editor' } });
        fireEvent.change(screen.getByLabelText('Role for Vic Viewer'), { target: { value: 'editor' } });
        await waitFor(() => expect(axiosMock.patch).toHaveBeenCalledWith('/projects/7/members/3', { role: 'editor' }));

        axiosMock.post.mockResolvedValue({ data: { status: 'invited', message: 'Invitation sent to a@x.com' } });
        fireEvent.change(screen.getByLabelText('Invite by email'), { target: { value: 'a@x.com' } });
        fireEvent.click(screen.getByRole('button', { name: 'Invite' }));
        await waitFor(() => expect(axiosMock.post).toHaveBeenCalledWith('/projects/7/invitations', { email: 'a@x.com', role: 'viewer' }));
    });

    it('lets a co-owner manage viewers and editors, not other owners', async () => {
        axiosMock.get.mockResolvedValue({
            data: {
                // As a co-owner: the server says this person isn't the client.
                members: [...members, { id: 5, name: 'Ann Again', email: 'a2@x.com', role: 'owner', is_client: false }],
                invitations: [],
                my_role: 'owner',
                i_am_client: false,
                can_manage: true,
                assignable: ['editor', 'viewer'],
            },
        });
        render(<SharePanel show project={project} onClose={vi.fn()} />);

        expect(await screen.findByLabelText('Role for Vic Viewer')).toBeInTheDocument();
        expect(screen.queryByLabelText('Role for Mary Manager')).toBeNull();
        expect(screen.queryByLabelText('Role for Olive Owner')).toBeNull();
        expect(screen.queryByRole('option', { name: 'Co-owner' })).toBeNull();
    });

    it('shows a viewer the members read-only, with a way to leave', async () => {
        axiosMock.get.mockResolvedValue({
            data: {
                members: members.map((m) => (m.id === 3 ? { ...m, id: 1 } : m.id === 1 ? { ...m, id: 4 } : m)),
                invitations: [],
                my_role: 'viewer',
                can_manage: false,
                assignable: [],
            },
        });
        render(<SharePanel show project={project} onClose={vi.fn()} />);

        expect(await screen.findByText('Mary Manager')).toBeInTheDocument();
        expect(screen.queryByLabelText('Invite by email')).toBeNull();
        expect(screen.queryByRole('combobox')).toBeNull();
        expect(screen.getByRole('button', { name: 'Leave' })).toBeInTheDocument();
    });
});
