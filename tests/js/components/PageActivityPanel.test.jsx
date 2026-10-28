import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';

const axiosMock = vi.hoisted(() => ({ get: vi.fn() }));
vi.mock('axios', () => ({ default: axiosMock }));
const page = vi.hoisted(() => ({ component: 'Expenses', props: { auth: { projects: [{ id: 7, name: 'Kitengela site', role: 'owner' }] } } }));
vi.mock('@inertiajs/react', () => ({ usePage: () => page, router: { reload: vi.fn(), on: () => () => {} } }));
vi.mock('../../../resources/js/Components/SharePanel', () => ({ default: ({ show, project }) => (show ? <div role="dialog">Share {project.name}</div> : null) }));

import PageActivityPanel from '../../../resources/js/Components/PageActivityPanel';
import { setOnline } from '../../../resources/js/Utils/presence';
import { setActiveProjectId } from '../../../resources/js/Utils/activeProject';
import { closeHistory, useHistoryOpen } from '../../../resources/js/Utils/historyDrawer';

const versions = Array.from({ length: 8 }, (_, i) => ({
    id: i + 1, event: 'created', type: 'expense', record_id: i, project_id: 7, label: `Expense ${i + 1}`,
    user: { id: 2, name: 'Mary Manager' }, at: new Date().toISOString(), changes: [], restorable: true,
}));

function HistoryState() {
    return <output aria-label="History open">{String(useHistoryOpen())}</output>;
}

beforeEach(() => {
    window.history.pushState({}, '', '/expenses');
    axiosMock.get.mockResolvedValue({ data: { data: versions, current_page: 1, last_page: 1 } });
    act(() => {
        setOnline([{ id: 2, name: 'Mary Manager', page: 'expenses', project_id: null, projects: [7] }]);
        setActiveProjectId(7);
        closeHistory();
    });
});

describe('PageActivityPanel', () => {
    it("shows who is here and this page's latest five changes in the picked project", async () => {
        render(<PageActivityPanel />);
        expect(screen.getByText('Mary Manager', { selector: 'li' })).toBeInTheDocument();
        expect(await screen.findByText('Expense 1')).toBeInTheDocument();
        expect(screen.getByText('Expense 5')).toBeInTheDocument();
        expect(screen.queryByText('Expense 6')).toBeNull();
        expect(axiosMock.get).toHaveBeenCalledWith('/history', { params: { type: 'expense', project_id: '7' } });
    });

    it('opens the version history and the Share panel', async () => {
        render(<><PageActivityPanel /><HistoryState /></>);
        await screen.findByText('Expense 1');

        fireEvent.click(screen.getByRole('button', { name: 'Version history' }));
        expect(screen.getByLabelText('History open')).toHaveTextContent('true');

        fireEvent.click(screen.getByRole('button', { name: 'Share Kitengela site' }));
        expect(screen.getByRole('dialog')).toHaveTextContent('Share Kitengela site');
    });
});
