import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';

const page = vi.hoisted(() => ({
    props: { auth: { user: { id: 1 }, projects: [{ id: 7, name: 'Kitengela site', role: 'owner' }, { id: 9, name: 'Ruiru flats', role: 'viewer' }] } },
}));
vi.mock('@inertiajs/react', () => ({ usePage: () => page, router: { reload: vi.fn(), visit: vi.fn() } }));
vi.mock('@/Components/SharePanel', () => ({
    default: ({ project }) => <div role="dialog">Members of {project.name}</div>,
    RoleBadge: ({ role }) => <span>{role}</span>,
}));

import NavbarShare from '../../../resources/js/Components/NavbarShare';
import { setActiveProjectId } from '../../../resources/js/Utils/activeProject';

beforeEach(() => act(() => setActiveProjectId(null)));

describe('the navbar Share button', () => {
    it('shares the project picked in the switcher', () => {
        act(() => setActiveProjectId(7));
        render(<NavbarShare />);
        fireEvent.click(screen.getByRole('button', { name: 'Share: Kitengela site' }));
        expect(screen.getByRole('dialog')).toHaveTextContent('Members of Kitengela site');
    });

    it('says Members for a project you only view', () => {
        act(() => setActiveProjectId(9));
        render(<NavbarShare />);
        expect(screen.getByRole('button', { name: 'Members: Ruiru flats' })).toBeInTheDocument();
    });

    it('asks which project on All projects', () => {
        render(<NavbarShare />);
        fireEvent.click(screen.getByRole('button', { name: 'Share a project' }));
        fireEvent.click(screen.getByRole('menuitem', { name: /Ruiru flats/ }));
        expect(screen.getByRole('dialog')).toHaveTextContent('Members of Ruiru flats');
    });
});
