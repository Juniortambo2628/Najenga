import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

const getMock = vi.fn();

vi.mock('@inertiajs/react', () => ({
    Head: () => null,
    router: {
        get: (...args) => getMock(...args),
    },
}));

import Errors from '../../../resources/js/Pages/Errors';

beforeEach(() => {
    getMock.mockClear();
});

describe('Errors', () => {
    it('shows the copy for a 404', () => {
        render(<Errors status={404} />);
        expect(screen.getByRole('heading', { name: 'Page not found' })).toBeInTheDocument();
        expect(screen.getByText(/does not exist/)).toBeInTheDocument();
    });

    it('shows the copy for a 403', () => {
        render(<Errors status={403} />);
        expect(screen.getByRole('heading', { name: 'Access denied' })).toBeInTheDocument();
    });

    it('uses the same 500 heading as the blade page', () => {
        render(<Errors status={500} />);
        expect(screen.getByRole('heading', { name: 'Something went wrong' })).toBeInTheDocument();
    });

    it('falls back for a status it has no copy for', () => {
        render(<Errors status={418} />);
        expect(screen.getByRole('heading', { name: 'Something went wrong' })).toBeInTheDocument();
        expect(screen.getByText('418')).toBeInTheDocument();
    });

    it('defaults to 500 when no status is passed', () => {
        render(<Errors />);
        expect(screen.getByRole('heading', { name: 'Something went wrong' })).toBeInTheDocument();
    });

    it('sends the visitor home', () => {
        render(<Errors status={404} />);
        fireEvent.click(screen.getByRole('button', { name: /back to home/i }));
        expect(getMock).toHaveBeenCalledWith('/');
    });
});
