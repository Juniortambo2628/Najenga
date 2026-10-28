import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

const page = vi.hoisted(() => ({ props: { auth: { projects: [] } } }));
vi.mock('@inertiajs/react', () => ({ usePage: () => page }));

import useVisibleActions, { visibleActions } from '../../../resources/js/Hooks/useVisibleActions';
import { setActiveProjectId } from '../../../resources/js/Utils/activeProject';

const actions = [
    { id: 'add', label: 'Add' },
    { id: 'export', label: 'Export', readOnly: true },
    { id: 'delete', label: 'Delete' },
];

beforeEach(() => {
    page.props.auth.projects = [
        { id: 1, name: 'Mine', role: 'owner' },
        { id: 2, name: 'Shared with me', role: 'viewer' },
        { id: 3, name: 'Helping out', role: 'editor' },
    ];
    act(() => setActiveProjectId(null));
});

describe('visibleActions', () => {
    it('keeps everything for editors and only read-only actions for viewers', () => {
        expect(visibleActions(actions, true)).toEqual(actions);
        expect(visibleActions(actions, false).map((a) => a.id)).toEqual(['export']);
    });
});

describe('useVisibleActions', () => {
    it('follows the project picked in the navbar', () => {
        const { result } = renderHook(() => useVisibleActions());
        expect(result.current.canEdit).toBe(true); // all projects

        act(() => setActiveProjectId(2));
        expect(result.current.canEdit).toBe(false);
        expect(result.current.visible(actions).map((a) => a.id)).toEqual(['export']);

        act(() => setActiveProjectId(3));
        expect(result.current.canEdit).toBe(true);
    });

    it("judges each record by its own project's role", () => {
        const { result } = renderHook(() => useVisibleActions());
        const { canEditRecord, visible } = result.current;
        expect(canEditRecord({ project_id: 1 })).toBe(true);
        expect(canEditRecord({ project_id: 3 })).toBe(true);
        expect(canEditRecord({ project_id: 2 })).toBe(false);
        // No project, or one you are no longer in: only your own records reach the list.
        expect(canEditRecord({ project_id: null })).toBe(true);
        expect(canEditRecord({ project_id: 99 })).toBe(true);

        expect(visible(actions, canEditRecord({ project_id: 2 })).map((a) => a.id)).toEqual(['export']);
    });
});
