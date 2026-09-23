import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ContextMenu from '../../../resources/js/Components/ContextMenu';

const options = [
    { label: 'Preview', action: vi.fn() },
    { label: 'Download', action: vi.fn() },
    { label: 'Delete', action: vi.fn(), danger: true },
];

describe('ContextMenu keyboard support', () => {
    it('exposes a menu and focuses the first item', () => {
        render(<ContextMenu options={options} position={{ x: 0, y: 0 }} onClose={() => {}} />);
        expect(screen.getByRole('menu')).toBeInTheDocument();
        expect(screen.getByRole('menuitem', { name: 'Preview' })).toHaveFocus();
    });

    it('moves focus with arrow keys and wraps', () => {
        render(<ContextMenu options={options} position={{ x: 0, y: 0 }} onClose={() => {}} />);
        const menu = screen.getByRole('menu');
        fireEvent.keyDown(menu, { key: 'ArrowDown' });
        expect(screen.getByRole('menuitem', { name: 'Download' })).toHaveFocus();
        fireEvent.keyDown(menu, { key: 'ArrowUp' });
        fireEvent.keyDown(menu, { key: 'ArrowUp' });
        expect(screen.getByRole('menuitem', { name: 'Delete' })).toHaveFocus();
    });

    it('closes on Escape and returns focus to the opener', () => {
        const opener = document.createElement('button');
        document.body.appendChild(opener);
        opener.focus();
        const onClose = vi.fn();
        const { unmount } = render(<ContextMenu options={options} position={{ x: 0, y: 0 }} onClose={onClose} />);
        fireEvent.keyDown(screen.getByRole('menu'), { key: 'Escape' });
        expect(onClose).toHaveBeenCalled();
        unmount();
        expect(opener).toHaveFocus();
        opener.remove();
    });
});
