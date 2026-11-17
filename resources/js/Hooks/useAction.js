import { useMemo } from 'react';
import { router } from '@inertiajs/react';
import toast from 'react-hot-toast';
import { useAdminAction } from '@okjt/dashboard';

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
 * useAction — the one way dashboard pages change data, on the OKJT kit's
 * useAdminAction (confirm dialog, pending state per item, success toast).
 *
 * Wraps a write (an axios call, or `visit()` for an Inertia request) so pages
 * only say *what* to save:
 *
 *   const remove = useAction((id) => axios.delete(route('expenses.destroy', id)), {
 *     confirm: 'Delete this expense?',
 *     success: 'Expense deleted',
 *     only: ['expenses'],
 *   });
 *   <button onClick={() => remove.run(expense.id)} disabled={remove.isPending(expense.id)}>
 *
 * What stays Najenga's: reloading Inertia props afterwards (`only`), error
 * toasts that read Inertia's validation errors (errorMessage), and `allowed`.
 * Najenga's version history is its own, so the kit's history refresh is off.
 *
 * Inertia visits that flash a message already get a toast from FlashToast:
 * leave `success` out for them, so the message isn't shown twice.
 *
 * @param {(...args) => Promise} fn  The write.
 * @param {object} [options]  The kit's (confirm, success, onSuccess, onError, key, rethrow), plus:
 * @param {string|false|(err, ...args) => string} [options.error]  Fallback error message; false: no toast
 * @param {string[]} [options.only]  Inertia props to reload afterwards
 * @param {boolean} [options.allowed=true]  False refuses to run (e.g. a viewer) with a toast
 */
export default function useAction(fn, options = {}) {
    const { only, error, onSuccess, onError, allowed = true, ...rest } = options;
    const action = useAdminAction(fn, {
        ...rest,
        refreshHistory: false,
        error: false,
        onSuccess: (result, ...args) => {
            if (only?.length) router.reload({ only });
            onSuccess?.(result, ...args);
        },
        onError: (err, ...args) => {
            if (error !== false) toast.error(errorMessage(err, resolve(error, err, ...args) || undefined));
            onError?.(err, ...args);
        },
    });

    return useMemo(
        () => (allowed
            ? action
            : { ...action, allowed: false, run: async () => { toast.error('You have view-only access.', { id: 'view-only' }); } }),
        [action, allowed],
    );
}
