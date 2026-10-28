import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';

const page = vi.hoisted(() => ({ props: { auth: { user: { id: 1, role: 'admin' }, projects: [] }, flash: {} }, component: 'Expenses/Show' }));
vi.mock('@inertiajs/react', () => ({
    Head: () => null,
    Link: ({ href, children, ...rest }) => <a href={href} {...rest}>{children}</a>,
    usePage: () => page,
    router: { reload: vi.fn(), visit: vi.fn(), patch: vi.fn(), post: vi.fn(), delete: vi.fn(), on: () => () => {} },
}));
vi.mock('@/Layouts/AuthenticatedLayout', () => ({ default: ({ children }) => children }));
vi.mock('axios', () => ({ default: { post: vi.fn(), delete: vi.fn() } }));

import FilePreview from '../../../resources/js/Components/FilePreview';
import ExpenseShow from '../../../resources/js/Pages/Expenses/Show';
import PhotoShow from '../../../resources/js/Pages/Photos/Show';
import DocumentShow, { formatFileSize } from '../../../resources/js/Pages/Documents/Show';
import TimelineShow, { milestoneDays } from '../../../resources/js/Pages/Timeline/Show';
import UserShow from '../../../resources/js/Pages/Users/Show';

const sidePanel = () => screen.getByRole('complementary');

describe('FilePreview', () => {
    it('shows images, frames PDFs, offers anything else as a download', () => {
        const { rerender } = render(<FilePreview url="/storage/1/slip.jpg" name="Slip" />);
        expect(screen.getByRole('img', { name: 'Slip' })).toHaveAttribute('src', '/storage/1/slip.jpg');

        rerender(<FilePreview url="/storage/2/plan" mime="application/pdf" name="Plan" />);
        expect(screen.getByTitle('Plan').tagName).toBe('IFRAME');

        rerender(<FilePreview url="/storage/3/boq.xlsx" name="BoQ" />);
        expect(screen.getByRole('link', { name: /Download/ })).toHaveAttribute('download');

        rerender(<FilePreview url={null} empty={{ icon: 'fa-file', title: 'No file', message: 'Nothing here' }} />);
        expect(screen.getByText('Nothing here')).toBeInTheDocument();
    });
});

describe('detail pages on the shared layout', () => {
    const expense = {
        id: 3, title: 'BAMBURI HARDWARE', amount: 32000, currency: 'KES', status: 'paid', expense_date: '2026-10-20', time: '14:05',
        payment_method: 'mpesa', reference_number: 'TJ4AB12CDE', recipient: 'BAMBURI HARDWARE', category: 'Materials', project_id: 7,
        project: { id: 7, name: 'Kitengela site' }, receipt_url: '/storage/9/slip.jpg', receipt: { id: 11, verification_status: 'verified' },
        description: 'Cement, 40 bags',
    };

    it('expense: figures as cards, receipt in the main panel, details in the side panel', () => {
        render(<ExpenseShow expense={expense} can={{ update: true }} />);

        expect(screen.getByRole('heading', { level: 1, name: 'Bamburi Hardware' })).toBeInTheDocument();
        expect(screen.getByText('Ksh 32,000')).toBeInTheDocument();
        expect(screen.getAllByText('Verified').length).toBeGreaterThan(0);
        expect(screen.getByRole('img', { name: 'Receipt for Bamburi Hardware' })).toBeInTheDocument();
        expect(within(sidePanel()).getByText('Cement, 40 bags')).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'Edit Expense' })).toHaveAttribute('href', '/expenses/3/edit');
        expect(screen.getByRole('link', { name: 'Check Receipt' })).toHaveAttribute('href', '/receipts/11');
        expect(screen.getByText('Replace')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Remove/ })).toBeInTheDocument();
    });

    it('expense without a receipt: a drop zone for editors, a note for viewers', () => {
        const { unmount } = render(<ExpenseShow expense={{ ...expense, receipt_url: null, receipt: null }} can={{ update: true }} />);
        expect(screen.getByText(/Drag & drop a receipt/)).toBeInTheDocument();
        unmount();

        render(<ExpenseShow expense={{ ...expense, receipt_url: null, receipt: null }} can={{ update: false }} />);
        expect(screen.getByText('No receipt is attached to this expense.')).toBeInTheDocument();
        expect(screen.queryByRole('link', { name: 'Edit Expense' })).toBeNull();
    });

    it('photo and document: the file fills the page, Download in the toolbar', () => {
        const { unmount } = render(<PhotoShow photo={{ id: 5, title: 'Slab', project_id: 9, project: { name: 'Ruiru flats' }, photo_url: '/p.jpg', is_featured: true }} can={{ update: false }} />);
        expect(screen.getByRole('img', { name: 'Slab' })).toHaveAttribute('src', '/p.jpg');
        expect(screen.getByText('Featured')).toBeInTheDocument();
        unmount();

        render(<DocumentShow document={{ id: 4, title: 'Site plan', mime_type: 'application/pdf', file_url: '/d.pdf', file_size: 2048 }} can={{ update: true }} />);
        expect(screen.getByTitle('Site plan').tagName).toBe('IFRAME');
        expect(within(sidePanel()).getByText('2.0 KB')).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'Edit Document' })).toBeInTheDocument();
    });

    it('milestone and person: cards on top, details in the main panel', () => {
        const { unmount } = render(<TimelineShow timeline={{ id: 2, title: 'Foundation', status: 'in_progress', start_date: '2026-10-01', end_date: '2026-10-10', project: { name: 'Kitengela site' } }} can={{ update: true }} />);
        expect(screen.getByText('10 days')).toBeInTheDocument();
        expect(screen.getAllByText('In Progress').length).toBeGreaterThan(0);
        expect(screen.getByRole('link', { name: 'Edit Milestone' })).toBeInTheDocument();
        unmount();

        render(<UserShow user={{ id: 8, first_name: 'Mary', last_name: 'Wanjiru', email: 'mary@example.com', role: 'manager', status: 'active', projects_count: 3 }} can={{ update: false }} />);
        expect(screen.getByRole('heading', { level: 1, name: 'Mary Wanjiru' })).toBeInTheDocument();
        expect(screen.getByText('Profile')).toBeInTheDocument();
        expect(screen.queryByRole('link', { name: 'Edit User' })).toBeNull();
    });

    it('works out sizes and lengths', () => {
        expect(formatFileSize(1536)).toBe('1.5 KB');
        expect(formatFileSize(null)).toBeNull();
        expect(milestoneDays('2026-10-01', '2026-10-01')).toBe(1);
        expect(milestoneDays('2026-10-01', null, new Date('2026-10-05'))).toBe(5);
        expect(milestoneDays(null, null)).toBeNull();
    });
});
