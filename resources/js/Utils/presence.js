import { useSyncExternalStore } from 'react';

/*
 * Who else is online in your projects, from the last heartbeat
 * (usePresenceHeartbeat): [{ id, name, page, project_id }]. A store, so the
 * navbar and any page read the same list.
 */
let online = [];
const listeners = new Set();

export function setOnline(people) {
    online = Array.isArray(people) ? people : [];
    listeners.forEach((listener) => listener());
}

function subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
}

export function useOnline() {
    return useSyncExternalStore(subscribe, () => online, () => online);
}
