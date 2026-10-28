import { describe, it, expect, vi } from 'vitest';

vi.mock('@inertiajs/react', () => ({ Head: () => null, Link: ({ children }) => children, router: { get: vi.fn() } }));
vi.mock('@/Layouts/AuthenticatedLayout', () => ({ default: ({ children }) => children }));

import { activeView, activityViews } from '../../../resources/js/Pages/WhatsApp/Activity';

describe('the WhatsApp side panel', () => {
    it('offers everything, then each direction and status, with counts where known', () => {
        const views = activityViews({ inbound: 4, outbound: 2, failed: 1 });
        expect(views[0].id).toBe('all');
        expect(views.find((v) => v.id === 'direction:inbound')).toMatchObject({ group: 'Direction', count: 4 });
        expect(views.find((v) => v.id === 'status:failed')).toMatchObject({ group: 'Status', count: 1 });
    });

    it('reads the active view from the server filters', () => {
        expect(activeView({ direction: 'all', status: 'all' })).toBe('all');
        expect(activeView({ direction: 'inbound', status: '' })).toBe('direction:inbound');
        expect(activeView({ direction: '', status: 'failed' })).toBe('status:failed');
    });
});
