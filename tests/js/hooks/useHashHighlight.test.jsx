import { describe, it, expect, vi, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

import useHashHighlight from '../../../resources/js/Hooks/useHashHighlight';

afterEach(() => {
    vi.useRealTimers();
    window.history.replaceState(null, '', '/');
    document.body.innerHTML = '';
});

describe('useHashHighlight', () => {
    it('returns null when there is no hash', () => {
        window.history.replaceState(null, '', '/documents');

        const { result } = renderHook(() => useHashHighlight('doc-'));

        expect(result.current).toBeNull();
    });

    it('ignores hashes that belong to a different prefix', () => {
        window.history.replaceState(null, '', '/documents#photo-7');

        const { result } = renderHook(() => useHashHighlight('doc-'));

        expect(result.current).toBeNull();
    });

    it('ignores a bare prefix with no id', () => {
        window.history.replaceState(null, '', '/documents#doc-');

        const { result } = renderHook(() => useHashHighlight('doc-'));

        expect(result.current).toBeNull();
    });

    it('returns the id from a matching hash and scrolls the row into view', () => {
        vi.useFakeTimers();
        window.history.replaceState(null, '', '/documents#doc-12');

        const scrollIntoView = vi.fn();
        const row = document.createElement('div');
        row.id = 'doc-12';
        row.scrollIntoView = scrollIntoView;
        document.body.appendChild(row);

        const { result } = renderHook(() => useHashHighlight('doc-'));
        expect(result.current).toBe('12');

        act(() => {
            vi.runAllTimers();
        });
        expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'center' });
    });

    it('handles encoded ids in the hash', () => {
        window.history.replaceState(null, '', '/photos#photo-a%2Fb');

        const { result } = renderHook(() => useHashHighlight('photo-'));

        expect(result.current).toBe('a/b');
    });
});
