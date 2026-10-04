import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const deleteMock = vi.fn();
const reloadMock = vi.fn();
const successMock = vi.fn();
const errorMock = vi.fn();

vi.mock('@inertiajs/react', () => ({
    router: {
        delete: (...args) => deleteMock(...args),
        reload: (...args) => reloadMock(...args),
    },
}));
vi.mock('react-hot-toast', () => ({
    default: { success: (...args) => successMock(...args), error: (...args) => errorMock(...args) },
}));

import useBulkDelete from '../../../resources/js/Hooks/useBulkDelete';

function build(overrides = {}) {
    return useBulkDelete({
        selected: [1, 2, 3],
        noun: 'project',
        path: (id) => `/projects/${id}`,
        reload: ['projects'],
        ...overrides,
    });
}

beforeEach(() => {
    vi.resetAllMocks();
    deleteMock.mockImplementation((url, opts) => opts.onSuccess());
    vi.spyOn(window, 'confirm').mockReturnValue(true);
});

afterEach(() => {
    vi.restoreAllMocks();
});

describe('useBulkDelete', () => {
    it('bails out without touching the server when the prompt is declined', async () => {
        window.confirm.mockReturnValue(false);
        await build()();
        expect(deleteMock).not.toHaveBeenCalled();
        expect(reloadMock).not.toHaveBeenCalled();
        expect(successMock).not.toHaveBeenCalled();
    });

    it('confirms with the pluralised noun and count', async () => {
        await build()();
        expect(window.confirm).toHaveBeenCalledWith('Delete 3 projects?');
    });

    it('uses a singular noun for one item', async () => {
        await build({ selected: [7], noun: 'user', path: (id) => `/users/${id}` })();
        expect(window.confirm).toHaveBeenCalledWith('Delete 1 user?');
    });

    it('deletes every id through the path resolver', async () => {
        await build()();
        expect(deleteMock).toHaveBeenCalledTimes(3);
        expect(deleteMock.mock.calls.map(([url]) => url)).toEqual([
            '/projects/1',
            '/projects/2',
            '/projects/3',
        ]);
        expect(deleteMock.mock.calls[0][1].preserveScroll).toBe(true);
    });

    it('skips ids whose path resolver returns nothing', async () => {
        await build({ path: (id) => (id === 2 ? null : `/projects/${id}`) })();
        expect(deleteMock.mock.calls.map(([url]) => url)).toEqual(['/projects/1', '/projects/3']);
        expect(successMock).toHaveBeenCalledWith('3 projects deleted');
    });

    it('runs onDone before the success toast', async () => {
        const order = [];
        successMock.mockImplementation(() => order.push('toast'));
        await build({ onDone: () => order.push('onDone') })();
        expect(order).toEqual(['onDone', 'toast']);
    });

    it('reports partial failures as an error', async () => {
        deleteMock.mockImplementation((url, opts) =>
            url === '/projects/2' ? opts.onError() : opts.onSuccess()
        );
        await build()();
        expect(errorMock).toHaveBeenCalledWith('Failed to delete 1 project');
        expect(successMock).not.toHaveBeenCalled();
    });

    it('reloads only the requested props when the list is clean', async () => {
        await build()();
        expect(reloadMock).toHaveBeenCalledWith({ only: ['projects'] });
    });

    it('does not reload when no props were requested', async () => {
        await build({ reload: [] })();
        expect(reloadMock).not.toHaveBeenCalled();
    });
});
