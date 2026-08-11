import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import useMultiSelect from '../../../resources/js/Hooks/useMultiSelect';

describe('useMultiSelect', () => {
    it('starts with empty selection', () => {
        const { result } = renderHook(() => useMultiSelect());
        expect(result.current.selected.size).toBe(0);
        expect(result.current.count).toBe(0);
    });

    it('toggles a single item', () => {
        const { result } = renderHook(() => useMultiSelect());

        act(() => result.current.toggle('item-1'));
        expect(result.current.selected.has('item-1')).toBe(true);
        expect(result.current.count).toBe(1);

        act(() => result.current.toggle('item-1'));
        expect(result.current.selected.has('item-1')).toBe(false);
        expect(result.current.count).toBe(0);
    });

    it('multi-select keeps previous selections', () => {
        const { result } = renderHook(() => useMultiSelect());

        act(() => result.current.toggle('item-1'));
        act(() => result.current.toggle('item-2', true));
        expect(result.current.selected.size).toBe(2);
        expect(result.current.isSelected('item-1')).toBe(true);
        expect(result.current.isSelected('item-2')).toBe(true);
    });

    it('single-select clears previous selection', () => {
        const { result } = renderHook(() => useMultiSelect());

        act(() => result.current.toggle('item-1'));
        act(() => result.current.toggle('item-2'));
        expect(result.current.selected.size).toBe(1);
        expect(result.current.isSelected('item-1')).toBe(false);
        expect(result.current.isSelected('item-2')).toBe(true);
    });

    it('selectAll selects all given ids', () => {
        const { result } = renderHook(() => useMultiSelect());

        act(() => result.current.selectAll(['a', 'b', 'c']));
        expect(result.current.count).toBe(3);
        expect(result.current.isSelected('a')).toBe(true);
        expect(result.current.isSelected('b')).toBe(true);
        expect(result.current.isSelected('c')).toBe(true);
    });

    it('deselectAll clears selection', () => {
        const { result } = renderHook(() => useMultiSelect());

        act(() => result.current.selectAll(['a', 'b']));
        act(() => result.current.deselectAll());
        expect(result.current.count).toBe(0);
    });

    it('clear is an alias for deselectAll', () => {
        const { result } = renderHook(() => useMultiSelect());

        act(() => result.current.selectAll(['x', 'y']));
        act(() => result.current.clear());
        expect(result.current.count).toBe(0);
    });
});
