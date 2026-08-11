import { useMemo } from 'react';

export default function useActiveProject(projects, activeProjectId) {
    return useMemo(
        () => projects.find(p => String(p.id) === String(activeProjectId)),
        [projects, activeProjectId]
    );
}
