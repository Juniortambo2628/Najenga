import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';

vi.mock('@inertiajs/react', () => ({}));

import { AlsoHere, OnlineAvatars, ProjectOnline, pageLabel } from '../../../resources/js/Components/OnlinePeople';
import { setOnline } from '../../../resources/js/Utils/presence';

const mary = { id: 2, name: 'Mary Manager', page: 'expenses', project_id: null, projects: [7] };
const eddy = { id: 3, name: 'Eddy Editor', page: 'projects', project_id: 7, projects: [7, 9] };

const at = (path) => window.history.pushState({}, '', path);

beforeEach(() => {
    act(() => setOnline([mary, eddy]));
    at('/');
});

describe('online people', () => {
    it('names pages as the sidebar does', () => {
        expect(pageLabel('expenses')).toBe('Expenses');
        expect(pageLabel('activity-logs')).toBe('Activity Logs');
        expect(pageLabel('something-new')).toBe('Something new');
    });

    it('shows collaborators online in the navbar, with where they are', () => {
        render(<OnlineAvatars />);
        expect(screen.getByRole('group', { name: '2 online in your projects' })).toBeInTheDocument();
        expect(screen.getByTitle('Mary Manager · Expenses')).toHaveTextContent('MM');
        expect(screen.getByTitle('Eddy Editor · Projects')).toBeInTheDocument();
    });

    it('shows nothing when nobody else is online', () => {
        act(() => setOnline([]));
        const { container } = render(<OnlineAvatars />);
        expect(container).toBeEmptyDOMElement();
    });

    it('says who else is on this page; on a project page, the same project', () => {
        at('/expenses');
        const { rerender } = render(<AlsoHere />);
        expect(screen.getByRole('status')).toHaveTextContent('Mary Manager is also here');

        at('/projects/7');
        rerender(<AlsoHere key="a" />);
        expect(screen.getByRole('status')).toHaveTextContent('Eddy Editor is also here');

        at('/projects/9');
        rerender(<AlsoHere key="b" />);
        expect(screen.queryByRole('status')).toBeNull();
    });

    it("puts each project's online people on its card", () => {
        render(<><ProjectOnline projectId={7} /><ProjectOnline projectId={9} /></>);
        expect(screen.getByRole('group', { name: '2 online in this project' })).toBeInTheDocument();
        expect(screen.getByRole('group', { name: '1 online in this project' })).toBeInTheDocument();
    });
});
