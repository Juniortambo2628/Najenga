import { useSyncExternalStore } from 'react';
import { useShared } from './page';

/*
 * The project every page follows, picked in the header's project switcher.
 * null means "All projects". Remembered per browser (the same key as the
 * Inertia pages, so the choice carries across while both exist).
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

const subscribe = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

/** [id, setId]; null for "All projects" or a project you can no longer see. */
export function useActiveProjectId() {
  const stored = useSyncExternalStore(subscribe, () => current, () => null);
  const projects = useShared().auth?.projects ?? [];
  const id = stored && projects.some((p) => String(p.id) === stored) ? stored : null;
  return [id, setActiveProjectId];
}
