import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';

const deleteMock = vi.fn((url, { onSuccess }) => onSuccess());
const reloadMock = vi.fn();

vi.mock('@inertiajs/react', () => ({
    Head: () => null,
    Link: ({ href, children, ...rest }) => <a href={href} {...rest}>{children}</a>,
    usePage: () => ({ props: { auth: { user: { role: 'admin' } }, flash: {} }, url: '/receipts', component: 'Receipts/Index' }),
    router: { delete: (...args) => deleteMock(...args), reload: (...args) => reloadMock(...args), get: vi.fn() },
}));
vi.mock('@/Layouts/AuthenticatedLayout', () => ({ default: ({ children }) => <div>{children}</div> }));

import Receipts from '../../../resources/js/Pages/Receipts/Index';

const receipts = [
    { id: 3, expense_id: 30, filename: 'mpesa-3.jpg', verification_status: 'pending', created_at: '2026-10-03' },
    { id: 2, expense_id: 20, filename: 'hardware-2.jpg', verification_status: 'auto_verified', created_at: '2026-10-02' },
    { id: 1, expense_id: 10, filename: 'cement-1.jpg', verification_status: 'rejected', created_at: '2026-10-01' },
];

beforeEach(() => {
    deleteMock.mockClear();
    reloadMock.mockClear();
    vi.spyOn(window, 'confirm').mockReturnValue(true);
});

describe('Receipts', () => {
    it('searches and filters by status from the toolbar', () => {
        render(<Receipts receipts={receipts} />);
        fireEvent.change(screen.getByRole('searchbox', { name: 'Search receipts' }), { target: { value: 'cement' } });
        expect(screen.getByText('cement-1.jpg')).toBeInTheDocument();
        expect(screen.queryByText('mpesa-3.jpg')).toBeNull();

        fireEvent.change(screen.getByRole('searchbox', { name: 'Search receipts' }), { target: { value: '' } });
        fireEvent.click(screen.getByRole('button', { name: /Filters/ }));
        fireEvent.change(screen.getByLabelText('Status'), { target: { value: 'auto_verified' } });
        expect(screen.getByText('hardware-2.jpg')).toBeInTheDocument();
        expect(screen.queryByText('cement-1.jpg')).toBeNull();
    });

    it('selects several rows and deletes them together', async () => {
        render(<Receipts receipts={receipts} />);
        fireEvent.click(screen.getByRole('checkbox', { name: 'Select receipt #3' }));
        fireEvent.click(screen.getByRole('checkbox', { name: 'Select receipt #1' }));
        const toolbar = screen.getByRole('toolbar', { name: 'Page tools' });
        expect(within(toolbar).getByText('2 selected')).toBeInTheDocument();

        fireEvent.click(within(toolbar).getByRole('button', { name: 'Delete Selected' }));
        await vi.waitFor(() => expect(deleteMock).toHaveBeenCalledTimes(2));
        expect(deleteMock.mock.calls.map(([url]) => url)).toEqual(['/receipts/3', '/receipts/1']);
        await vi.waitFor(() => expect(reloadMock).toHaveBeenCalledWith({ only: ['receipts'] }));
    });
});
