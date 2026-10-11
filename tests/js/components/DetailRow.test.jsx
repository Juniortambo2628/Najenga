import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import DetailRow from '../../../resources/js/Components/DetailRow';

describe('DetailRow', () => {
    it('renders a label and value', () => {
        render(<DetailRow label="Amount" value="1500" />);
        expect(screen.getByText('Amount')).toBeInTheDocument();
        expect(screen.getByText('1500')).toBeInTheDocument();
    });

    it('falls back to a dash when there is no value', () => {
        const { container } = render(<DetailRow label="Reference" />);
        expect(container.querySelector('span:last-child')).toHaveTextContent('-');
    });

    it('treats empty string as missing', () => {
        render(<DetailRow label="Ref" value="" />);
        expect(screen.getByText('Ref').nextElementSibling).toHaveTextContent('-');
    });

    it('applies font-mono only when mono is set', () => {
        const { rerender } = render(<DetailRow label="ID" value="abc" mono />);
        expect(screen.getByText('abc').className).toContain('font-mono');
        rerender(<DetailRow label="ID" value="abc" />);
        expect(screen.getByText('abc').className).not.toContain('font-mono');
    });
});
