import { useEffect } from 'react';
import axios from 'axios';
import { setOnline } from '@/Utils/presence';

export const HEARTBEAT_MS = 20_000;

/**
 * Tell the server this person is here, and on which page: on mount (pages
 * render their own AuthenticatedLayout, so every page change mounts it
 * again), every 20 seconds while the tab is visible, and when the tab comes
 * back into view. The answer (who else is online) goes to Utils/presence.
 */
export default function usePresenceHeartbeat() {
    useEffect(() => {
        let timer = null;

        const beat = async () => {
            if (document.visibilityState === 'hidden') return;
            try {
                const { data } = await axios.post(route('presence.heartbeat'), { page: window.location.pathname });
                setOnline(data.online);
            } catch {
                // Offline or signed out: try again on the next beat.
            }
        };

        const start = () => {
            clearInterval(timer);
            timer = setInterval(beat, HEARTBEAT_MS);
        };

        const onVisibility = () => {
            if (document.visibilityState === 'visible') {
                beat();
                start();
            } else {
                clearInterval(timer);
            }
        };

        beat();
        start();
        document.addEventListener('visibilitychange', onVisibility);

        return () => {
            clearInterval(timer);
            document.removeEventListener('visibilitychange', onVisibility);
        };
    }, []);
}
