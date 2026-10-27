import { useSyncExternalStore } from 'react';

/*
 * Which forms on the page have unsaved edits. useUnsavedChangesGuard reports
 * here and the navbar reads it. A store rather than context, because a form
 * may render the layout itself (ResourceForm wraps AuthenticatedLayout).
 */
const dirtyForms = new Set();
const listeners = new Set();

export function reportUnsaved(key, dirty) {
    const had = dirtyForms.has(key);
    if (dirty === had) return;
    if (dirty) dirtyForms.add(key);
    else dirtyForms.delete(key);
    listeners.forEach((listener) => listener());
}

function subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
}

/** True while any form on the page has unsaved edits. */
export function useHasUnsavedChanges() {
    return useSyncExternalStore(subscribe, () => dirtyForms.size > 0, () => false);
}
