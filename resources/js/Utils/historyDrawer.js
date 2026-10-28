import { useSyncExternalStore } from 'react';

/*
 * Whether the version history drawer is open. A store, so the navbar's
 * button and a page's side panel open the same drawer (mounted once, in the
 * layout).
 */
let open = false;
const listeners = new Set();

export function setHistoryOpen(next) {
    open = !!next;
    listeners.forEach((listener) => listener());
}

export const openHistory = () => setHistoryOpen(true);
export const closeHistory = () => setHistoryOpen(false);

function subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
}

export function useHistoryOpen() {
    return useSyncExternalStore(subscribe, () => open, () => false);
}
