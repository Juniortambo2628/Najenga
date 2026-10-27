import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';

const page = vi.hoisted(() => ({ props: { auth: { projects: [] } } }));
vi.mock('@inertiajs/react', () => ({ usePage: () => page }));

import useRole from '../../../resources/js/Hooks/useRole';

page.props.auth.projects = [
    { id: 1, name: 'Mine', role: 'owner' },
    { id: 2, name: 'Shared', role: 'viewer' },
    { id: 3, name: 'Team', role: 'editor' },
];

describe('useRole', () => {
    it('reads the role for a project', () => {
        expect(renderHook(() => useRole(1)).result.current).toMatchObject({ role: 'owner', canEdit: true, canManage: true });
        expect(renderHook(() => useRole('3')).result.current).toMatchObject({ role: 'editor', canEdit: true, canManage: false });
    });

    it('makes viewers read-only', () => {
        expect(renderHook(() => useRole(2)).result.current).toMatchObject({ role: 'viewer', canEdit: false, canManage: false, isViewer: true });
    });

    it('gives no rights in a project the user is not in', () => {
        expect(renderHook(() => useRole(99)).result.current).toMatchObject({ role: null, canEdit: false });
    });

    it('lets people edit their own records when no project is chosen', () => {
        expect(renderHook(() => useRole(null)).result.current).toMatchObject({ canEdit: true });
    });
});
