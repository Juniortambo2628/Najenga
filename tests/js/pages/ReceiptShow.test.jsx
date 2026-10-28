import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

const page = vi.hoisted(() => ({ props: { auth: { user: { id: 1, role: 'admin' }, projects: [] } }, component: 'Receipts/Show' }));
const router = vi.hoisted(() => ({ patch: vi.fn(), post: vi.fn(), delete: vi.fn(), reload: vi.fn(), visit: vi.fn() }));
vi.mock('@inertiajs/react', () => ({
    Head: () => null,
    Link: ({ href, children, ...rest }) => <a href={href} {...rest}>{children}</a>,
    usePage: () => page,
    router,
}));
vi.mock('@/Layouts/AuthenticatedLayout', () => ({ default: ({ children }) => children }));

import Show, { receiptChecks } from '../../../resources/js/Pages/Receipts/Show';

const expense = { id: 745, title: 'STEPHEN OJIAMBO EGESA', amount: 150000, currency: 'KES', reference_number: 'UICI066GHQ', recipient: 'STEPHEN OJIAMBO EGESA', expense_date: '2026-10-22', project: { name: 'Kisumu house' } };
const receipt = {
    id: 6,
    original_name: 'UICI066GHQ_STEPHEN_OJIAMBO_EGESA.jpg',
    filename: 'UICI066GHQ_STEPHEN_OJIAMBO_EGESA.jpg',
    mime_type: 'image/jpeg',
    verification_status: 'pending',
    extracted_amount: '150000.00',
    extracted_receipt_id: 'UICI066GHQ',
    extracted_merchant: 'Stephen Ojiambo Egesa',
    extracted_text: 'your MPESA transfer of KES. 150000.00 …',
    ocr_confidence: '0.92',
    ocr_provider: 'cloud-ocr-space',
    created_at: '2026-10-22T10:00:00Z',
    expense,
};

beforeEach(() => {
    router.patch.mockReset();
    router.post.mockReset();
});

describe('receiptChecks', () => {
    it('says whether what was read agrees with the expense', () => {
        const [, amount, ref, read] = receiptChecks(receipt, expense);
        expect(amount.hint).not.toMatch(/expense says/);
        expect(ref).toMatchObject({ value: 'Matches', hint: 'UICI066GHQ' });
        expect(read).toMatchObject({ value: '92%', hint: 'cloud-ocr-space' });

        const off = receiptChecks({ ...receipt, extracted_amount: '15000.00', extracted_receipt_id: 'NUMBER' }, expense);
        expect(off[1].hint).toMatch(/expense says/);
        expect(off[2]).toMatchObject({ value: 'Differs', hint: 'NUMBER, expense says UICI066GHQ' });
    });

    it('reads as not read yet when OCR found nothing', () => {
        const checks = receiptChecks({ ...receipt, extracted_amount: null, extracted_receipt_id: null, ocr_confidence: null, ocr_provider: null }, expense);
        expect(checks[1]).toMatchObject({ value: '—', hint: 'Nothing read yet' });
        expect(checks[3]).toMatchObject({ value: '—', hint: 'Not read yet' });
    });
});

describe('Receipt page', () => {
    it('shows the file, what was read and the expense on the shared layout', () => {
        render(<Show receipt={receipt} fileUrl="/storage/12/slip.jpg" />);

        expect(screen.getByRole('heading', { level: 1, name: 'Stephen Ojiambo Egesa' })).toBeInTheDocument();
        expect(screen.getByRole('img', { name: receipt.original_name })).toHaveAttribute('src', '/storage/12/slip.jpg');
        expect(screen.getAllByText('What we read').length).toBeGreaterThan(0);
        expect(screen.getAllByText('Kisumu house').length).toBeGreaterThan(0);
        expect(screen.getByRole('link', { name: 'Open Expense' })).toHaveAttribute('href', '/expenses/745');
        fireEvent.click(screen.getByRole('button', { name: 'More actions' }));
        expect(screen.getByRole('link', { name: 'Download' })).toHaveAttribute('download');
    });

    it('verifies and reads the receipt again from the toolbar', () => {
        render(<Show receipt={receipt} fileUrl="/storage/12/slip.jpg" />);

        fireEvent.click(screen.getByRole('button', { name: 'Mark Verified' }));
        expect(router.patch).toHaveBeenCalledWith('/receipts/6', { verification_status: 'verified' }, expect.any(Object));
    });

    it('says when the file is gone', () => {
        render(<Show receipt={{ ...receipt, expense: null }} fileUrl={null} />);
        expect(screen.getByText('No file')).toBeInTheDocument();
        expect(screen.queryByRole('link', { name: 'Open Expense' })).not.toBeInTheDocument();
    });
});
