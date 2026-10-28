import { useSyncExternalStore } from 'react';

/*
 * Who else is online in your projects, from the last heartbeat
 * (usePresenceHeartbeat): [{ id, name, page, project_id, projects }], and the
 * sidebar's change badges. A store, so the
 * navbar and any page read the same list.
 */
let online = [];
let badges = {};
const listeners = new Set();

const notify = () => listeners.forEach((listener) => listener());

export function setOnline(people) {
    online = Array.isArray(people) ? people : [];
    notify();
}

/** Changes by others since you last opened each sidebar page: { expenses: 3 }. */
export function setBadges(counts) {
    badges = counts && typeof counts === 'object' && !Array.isArray(counts) ? counts : {};
    notify();
}

function subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
}

export function useOnline() {
    return useSyncExternalStore(subscribe, () => online, () => online);
}

export function useBadges() {
    return useSyncExternalStore(subscribe, () => badges, () => badges);
}
