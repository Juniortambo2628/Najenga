import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

const axiosMock = vi.hoisted(() => ({ post: vi.fn() }));
vi.mock('axios', () => ({ default: axiosMock }));

import usePresenceHeartbeat, { HEARTBEAT_MS } from '../../../resources/js/Hooks/usePresenceHeartbeat';
import { useBadges, useOnline } from '../../../resources/js/Utils/presence';

const setVisibility = (state) => {
    Object.defineProperty(document, 'visibilityState', { value: state, configurable: true });
    document.dispatchEvent(new Event('visibilitychange'));
};

beforeEach(() => {
    vi.useFakeTimers();
    axiosMock.post.mockReset().mockResolvedValue({ data: { online: [{ id: 2, name: 'Mary', page: 'expenses', project_id: null }], badges: { photos: 3 } } });
    Object.defineProperty(document, 'visibilityState', { value: 'visible', configurable: true });
});
afterEach(() => vi.useRealTimers());

describe('usePresenceHeartbeat', () => {
    it('beats on mount and every 20 seconds, and shares who is online', async () => {
        const { result } = renderHook(() => {
            usePresenceHeartbeat();
            return { online: useOnline(), badges: useBadges() };
        });
        await act(async () => {});
        expect(axiosMock.post).toHaveBeenCalledWith('/presence/heartbeat', { page: window.location.pathname });
        expect(result.current.online).toEqual([{ id: 2, name: 'Mary', page: 'expenses', project_id: null }]);
        expect(result.current.badges).toEqual({ photos: 3 });

        await act(async () => vi.advanceTimersByTime(HEARTBEAT_MS));
        expect(axiosMock.post).toHaveBeenCalledTimes(2);
    });

    it('pauses while the tab is hidden and beats again when it is back', async () => {
        const { unmount } = renderHook(() => usePresenceHeartbeat());
        await act(async () => {});
        expect(axiosMock.post).toHaveBeenCalledTimes(1);

        act(() => setVisibility('hidden'));
        await act(async () => vi.advanceTimersByTime(HEARTBEAT_MS * 3));
        expect(axiosMock.post).toHaveBeenCalledTimes(1);

        await act(async () => setVisibility('visible'));
        expect(axiosMock.post).toHaveBeenCalledTimes(2);

        unmount();
        await act(async () => vi.advanceTimersByTime(HEARTBEAT_MS * 3));
        expect(axiosMock.post).toHaveBeenCalledTimes(2);
    });
});
