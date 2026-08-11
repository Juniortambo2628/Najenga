import { useMemo } from 'react';

export default function useFilteredItems(items, { projectId, searchQuery, sortFn, searchFields = ['title'] } = {}) {
    return useMemo(() => {
        let filtered = [...items];

        if (projectId) {
            filtered = filtered.filter(item => String(item.project_id) === String(projectId));
        }

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(item =>
                searchFields.some(field => {
                    const value = item[field];
                    return value && String(value).toLowerCase().includes(query);
                })
            );
        }

        if (sortFn) {
            filtered.sort(sortFn);
        }

        return filtered;
    }, [items, projectId, searchQuery, sortFn, searchFields]);
}
