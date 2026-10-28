import { useSyncExternalStore } from 'react';

/*
 * The project every page follows, picked in the navbar's project switcher.
 * null means "All projects". Remembered per browser; a store rather than
 * page state so the navbar and the page share one value.
 */
const STORAGE_KEY = 'najenga.activeProject';
const listeners = new Set();

function read() {
    try {
        return window.localStorage.getItem(STORAGE_KEY) || null;
    } catch {
        return null;
    }
}

let current = typeof window === 'undefined' ? null : read();

export function getActiveProjectId() {
    return current;
}

export function setActiveProjectId(id) {
    const next = id == null || id === '' ? null : String(id);
    if (next === current) return;
    current = next;
    try {
        if (next) window.localStorage.setItem(STORAGE_KEY, next);
        else window.localStorage.removeItem(STORAGE_KEY);
    } catch {
        // Private windows: the choice lasts until reload.
    }
    listeners.forEach((listener) => listener());
}

function subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
}

export function useActiveProjectStore() {
    return useSyncExternalStore(subscribe, getActiveProjectId, () => null);
}
