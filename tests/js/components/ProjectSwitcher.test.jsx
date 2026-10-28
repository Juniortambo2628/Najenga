import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';

const page = vi.hoisted(() => ({ props: { auth: { user: { id: 1 }, projects: [] } } }));
vi.mock('@inertiajs/react', () => ({
    usePage: () => page,
    Link: ({ href, children, ...rest }) => <a href={href} {...rest}>{children}</a>,
    router: { visit: vi.fn(), reload: vi.fn() },
}));
vi.mock('../../../resources/js/Components/SharePanel', () => ({
    default: ({ show, project }) => (show ? <div role="dialog">Members of {project.name}</div> : null),
    RoleBadge: ({ role }) => <span>{role}</span>,
}));

import ProjectSwitcher from '../../../resources/js/Components/ProjectSwitcher';
import useActiveProjectId from '../../../resources/js/Hooks/useActiveProjectId';
import { setActiveProjectId } from '../../../resources/js/Utils/activeProject';

function Shown() {
    const [id] = useActiveProjectId();
    return <output aria-label="Active project">{id ?? 'all'}</output>;
}

beforeEach(() => {
    page.props.auth.projects = [
        { id: 7, name: 'Kitengela site', role: 'owner' },
        { id: 9, name: 'Ruiru flats', role: 'viewer' },
    ];
    act(() => setActiveProjectId(null));
    window.localStorage.clear();
});

describe('ProjectSwitcher', () => {
    it('picks a project for every page, and remembers it', () => {
        render(<><ProjectSwitcher /><Shown /></>);
        expect(screen.getByRole('button', { name: /Project: All projects/ })).toBeInTheDocument();

        fireEvent.click(screen.getByRole('button', { name: /Change project/ }));
        expect(screen.getByRole('menuitem', { name: /Ruiru flats/ })).toHaveTextContent('viewer');
        fireEvent.click(screen.getByRole('menuitem', { name: /Kitengela site/ }));

        expect(screen.getByLabelText('Active project')).toHaveTextContent('7');
        expect(screen.getByRole('button', { name: /Project: Kitengela site/ })).toBeInTheDocument();
        expect(window.localStorage.getItem('najenga.activeProject')).toBe('7');
    });

    it('offers the overview and sharing for the picked project', () => {
        act(() => setActiveProjectId(7));
        render(<ProjectSwitcher />);
        fireEvent.click(screen.getByRole('button', { name: /Change project/ }));
        expect(screen.getByRole('menuitem', { name: 'Overview of Kitengela site' })).toHaveAttribute('href', '/overview');
        fireEvent.click(screen.getByRole('menuitem', { name: 'Share…' }));
        expect(screen.getByRole('dialog')).toHaveTextContent('Members of Kitengela site');
    });

    it('falls back to all projects when the remembered one is gone', () => {
        act(() => setActiveProjectId(42));
        render(<><ProjectSwitcher /><Shown /></>);
        expect(screen.getByLabelText('Active project')).toHaveTextContent('all');
        expect(screen.getByRole('button', { name: /Project: All projects/ })).toBeInTheDocument();
    });

    it('is hidden for someone with no projects', () => {
        page.props.auth.projects = [];
        const { container } = render(<ProjectSwitcher />);
        expect(container).toBeEmptyDOMElement();
    });
});
