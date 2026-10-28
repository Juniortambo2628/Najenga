import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';

const axiosMock = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn() }));
vi.mock('axios', () => ({ default: axiosMock }));
vi.mock('react-hot-toast', () => ({ default: { success: vi.fn(), error: vi.fn() } }));
const routerMock = vi.hoisted(() => ({ reload: vi.fn(), on: () => () => {} }));
const page = vi.hoisted(() => ({
    component: 'Expenses',
    props: { auth: { projects: [{ id: 7, name: 'Kitengela site', role: 'owner' }, { id: 9, name: 'Ruiru flats', role: 'viewer' }] } },
}));
vi.mock('@inertiajs/react', () => ({ router: routerMock, usePage: () => page }));
vi.mock('../../../resources/js/Utils/feedback', () => ({ confirmAction: vi.fn(() => Promise.resolve(true)) }));

import HistoryDrawer from '../../../resources/js/Components/HistoryDrawer';
import { setActiveProjectId } from '../../../resources/js/Utils/activeProject';

const version = (over) => ({
    id: 1, event: 'updated', type: 'expense', record_id: 5, project_id: 7, label: 'Cement',
    user: { id: 2, name: 'Mary Manager' }, at: new Date().toISOString(),
    changes: [{ field: 'amount', before: '15300.00', after: '20000.00' }], restorable: true, undoable: true, ...over,
});

beforeEach(() => {
    vi.clearAllMocks();
    act(() => setActiveProjectId(null));
    axiosMock.get.mockResolvedValue({ data: { data: [version(), version({ id: 2, project_id: 9, label: 'Sand', event: 'deleted', changes: [] })], current_page: 1, last_page: 1 } });
});

describe('HistoryDrawer', () => {
    it("shows this page's changes, field by field", async () => {
        render(<HistoryDrawer show onClose={vi.fn()} />);

        expect(await screen.findByText('Cement')).toBeInTheDocument();
        expect(axiosMock.get).toHaveBeenCalledWith('/history', { params: { type: 'expense', project_id: undefined, page: 1 } });
        expect(screen.getAllByText('Mary Manager')).toHaveLength(2);
        expect(screen.getByText('15,300')).toBeInTheDocument();
        expect(screen.getByText('20,000')).toBeInTheDocument();
        expect(screen.getByText('Today')).toBeInTheDocument();

        fireEvent.click(screen.getByRole('radio', { name: 'All pages' }));
        await waitFor(() => expect(axiosMock.get).toHaveBeenLastCalledWith('/history', { params: { type: undefined, project_id: undefined, page: 1 } }));
    });

    it('follows the project picked in the navbar', async () => {
        act(() => setActiveProjectId(7));
        render(<HistoryDrawer show onClose={vi.fn()} />);
        await screen.findByText('Cement');
        expect(axiosMock.get).toHaveBeenCalledWith('/history', { params: { type: 'expense', project_id: '7', page: 1 } });
    });

    it('restores a version, then reloads the page; viewers get no restore button', async () => {
        axiosMock.post.mockResolvedValue({ data: { message: 'Restored Cement' } });
        render(<HistoryDrawer show onClose={vi.fn()} />);
        await screen.findByText('Sand');

        // "Sand" is in a project where this person only views.
        expect(screen.getAllByRole('button', { name: /Restore|Undo/ })).toHaveLength(2);

        fireEvent.click(screen.getByRole('button', { name: 'Restore this version' }));
        await waitFor(() => expect(axiosMock.post).toHaveBeenCalledWith('/history/versions/1/restore', {}));
        await waitFor(() => expect(routerMock.reload).toHaveBeenCalled());

        fireEvent.click(screen.getByRole('button', { name: 'Undo this change' }));
        await waitFor(() => expect(axiosMock.post).toHaveBeenLastCalledWith('/history/versions/1/restore', { undo: true }));
    });
});
