import { useCallback, useMemo, useRef, useState } from 'react';
import { router } from '@inertiajs/react';
import toast from 'react-hot-toast';
import { confirmAction } from '@/Utils/feedback';

const resolve = (value, ...args) => (typeof value === 'function' ? value(...args) : value);

/** The message to show for a failed write: the server's, else the fallback. */
export function errorMessage(err, fallback = 'Something went wrong') {
    if (err?.errors) {
        const first = Object.values(err.errors).flat()[0];
        if (first) return first;
    }
    return err?.response?.data?.message || err?.response?.data?.error || fallback;
}

/**
 * An Inertia visit as a promise, so it can be awaited like an axios call.
 * Resolves with the new page; rejects with an Error carrying `errors` (the
 * validation errors) when the server answers with errors.
 *
 *   visit('delete', route('expenses.destroy', id))
 *   visit('post', route('folders.store'), { name })
 */
export function visit(method, url, data = {}, options = {}) {
    return new Promise((resolvePromise, reject) => {
        const callbacks = {
            preserveScroll: true,
            ...options,
            onSuccess: (page) => {
                options.onSuccess?.(page);
                resolvePromise(page);
            },
            onError: (errors) => {
                options.onError?.(errors);
                reject(Object.assign(new Error('Request failed'), { errors }));
            },
        };
        if (method === 'delete') router.delete(url, { data, ...callbacks });
        else router[method](url, data, callbacks);
    });
}

/**
 * useAction — the one way dashboard pages change data.
 *
 * Wraps a write (an axios call, or `visit()` for an Inertia request) with what
 * every save needs, so pages only say *what* to save:
 *   - an optional confirm dialog (confirmAction)
 *   - pending state, overall or per item (`key`)
 *   - success and error toasts
 *   - reloading Inertia props afterwards (`only`)
 *
 *   const remove = useAction((id) => axios.delete(route('expenses.destroy', id)), {
 *     confirm: 'Delete this expense?',
 *     success: 'Expense deleted',
 *     only: ['expenses'],
 *   });
 *   <button onClick={() => remove.run(expense.id)} disabled={remove.isPending(expense.id)}>
 *
 * Inertia visits that flash a message already get a toast from FlashToast:
 * leave `success` out for them, so the message isn't shown twice.
 *
 * @param {(...args) => Promise} fn  The write.
 * @param {object} [options]
 * @param {string|object|(...args) => string|object|null} [options.confirm]  confirmAction input; null/'' skips
 * @param {string|(result, ...args) => string} [options.success]  Toast on success (none if omitted)
 * @param {string|false|(err, ...args) => string} [options.error]  Fallback error message; false: no toast
 * @param {string[]} [options.only]  Inertia props to reload afterwards
 * @param {(result, ...args) => void} [options.onSuccess]
 * @param {(err, ...args) => void} [options.onError]
 * @param {(...args) => any} [options.key]  Per-item pending key (default: the first argument)
 * @param {boolean} [options.rethrow]  Re-throw errors to the caller (e.g. to keep a form open)
 * @param {boolean} [options.allowed=true]  False refuses to run (e.g. a viewer) with a toast
 */
export default function useAction(fn, options = {}) {
    const [pendingKeys, setPendingKeys] = useState(() => new Set());
    // Latest fn/options without re-creating `run` (pages pass inline lambdas).
    const latest = useRef({ fn, options });
    latest.current = { fn, options };
    const allowed = options.allowed !== false;

    const run = useCallback(
        async (...args) => {
            const { fn: write, options: opts } = latest.current;
            if (opts.allowed === false) {
                toast.error('You have view-only access.', { id: 'view-only' });
                return undefined;
            }

            const confirmInput = resolve(opts.confirm, ...args);
            if (confirmInput && !(await confirmAction(confirmInput))) return undefined;

            const key = opts.key ? opts.key(...args) : args[0];
            setPendingKeys((keys) => new Set(keys).add(key));
            try {
                const result = await write(...args);
                const message = resolve(opts.success, result, ...args);
                if (message) toast.success(message);
                if (opts.only?.length) router.reload({ only: opts.only });
                opts.onSuccess?.(result, ...args);
                return result;
            } catch (err) {
                if (opts.error !== false) toast.error(errorMessage(err, resolve(opts.error, err, ...args) || undefined));
                opts.onError?.(err, ...args);
                if (opts.rethrow) throw err;
                return undefined;
            } finally {
                setPendingKeys((keys) => {
                    const next = new Set(keys);
                    next.delete(key);
                    return next;
                });
            }
        },
        [],
    );

    return useMemo(
        () => ({
            run,
            allowed,
            pending: pendingKeys.size > 0,
            isPending: (key) => pendingKeys.has(key),
        }),
        [run, allowed, pendingKeys],
    );
}
