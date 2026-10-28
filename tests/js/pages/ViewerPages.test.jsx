import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, within, act } from '@testing-library/react';

// A viewer of "Ruiru flats" and owner of "Kitengela site".
const page = vi.hoisted(() => ({
    props: {
        auth: {
            user: { id: 1, role: 'client' },
            projects: [
                { id: 7, name: 'Kitengela site', role: 'owner' },
                { id: 9, name: 'Ruiru flats', role: 'viewer' },
            ],
        },
        flash: {},
    },
    url: '/photos',
}));
vi.mock('@inertiajs/react', () => ({
    Head: () => null,
    Link: ({ href, children, ...rest }) => <a href={href} {...rest}>{children}</a>,
    usePage: () => page,
    router: { visit: vi.fn(), reload: vi.fn(), get: vi.fn(), delete: vi.fn(), on: () => () => {} },
}));
vi.mock('@/Layouts/AuthenticatedLayout', () => ({ default: ({ children }) => <div>{children}</div> }));
vi.mock('@/Components/SharePanel', () => ({ default: () => null }));

import Photos from '../../../resources/js/Pages/Photos';
import Overview from '../../../resources/js/Pages/Overview';
import DocumentShow from '../../../resources/js/Pages/Documents/Show';
import PhotoShow from '../../../resources/js/Pages/Photos/Show';
import { editableProjects } from '../../../resources/js/Hooks/useVisibleActions';
import { setActiveProjectId } from '../../../resources/js/Utils/activeProject';

const photo = (id, projectId, title) => ({
    id, title, project_id: projectId, project_name: projectId === 9 ? 'Ruiru flats' : 'Kitengela site',
    file_path: `/storage/${id}.jpg`, thumb_url: `/storage/${id}.jpg`, photo_date: 'Oct 01, 2026', original_name: `${id}.jpg`,
});
const photos = [photo(1, 9, 'Ruiru slab'), photo(2, 7, 'Kitengela wall')];

beforeEach(() => act(() => setActiveProjectId(null)));

describe('pages as a viewer', () => {
    it('Photos: no upload, delete or bulk delete in a project you only view', () => {
        act(() => setActiveProjectId(9));
        render(<Photos photos={photos} projects={page.props.auth.projects} />);

        const toolbar = screen.getByRole('toolbar', { name: 'Page tools' });
        expect(within(toolbar).queryByRole('link', { name: /Upload Photo/ })).toBeNull();

        fireEvent.contextMenu(screen.getByText('Ruiru slab'));
        expect(screen.getByRole('menuitem', { name: /Download/ })).toBeInTheDocument();
        expect(screen.queryByRole('menuitem', { name: /Delete/ })).toBeNull();
    });

    it("Photos: under all projects, each photo follows its own project's role", () => {
        render(<Photos photos={photos} projects={page.props.auth.projects} />);
        expect(within(screen.getByRole('toolbar', { name: 'Page tools' })).getByRole('link', { name: /Upload Photo/ })).toBeInTheDocument();

        fireEvent.contextMenu(screen.getByText('Kitengela wall'));
        expect(screen.getByRole('menuitem', { name: /Delete/ })).toBeInTheDocument();
        fireEvent.keyDown(screen.getByRole('menu'), { key: 'Escape' });

        fireEvent.contextMenu(screen.getByText('Ruiru slab'));
        expect(screen.queryByRole('menuitem', { name: /Delete/ })).toBeNull();
    });

    const overviewProject = (id, name, role, extra = {}) => ({
        id, name, status: 'active', location: null, budget: 0, spent: 0, currency: 'KES', my_role: role, can_delete: role === 'owner',
        counts: { expenses: 0, photos: 0, documents: 0, milestones: 0 }, members: [], recent: { expenses: [], photos: [], documents: [] }, ...extra,
    });
    const overviewProjects = [overviewProject(7, 'Kitengela site', 'owner'), overviewProject(9, 'Ruiru flats', 'viewer')];

    it('Overview: a project you only view has no Edit or Delete, and Members only shows the team', () => {
        act(() => setActiveProjectId(9));
        render(<Overview projects={overviewProjects} />);
        const toolbar = screen.getByRole('toolbar', { name: 'Page tools' });
        expect(within(toolbar).queryByRole('link', { name: /Edit Project/ })).toBeNull();
        expect(within(toolbar).queryByRole('button', { name: /Delete Project/ })).toBeNull();
        expect(within(toolbar).getByRole('button', { name: /Members/ })).toBeInTheDocument();
    });

    it('Overview: the owner gets Edit, Share and Delete', () => {
        act(() => setActiveProjectId(7));
        render(<Overview projects={overviewProjects} />);
        const toolbar = screen.getByRole('toolbar', { name: 'Page tools' });
        expect(within(toolbar).getByRole('link', { name: /Edit Project/ })).toHaveAttribute('href', '/projects/7/edit');
        expect(within(toolbar).getByRole('button', { name: /Share/ })).toBeInTheDocument();
        expect(within(toolbar).getByRole('button', { name: /Delete Project/ })).toBeInTheDocument();
    });

    it('Document and photo pages: Edit only when the server says you can', () => {
        const document = { id: 4, title: 'Site plan', project: { name: 'Ruiru flats' }, mime_type: 'application/pdf', created_at: '2026-10-01T08:00:00Z' };
        const { unmount } = render(<DocumentShow document={document} can={{ update: false }} />);
        expect(screen.queryByRole('link', { name: /Edit/ })).toBeNull();
        unmount();
        render(<DocumentShow document={document} can={{ update: true }} />);
        expect(screen.getAllByRole('link', { name: /Edit/ }).length).toBeGreaterThan(0);

        const photo = { id: 5, title: 'Slab', project: { name: 'Ruiru flats' }, photo_url: '/p.jpg', created_at: '2026-10-01T08:00:00Z' };
        render(<PhotoShow photo={photo} can={{ update: false }} />);
        expect(screen.queryByRole('link', { name: /Edit Photo/ })).toBeNull();
    });

    it("forms only offer projects you can edit", () => {
        expect(editableProjects(page.props.auth.projects).map((p) => p.name)).toEqual(['Kitengela site']);
    });
});
