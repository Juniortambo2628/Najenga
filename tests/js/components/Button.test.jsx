import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Button from '../../../resources/js/Components/Button';

vi.mock('@inertiajs/react', () => ({ Link: ({ href, children, ...rest }) => <a href={href} {...rest}>{children}</a> }));

describe('Button', () => {
    it('renders a button element by default', () => {
        render(<Button>Click me</Button>);
        const button = screen.getByRole('button', { name: /click me/i });
        expect(button).toBeInTheDocument();
        expect(button.tagName).toBe('BUTTON');
    });

    // Najenga's variant names on the kit's: primary is the kit's accent button
    // ("secondary"), secondary its plain one ("primary").
    it('primary is the kit\'s accent button', () => {
        render(<Button>Primary</Button>);
        expect(screen.getByRole('button').className).toContain('bg-accent');
    });

    it('secondary is the kit\'s plain button', () => {
        render(<Button variant="secondary">Secondary</Button>);
        const button = screen.getByRole('button');
        expect(button.className).toContain('bg-surface/80');
        expect(button.className).not.toContain('bg-accent');
    });

    it('danger is the kit\'s danger button', () => {
        render(<Button variant="danger">Danger</Button>);
        expect(screen.getByRole('button').className).toContain('text-red-600');
    });

    it('ghost is the plain button without its background and border', () => {
        render(<Button variant="ghost">Ghost</Button>);
        expect(screen.getByRole('button').className).toContain('!bg-transparent');
    });

    it('as="link" renders a link to href', () => {
        render(<Button as="link" href="/photos" variant="secondary">Cancel</Button>);
        expect(screen.getByRole('link', { name: 'Cancel' })).toHaveAttribute('href', '/photos');
    });

    it('shows the kit\'s spinner and is disabled while loading', () => {
        render(<Button loading>Save</Button>);
        expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
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
