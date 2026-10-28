import { describe, it, expect, vi } from 'vitest';

vi.mock('@inertiajs/react', () => ({
    Head: () => null,
    Link: ({ children }) => children,
    router: { get: vi.fn(), reload: vi.fn() },
    useForm: () => ({ data: {}, setData: vi.fn(), reset: vi.fn() }),
    usePage: () => ({ props: { auth: { user: { id: 1 }, projects: [] } }, component: 'Expenses' }),
}));
vi.mock('react-pdf', () => ({ Document: () => null, Page: () => null, pdfjs: { GlobalWorkerOptions: {} } }));
vi.mock('@/Layouts/AuthenticatedLayout', () => ({ default: ({ children }) => children }));

import { expenseViews, spendingSummary } from '../../../resources/js/Pages/Expenses';
import { photoViews } from '../../../resources/js/Pages/Photos';
import { folderTree } from '../../../resources/js/Pages/Documents';
import { userViews } from '../../../resources/js/Pages/Users/Index';

const byId = (views) => Object.fromEntries(views.map((v) => [v.id, v]));

describe('the Spending panel', () => {
    const expenses = [
        { id: 1, category: 'materials', amount: 100, currency: 'KES', receipt_url: '/r/1.jpg' },
        { id: 2, category: 'materials', amount: 50, currency: 'KES', receipt_url: null },
        { id: 3, category: 'labour', amount: 25, currency: 'KES', receipt_url: null },
    ];

    it('counts everything, receipts and each category', () => {
        const views = byId(expenseViews(expenses));
        expect(views.all.count).toBe(3);
        expect(views['no-receipt'].count).toBe(2);
        expect(views['has-receipt'].count).toBe(1);
        expect(views['category:materials']).toMatchObject({ label: 'Materials', group: 'Category', count: 2, icon: 'fa-cubes' });
        expect(views['category:labour'].count).toBe(1);
    });

    it('totals one currency, and only counts mixed ones', () => {
        expect(spendingSummary(expenses, 175)).toMatch(/175 across 3 expenses$/);
        expect(spendingSummary([...expenses, { id: 4, currency: 'USD' }], 175)).toBe('4 expenses');
    });
});

describe('the Library panel', () => {
    const now = new Date('2026-10-28T12:00:00');
    const photos = [
        { id: 1, photo_date: 'Oct 20, 2026', date_source: 'exif' },
        { id: 2, photo_date: 'Mar 02, 2026', date_source: 'filename' },
        { id: 3, photo_date: 'Dec 24, 2025', date_source: 'upload' },
    ];

    it('sorts photos by when they were taken and how sure the date is', () => {
        const views = byId(photoViews(photos, now));
        expect(views['this-month'].count).toBe(1);
        expect(views['this-year'].count).toBe(1);
        expect(views.older.count).toBe(1);
        expect(views.exact.count).toBe(1);
        expect(views.estimated.count).toBe(2);
    });
});

describe('the Folders panel', () => {
    it('lists the top level, then each folder after its parent, with what is directly in it', () => {
        const folders = [
            { id: 2, name: 'Plans', parent_id: null },
            { id: 3, name: 'Electrical', parent_id: 2 },
            { id: 1, name: 'Contracts', parent_id: null },
        ];
        const documents = [{ folder_id: null }, { folder_id: 3 }, { folder_id: 3 }, { folder_id: 1 }];
        const rows = folderTree(folders, documents);
        expect(rows.map((r) => r.label)).toEqual(['Top level', 'Contracts', 'Plans', 'Electrical']);
        expect(rows.map((r) => r.count)).toEqual([1, 1, 0, 2]);
        expect(rows[3]).toMatchObject({ id: 'folder:3', description: 'in Plans' });
    });
});

describe('the People panel', () => {
    it('counts by role and by status', () => {
        const views = byId(
            userViews([
                { role: 'admin', status: 'active' },
                { role: 'client', status: 'active' },
                { role: 'client', status: 'suspended' },
            ]),
        );
        expect(views.all.count).toBe(3);
        expect(views['role:client'].count).toBe(2);
        expect(views['status:suspended'].count).toBe(1);
        expect(views['role:manager'].count).toBe(0);
    });
});
