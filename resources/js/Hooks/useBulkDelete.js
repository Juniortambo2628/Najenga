import { router } from '@inertiajs/react';
import toast from 'react-hot-toast';

function plural(noun, n) {
    return n === 1 ? noun : `${noun}s`;
}

/**
 * Bulk-delete the currently selected ids, one Inertia DELETE at a time.
 *
 * Flow is fixed on purpose so every page behaves the same:
 * confirm -> delete each id -> onDone() -> toast -> optional reload.
 *
 * @param {object}        options
 * @param {Iterable}      options.selected ids to delete (a Set or an array)
 * @param {string}        options.noun     singular label, pluralised with "s"
 * @param {(id: any) => string|null} options.path url for a given id; return a
 *                                                falsy value to skip that id
 * @param {() => void}    [options.onDone] runs after the loop, before the toast
 * @param {string[]}      [options.reload] Inertia props to refresh when done
 * @returns {() => Promise<void>}
 */
export default function useBulkDelete({ selected, noun, path, onDone, reload = [] }) {
    return async function handleBulkDelete() {
        const ids = [...selected];
        if (!confirm(`Delete ${ids.length} ${plural(noun, ids.length)}?`)) return;

        let failed = 0;
        for (const id of ids) {
            const url = path(id);
            if (!url) continue;
            try {
                await new Promise((resolve, reject) => {
                    router.delete(url, {
                        preserveScroll: true,
                        onSuccess: resolve,
                        onError: reject,
                    });
                });
            } catch {
                failed++;
            }
        }

        if (onDone) onDone();

        if (failed > 0) {
            toast.error(`Failed to delete ${failed} ${plural(noun, failed)}`);
        } else {
            toast.success(`${ids.length} ${plural(noun, ids.length)} deleted`);
        }

        if (reload.length) {
            router.reload({ only: reload });
        }
    };
}
