import { useCallback, useEffect, useSyncExternalStore } from 'react';
import axios from 'axios';
import { AdminTutorial } from '@okjt/dashboard';

/** The tour's stops: an element marked data-tour="…", or none for a centred card. */
export const TOUR_STEPS = [
    { title: 'Welcome to Najenga', body: 'A quick look around: where your projects, expenses, receipts, photos and documents live, and how to work on them with others.' },
    { target: 'sidebar', title: 'Your pages', body: 'The Overview, Expenses, Receipts, Photos, Documents and the Timeline, in groups. A red number means others changed something there since you last looked.' },
    { target: 'project-switcher', title: 'Pick a project', body: 'Every page follows the project picked here, or shows all of them. Your role in each project is shown beside it.' },
    { target: 'history', title: 'Version history', body: 'Every change is kept. See who changed what, undo a change, or bring back something deleted.' },
    { target: 'notifications', title: 'Notifications', body: 'Comments, invitations and activity on your projects arrive here.' },
    { target: 'account', title: 'Your account', body: 'Settings and signing out. You can take this tour again from here any time.' },
];

/** New accounts (created this many days ago or less) get the tour once, by themselves. */
const NEW_ACCOUNT_DAYS = 14;

/** Before the account remembered it, this browser did (najenga.tour.done.<id>). */
const legacyKey = (userId) => `najenga.tour.done.${userId}`;

function legacyDone(userId) {
    try {
        return localStorage.getItem(legacyKey(userId)) === '1';
    } catch {
        return false;
    }
}

// Finished during this visit: the page's user prop updates on the next visit.
const finishedNow = new Set();

/** Whether this account has finished (or skipped) the tour. */
export function tourDone(user) {
    return !!user?.tour_completed_at || finishedNow.has(user?.id) || legacyDone(user?.id);
}

/** Remember on the account that the tour is done (and drop the old browser flag). */
function markDone(user) {
    if (!user?.id) return;
    finishedNow.add(user.id);
    axios.post(route('tour.complete')).catch(() => {
        // Offline: it may start once more next time, nothing worse.
    });
    try {
        localStorage.removeItem(legacyKey(user.id));
    } catch {
        /* storage unavailable */
    }
}

/** Whether a new account should see the tour now. */
export function shouldAutoStart(user) {
    if (!user?.id || tourDone(user)) return false;
    const created = user.created_at ? new Date(user.created_at) : null;
    return !!created && Date.now() - created.getTime() <= NEW_ACCOUNT_DAYS * 86_400_000;
}

// Open state, so the account menu can restart it.
let open = false;
const listeners = new Set();
export function startTour() {
    open = true;
    listeners.forEach((l) => l());
}
function stopTour() {
    open = false;
    listeners.forEach((l) => l());
}
const subscribe = (l) => {
    listeners.add(l);
    return () => listeners.delete(l);
};
export const useTourOpen = () => useSyncExternalStore(subscribe, () => open, () => false);

/** The steps as the kit's tutorial takes them: a selector for each marked element. */
const KIT_STEPS = TOUR_STEPS.map((step) => ({
    title: step.title,
    content: step.body,
    selector: step.target ? `[data-tour="${step.target}"]` : undefined,
    position: step.target === 'sidebar' ? 'right' : 'bottom',
}));

/**
 * A short tour of the dashboard shell, drawn by the kit's AdminTutorial.
 * Starts by itself once for new accounts (on the Dashboard), and again from
 * the account menu. Stops whose element isn't on screen are skipped. The
 * account remembers who has finished.
 */
export default function Tour({ user, autoStart = false }) {
    const isOpen = useTourOpen();

    useEffect(() => {
        // Finished in this browser before the account remembered it: carry it over.
        if (user?.id && !user.tour_completed_at && legacyDone(user.id)) markDone(user);
        else if (autoStart && shouldAutoStart(user)) startTour();
    }, [autoStart, user]);

    const finish = useCallback(() => {
        markDone(user);
        stopTour();
    }, [user]);

    return <AdminTutorial open={isOpen} skipMissing steps={KIT_STEPS} onComplete={finish} />;
}
