import { usePage } from '@inertiajs/react';

const EDIT = ['owner', 'editor'];
const MANAGE = ['owner'];

/**
 * The current user's role in one project (from the shared `auth.projects`),
 * and what it allows. Without a project id (e.g. "All projects") the person
 * works on their own records, so they can edit.
 *
 *   const { role, canEdit, canManage } = useRole(project.id);
 *   {canEdit && <button onClick={...}>Delete</button>}
 */
export default function useRole(projectId) {
    const projects = usePage().props.auth?.projects ?? [];
    if (projectId == null || projectId === '') {
        return { role: null, canEdit: true, canManage: true, isViewer: false };
    }
    const role = projects.find((p) => String(p.id) === String(projectId))?.role ?? null;
    return {
        role,
        canEdit: EDIT.includes(role),
        canManage: MANAGE.includes(role),
        isViewer: role === 'viewer',
    };
}
