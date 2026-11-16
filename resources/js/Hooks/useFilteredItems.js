import { useFilteredItems as useKitFilteredItems } from '@okjt/dashboard';

/**
 * Najenga's list filter, on the OKJT kit's useFilteredItems (kit 0.8):
 * a project (projectId, as the kit's `where: { project_id }`), a search over
 * chosen fields (by default the title, as before), and an order.
 *
 *   useFilteredItems(expenses, { projectId, searchQuery, searchFields: ['title', 'recipient'], sortFn })
 */
export default function useFilteredItems(items, { projectId, searchQuery, sortFn, searchFields = ['title'] } = {}) {
    return useKitFilteredItems(items, { where: { project_id: projectId }, searchQuery, sortFn, searchFields });
}
