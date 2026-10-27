import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

const routerMock = vi.hoisted(() => ({ delete: vi.fn(), post: vi.fn(), reload: vi.fn() }));
const successMock = vi.fn();
const errorMock = vi.fn();

vi.mock('@inertiajs/react', () => ({ router: routerMock }));
vi.mock('react-hot-toast', () => ({
    default: { success: (...args) => successMock(...args), error: (...args) => errorMock(...args) },
}));

import useAction, { visit, errorMessage } from '../../../resources/js/Hooks/useAction';

beforeEach(() => {
    vi.resetAllMocks();
    vi.spyOn(window, 'confirm').mockReturnValue(true);
});
afterEach(() => vi.restoreAllMocks());

describe('useAction', () => {
    it('runs the write, toasts success and reloads the given props', async () => {
        const write = vi.fn().mockResolvedValue({ data: { ok: true } });
        const onSuccess = vi.fn();
        const { result } = renderHook(() => useAction(write, { success: 'Saved', only: ['expenses'], onSuccess }));

        let value;
        await act(async () => {
            value = await result.current.run(7);
        });

        expect(write).toHaveBeenCalledWith(7);
        expect(value).toEqual({ data: { ok: true } });
        expect(successMock).toHaveBeenCalledWith('Saved');
        expect(routerMock.reload).toHaveBeenCalledWith({ only: ['expenses'] });
        expect(onSuccess).toHaveBeenCalledWith({ data: { ok: true } }, 7);
    });

    it('asks first and does nothing when the dialog is cancelled', async () => {
        window.confirm.mockReturnValue(false);
        const write = vi.fn();
        const { result } = renderHook(() => useAction(write, { confirm: (id) => `Delete #${id}?` }));
        await act(async () => {
            await result.current.run(3);
        });
        expect(window.confirm).toHaveBeenCalledWith('Delete #3?');
        expect(write).not.toHaveBeenCalled();
    });

    it('toasts the server message on failure and calls onError', async () => {
        const err = { response: { data: { message: 'Not allowed' } } };
        const onError = vi.fn();
        const { result } = renderHook(() => useAction(() => Promise.reject(err), { onError }));
        await act(async () => {
            await result.current.run('x');
        });
        expect(errorMock).toHaveBeenCalledWith('Not allowed');
        expect(onError).toHaveBeenCalledWith(err, 'x');
        expect(successMock).not.toHaveBeenCalled();
    });

    it('can stay quiet on failure and rethrow', async () => {
        const { result } = renderHook(() => useAction(() => Promise.reject(new Error('boom')), { error: false, rethrow: true }));
        await act(async () => {
            await expect(result.current.run()).rejects.toThrow('boom');
        });
        expect(errorMock).not.toHaveBeenCalled();
    });

    it('tracks pending per key', async () => {
        let finish;
        const write = () => new Promise((r) => { finish = r; });
        const { result } = renderHook(() => useAction(write));
        let running;
        act(() => {
            running = result.current.run(5);
        });
        expect(result.current.pending).toBe(true);
        expect(result.current.isPending(5)).toBe(true);
        expect(result.current.isPending(6)).toBe(false);
        await act(async () => {
            finish();
            await running;
        });
        expect(result.current.pending).toBe(false);
    });

    it('refuses to run when not allowed', async () => {
        const write = vi.fn();
        const { result } = renderHook(() => useAction(write, { allowed: false }));
        expect(result.current.allowed).toBe(false);
        await act(async () => {
            await result.current.run();
        });
        expect(write).not.toHaveBeenCalled();
        expect(errorMock).toHaveBeenCalledWith('You have view-only access.', { id: 'view-only' });
    });
});

describe('visit', () => {
    it('resolves when the Inertia request succeeds', async () => {
        routerMock.post.mockImplementation((url, data, opts) => opts.onSuccess({ url }));
        await expect(visit('post', '/folders', { name: 'A' })).resolves.toEqual({ url: '/folders' });
        expect(routerMock.post.mock.calls[0][2].preserveScroll).toBe(true);
    });

    it('sends delete data in the options and rejects with the validation errors', async () => {
        routerMock.delete.mockImplementation((url, opts) => opts.onError({ name: 'Taken' }));
        await expect(visit('delete', '/folders/1', { force: 1 })).rejects.toMatchObject({ errors: { name: 'Taken' } });
        expect(routerMock.delete.mock.calls[0][1].data).toEqual({ force: 1 });
    });
});

describe('errorMessage', () => {
    it('prefers validation errors, then the server message, then the fallback', () => {
        expect(errorMessage({ errors: { email: ['Bad email'] } })).toBe('Bad email');
        expect(errorMessage({ response: { data: { message: 'Nope' } } })).toBe('Nope');
        expect(errorMessage(new Error('x'), 'Failed to save')).toBe('Failed to save');
    });
});
