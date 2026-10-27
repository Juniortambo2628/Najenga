import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import SummaryCards from '../../../resources/js/Components/SummaryCards';

describe('SummaryCards', () => {
    it('renders nothing without cards', () => {
        const { container } = render(<SummaryCards cards={[]} />);
        expect(container).toBeEmptyDOMElement();
    });

    it('renders each card with its value and hint', () => {
        render(
            <SummaryCards
                cards={[
                    { label: 'Total', value: '12', icon: 'fa-receipt', hint: 'all time' },
                    { label: 'Pending', value: '3', icon: 'fa-clock' },
                ]}
            />,
        );
        expect(screen.getByText('Total')).toBeInTheDocument();
        expect(screen.getByText('12')).toBeInTheDocument();
        expect(screen.getByText('all time')).toBeInTheDocument();
        expect(screen.queryByRole('button')).toBeNull();
    });

    it('makes a card with onClick a pressable filter', () => {
        const onClick = vi.fn();
        render(
            <SummaryCards
                cards={[
                    { label: 'Pending', value: '3', icon: 'fa-clock', onClick, active: true },
                    { label: 'Verified', value: '9', icon: 'fa-check', onClick: vi.fn(), active: false },
                ]}
            />,
        );
        const pending = screen.getByRole('button', { name: /Pending/ });
        expect(pending).toHaveAttribute('aria-pressed', 'true');
        expect(screen.getByRole('button', { name: /Verified/ })).toHaveAttribute('aria-pressed', 'false');
        fireEvent.click(pending);
        expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('stacks one per row on phones when asked', () => {
        const cards = [1, 2, 3, 4].map((n) => ({ label: `C${n}`, value: n, icon: 'fa-receipt' }));
        const { container, rerender } = render(<SummaryCards cards={cards} />);
        expect(container.firstChild.className).toMatch(/(^| )grid-cols-2 xl:grid-cols-4/);
        rerender(<SummaryCards cards={cards} stackOnPhones />);
        expect(container.firstChild.className).toContain('grid-cols-1 sm:grid-cols-2 xl:grid-cols-4');
    });
});
