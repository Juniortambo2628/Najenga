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
});
