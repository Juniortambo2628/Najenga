import { useCallback, useMemo } from 'react';
import { usePage } from '@inertiajs/react';
import useActiveProjectId from '@/Hooks/useActiveProjectId';
import useRole from '@/Hooks/useRole';

const EDIT = ['owner', 'manager', 'editor'];

/** Keep only the actions a read-only person may use: those marked `readOnly`. */
export function visibleActions(actions, canEdit) {
    return canEdit ? actions : actions.filter((action) => action.readOnly);
}

/**
 * Which actions to show: everything for people who can edit, and only the
 * `readOnly` ones (view, export, download) for viewers. Mirrors the server's
 * policies; the server still refuses whatever a hidden button would send.
 *
 *   const { canEdit, visible, canEditRecord } = useVisibleActions();
 *   toolbar={{ actions: visible([
 *       { id: 'add', label: 'Add Expense', ... },
 *       { id: 'export', label: 'Export CSV', readOnly: true, ... },
 *   ]) }}
 *   <ContextMenu options={visible(rowOptions, canEditRecord(row))} />
 *
 * `canEdit` follows the project picked in the navbar ("All projects": yes).
 * `canEditRecord(record)` follows the record's own project: a viewer there
 * can't change it; a record outside any of your projects is your own.
 */
export default function useVisibleActions() {
    const projects = usePage().props.auth?.projects ?? [];
    const [activeProjectId] = useActiveProjectId();
    const { canEdit } = useRole(activeProjectId);

    const roles = useMemo(() => new Map(projects.map((p) => [String(p.id), p.role])), [projects]);

    const canEditRecord = useCallback(
        (record) => {
            if (record?.project_id == null) return true;
            const role = roles.get(String(record.project_id));
            return role === undefined || EDIT.includes(role);
        },
        [roles],
    );

    const visible = useCallback((actions, allowed = canEdit) => visibleActions(actions, allowed), [canEdit]);

    return { canEdit, visible, canEditRecord };
}
