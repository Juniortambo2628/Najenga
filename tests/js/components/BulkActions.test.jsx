import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import BulkActions from '../../../resources/js/Components/BulkActions';

describe('BulkActions', () => {
    it('renders nothing when selectedCount is 0', () => {
        const { container } = render(
            <BulkActions selectedCount={0} totalCount={10} onSelectAll={() => {}} onDeselectAll={() => {}} actions={null} />
        );
        expect(container.firstChild).toBeNull();
    });

    it('shows selected count', () => {
        render(
            <BulkActions selectedCount={3} totalCount={10} onSelectAll={() => {}} onDeselectAll={() => {}} actions={null} />
        );
        expect(screen.getByText('3 selected')).toBeInTheDocument();
    });

    it('shows Select All when not all selected', () => {
        render(
            <BulkActions selectedCount={2} totalCount={10} onSelectAll={() => {}} onDeselectAll={() => {}} actions={null} />
        );
        expect(screen.getByText(/Select All/)).toBeInTheDocument();
    });

    it('shows Deselect All when all selected', () => {
        render(
            <BulkActions selectedCount={10} totalCount={10} onSelectAll={() => {}} onDeselectAll={() => {}} actions={null} />
        );
        expect(screen.getByText(/Deselect All/)).toBeInTheDocument();
    });

    it('calls onSelectAll when not all are selected', () => {
        const onSelectAll = vi.fn();
        render(
            <BulkActions selectedCount={2} totalCount={10} onSelectAll={onSelectAll} onDeselectAll={() => {}} actions={null} />
        );
        fireEvent.click(screen.getByRole('button'));
        expect(onSelectAll).toHaveBeenCalledTimes(1);
    });

    it('calls onDeselectAll when all are selected', () => {
        const onDeselectAll = vi.fn();
        render(
            <BulkActions selectedCount={5} totalCount={5} onSelectAll={() => {}} onDeselectAll={onDeselectAll} actions={null} />
        );
        fireEvent.click(screen.getByRole('button'));
        expect(onDeselectAll).toHaveBeenCalledTimes(1);
    });

    it('renders actions slot', () => {
        render(
            <BulkActions selectedCount={1} totalCount={5} onSelectAll={() => {}} onDeselectAll={() => {}} actions={<button>Delete</button>} />
        );
        expect(screen.getByText('Delete')).toBeInTheDocument();
    });
});
