import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Button from '../../../resources/js/Components/Button';

describe('Button', () => {
    it('renders a button element by default', () => {
        render(<Button>Click me</Button>);
        const button = screen.getByRole('button', { name: /click me/i });
        expect(button).toBeInTheDocument();
        expect(button.tagName).toBe('BUTTON');
    });

    it('applies primary variant class by default', () => {
        render(<Button>Primary</Button>);
        const button = screen.getByRole('button');
        expect(button.className).toContain('bg-gradient-to-r');
    });

    it('applies secondary variant class', () => {
        render(<Button variant="secondary">Secondary</Button>);
        const button = screen.getByRole('button');
        expect(button.className).toContain('border-white/10');
    });

    it('applies danger variant class', () => {
        render(<Button variant="danger">Danger</Button>);
        const button = screen.getByRole('button');
        expect(button.className).toContain('bg-red-600');
    });

    it('applies ghost variant class', () => {
        render(<Button variant="ghost">Ghost</Button>);
        const button = screen.getByRole('button');
        expect(button.className).toContain('text-gray-400');
    });

    it('handles click events', () => {
        const handleClick = vi.fn();
        render(<Button onClick={handleClick}>Click</Button>);
        fireEvent.click(screen.getByRole('button'));
        expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('can be disabled', () => {
        const handleClick = vi.fn();
        render(<Button disabled onClick={handleClick}>Disabled</Button>);
        const button = screen.getByRole('button');
        expect(button).toBeDisabled();
        fireEvent.click(button);
        expect(handleClick).not.toHaveBeenCalled();
    });

    it('merges custom className', () => {
        render(<Button className="custom-class">Styled</Button>);
        const button = screen.getByRole('button');
        expect(button.className).toContain('custom-class');
    });

    it('passes through additional props', () => {
        render(<Button data-testid="my-btn" aria-label="Custom label">Props</Button>);
        expect(screen.getByTestId('my-btn')).toBeInTheDocument();
        expect(screen.getByLabelText('Custom label')).toBeInTheDocument();
    });

    it('uses custom type attribute', () => {
        render(<Button type="submit">Submit</Button>);
        const button = screen.getByRole('button');
        expect(button.type).toBe('submit');
    });
});
