import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

const handlers = vi.hoisted(() => ({}));
const routerMock = vi.hoisted(() => ({
    on: vi.fn((name, cb) => {
        (handlers[name] ||= new Set()).add(cb);
        return () => handlers[name].delete(cb);
    }),
    visit: vi.fn(),
}));
vi.mock('@inertiajs/react', () => ({ router: routerMock }));

import useUnsavedChangesGuard from '../../../resources/js/Hooks/useUnsavedChangesGuard';
import { useHasUnsavedChanges } from '../../../resources/js/Utils/unsavedChanges';

const fire = (name, detail) => {
    const event = { detail, defaultPrevented: false, preventDefault() { this.defaultPrevented = true; } };
    [...(handlers[name] || [])].forEach((cb) => cb(event));
    return event;
};
const navigate = (url, extra = {}) => fire('before', { visit: { method: 'get', url: new URL(url, window.location.origin), ...extra } });

// The guard plus what the navbar reads.
const useGuarded = (dirty) => {
    useUnsavedChangesGuard(dirty);
    return useHasUnsavedChanges();
};

beforeEach(() => {
    Object.keys(handlers).forEach((k) => delete handlers[k]);
    routerMock.on.mockClear();
    routerMock.visit.mockClear();
    vi.spyOn(window, 'confirm').mockReturnValue(false);
});
afterEach(() => vi.restoreAllMocks());

describe('useUnsavedChangesGuard', () => {
    it('does nothing while the form is clean', () => {
        const { result } = renderHook(() => useGuarded(false));
        expect(navigate('/expenses').defaultPrevented).toBe(false);
        expect(result.current).toBe(false);
    });

    it('stops navigation away and asks first', async () => {
        const { result, unmount } = renderHook(() => useGuarded(true));
        expect(result.current).toBe(true);

        const event = navigate('/expenses');
        expect(event.defaultPrevented).toBe(true);
        await act(async () => {});
        expect(window.confirm).toHaveBeenCalled();
        expect(routerMock.visit).not.toHaveBeenCalled();
        unmount();
        const { result: after } = renderHook(() => useHasUnsavedChanges());
        expect(after.current).toBe(false);
    });

    it('leaves when the user agrees', async () => {
        window.confirm.mockReturnValue(true);
        renderHook(() => useUnsavedChangesGuard(true));
        navigate('/expenses?page=2');
        await act(async () => {});
        expect(routerMock.visit).toHaveBeenCalledWith('/expenses?page=2');
        // The visit it makes is let through.
        expect(navigate('/expenses?page=2').defaultPrevented).toBe(false);
    });

    it('never blocks the form’s own submit, partial reloads or the same page', () => {
        renderHook(() => useUnsavedChangesGuard(true));
        expect(fire('before', { visit: { method: 'patch', url: new URL('/expenses/1', window.location.origin) } }).defaultPrevented).toBe(false);
        expect(navigate('/expenses', { only: ['expenses'] }).defaultPrevented).toBe(false);
        expect(navigate(window.location.pathname).defaultPrevented).toBe(false);
    });

    it('lets through the visit made right after a successful save', () => {
        renderHook(() => useUnsavedChangesGuard(true));
        fire('start', { visit: { method: 'patch' } });
        fire('success', { page: {} });
        expect(navigate('/expenses').defaultPrevented).toBe(false);
        // Only that one.
        expect(navigate('/photos').defaultPrevented).toBe(true);
    });

    it('warns on reload or close', () => {
        renderHook(() => useUnsavedChangesGuard(true));
        const event = new Event('beforeunload', { cancelable: true });
        window.dispatchEvent(event);
        expect(event.defaultPrevented).toBe(true);
    });
});
