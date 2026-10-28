import { usePage } from '@inertiajs/react';
import { setActiveProjectId, useActiveProjectStore } from '@/Utils/activeProject';

/**
 * The project picked in the navbar switcher, as [id, setId]. The id is null
 * for "All projects", and also when the remembered project is no longer one
 * the user can see (left, removed, deleted).
 *
 *   const [projectId, setProjectId] = useActiveProjectId();
 *   const filtered = useFilteredItems(items, { projectId });
 */
export default function useActiveProjectId() {
    const stored = useActiveProjectStore();
    const projects = usePage().props.auth?.projects ?? [];
    const id = stored && projects.some((p) => String(p.id) === stored) ? stored : null;
    return [id, setActiveProjectId];
}
