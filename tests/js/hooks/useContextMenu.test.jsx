import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import useContextMenu from '../../../resources/js/Hooks/useContextMenu';

describe('useContextMenu', () => {
    it('starts with null contextMenu', () => {
        const { result } = renderHook(() => useContextMenu());
        expect(result.current.contextMenu).toBeNull();
    });

    it('opens context menu with coordinates and target', () => {
        const { result } = renderHook(() => useContextMenu());
        const event = {
            clientX: 100,
            clientY: 200,
            preventDefault: vi.fn(),
            stopPropagation: vi.fn(),
        };

        act(() => result.current.openContextMenu(event, 'item-42'));

        expect(event.preventDefault).toHaveBeenCalled();
        expect(event.stopPropagation).toHaveBeenCalled();
        expect(result.current.contextMenu).toEqual({
            x: 100,
            y: 200,
            target: 'item-42',
        });
    });

    it('closes context menu', () => {
        const { result } = renderHook(() => useContextMenu());
        const event = {
            clientX: 50,
            clientY: 50,
            preventDefault: vi.fn(),
            stopPropagation: vi.fn(),
        };

        act(() => result.current.openContextMenu(event, 'test'));
        expect(result.current.contextMenu).not.toBeNull();

        act(() => result.current.closeContextMenu());
        expect(result.current.contextMenu).toBeNull();
    });
});
