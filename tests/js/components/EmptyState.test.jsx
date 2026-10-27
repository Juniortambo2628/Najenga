import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import EmptyState from '../../../resources/js/Components/EmptyState';

const base = {
    title: 'No expenses found',
    message: 'Start tracking your project expenses',
    action: { label: 'Add Expense', onClick: vi.fn() },
    noun: 'expense',
};

describe('EmptyState', () => {
    it('shows the page’s own empty state when nothing narrows the list', () => {
        render(<EmptyState {...base} />);
        expect(screen.getByRole('heading', { name: 'No expenses found' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Add Expense' })).toBeInTheDocument();
    });

    it('names the search that matched nothing and offers to clear it', () => {
        const onClear = vi.fn();
        render(<EmptyState {...base} search=" cement " onClear={onClear} />);
        expect(screen.getByRole('heading', { name: 'No expenses match “cement”' })).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'Add Expense' })).toBeNull();
        fireEvent.click(screen.getByRole('button', { name: 'Clear search' }));
        expect(onClear).toHaveBeenCalledTimes(1);
    });

    it('speaks about filters when only filters narrow the list', () => {
        render(<EmptyState {...base} filtered onClear={vi.fn()} />);
        expect(screen.getByRole('heading', { name: 'No expenses match these filters' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Clear filters' })).toBeInTheDocument();
    });

    it('clears both when both narrow the list', () => {
        render(<EmptyState {...base} search="x" filtered onClear={vi.fn()} />);
        expect(screen.getByRole('button', { name: 'Clear search and filters' })).toBeInTheDocument();
    });
});
