import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

vi.mock('@inertiajs/react', () => ({
    Link: ({ href, children, ...rest }) => (
        <a href={href} {...rest}>
            {children}
        </a>
    ),
}));

import FloatingToolbar, { countActiveFilters } from '../../../resources/js/Components/FloatingToolbar';

const sort = (value = 'newest', onChange = () => {}) => ({
    name: 'sort',
    title: 'Sort by',
    value,
    onChange,
    options: [
        { value: 'newest', label: 'Newest First' },
        { value: 'oldest', label: 'Oldest First' },
    ],
});

describe('countActiveFilters', () => {
    it('counts filters away from their first option or default', () => {
        expect(countActiveFilters([sort('newest')])).toBe(0);
        expect(countActiveFilters([sort('oldest')])).toBe(1);
        expect(countActiveFilters([{ ...sort('oldest'), defaultValue: 'oldest' }])).toBe(0);
    });
});

describe('FloatingToolbar', () => {
    it('shows two actions beside search and filters, the rest under More', () => {
        const third = vi.fn();
        render(
            <FloatingToolbar
                search={{ value: '', onChange: () => {} }}
                filters={[sort()]}
                actions={[
                    { id: 'a', label: 'Add', href: '/add', variant: 'primary' },
                    { id: 'b', label: 'Export', onClick: () => {} },
                    { id: 'c', label: 'Archive', onClick: third },
                ]}
            />,
        );
        expect(screen.getByRole('link', { name: 'Add' })).toHaveAttribute('href', '/add');
        expect(screen.getByRole('button', { name: 'Export' })).toBeInTheDocument();
        expect(screen.queryByText('Archive')).toBeNull();
        fireEvent.click(screen.getByRole('button', { name: 'More actions' }));
        fireEvent.click(screen.getByText('Archive'));
        expect(third).toHaveBeenCalled();
    });

    it('changes and resets filters from the Filters panel, with a count of active ones', () => {
        const onChange = vi.fn();
        render(<FloatingToolbar filters={[sort('oldest', onChange)]} />);
        const button = screen.getByRole('button', { name: /Filters/ });
        expect(button).toHaveTextContent('1');
        fireEvent.click(button);
        fireEvent.change(screen.getByLabelText('Sort by'), { target: { value: 'newest' } });
        expect(onChange).toHaveBeenCalledWith('newest');
        fireEvent.click(screen.getByRole('button', { name: 'Reset filters' }));
        expect(onChange).toHaveBeenLastCalledWith('newest');
    });

    it('switches to the selection and its actions while items are selected', () => {
        const remove = vi.fn();
        const clear = vi.fn();
        render(
            <FloatingToolbar
                actions={[{ id: 'a', label: 'Add', onClick: () => {} }]}
                selection={{ count: 3, total: 10, onSelectAll: () => {}, onDeselectAll: clear, actions: [{ id: 'd', label: 'Delete Selected', onClick: remove }] }}
            />,
        );
        expect(screen.getByText('3 selected')).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'Add' })).toBeNull();
        fireEvent.click(screen.getByRole('button', { name: 'Delete Selected' }));
        expect(remove).toHaveBeenCalled();
        fireEvent.click(screen.getByRole('button', { name: 'Clear selection' }));
        expect(clear).toHaveBeenCalled();
    });

    it('can be tucked away, flagging a list that is still narrowed', () => {
        render(<FloatingToolbar search={{ value: 'cement', onChange: () => {} }} />);
        fireEvent.click(screen.getByRole('button', { name: 'Hide toolbar' }));
        const show = screen.getByRole('button', { name: /Show toolbar \(search, filters or selection active\)/ });
        fireEvent.click(show);
        expect(screen.getByRole('toolbar', { name: 'Page tools' })).toBeInTheDocument();
    });

    it('focuses the page search on "/" but not while typing elsewhere', () => {
        render(
            <>
                <input aria-label="Other field" />
                <FloatingToolbar search={{ value: '', onChange: () => {}, placeholder: 'Search expenses' }} />
            </>,
        );
        const other = screen.getByLabelText('Other field');
        other.focus();
        fireEvent.keyDown(other, { key: '/' });
        expect(other).toHaveFocus();

        vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => { cb(); return 0; });
        other.blur();
        fireEvent.keyDown(document.body, { key: '/' });
        expect(screen.getByRole('searchbox', { name: 'Search expenses' })).toHaveFocus();
    });
});
