import { useCallback, useEffect, useSyncExternalStore } from 'react';
import { AdminTutorial } from '@okjt/dashboard';
import axios from 'axios';

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

/** Najenga's steps as the kit's tour reads them: the element by its data-tour name. */
const KIT_STEPS = TOUR_STEPS.map((step) => ({ ...step, selector: step.target ? `[data-tour="${step.target}"]` : undefined, target: undefined, name: step.target }));

/**
 * A short tour of the dashboard shell. Starts by itself once for new
 * accounts (on the Dashboard), and again from the account menu. Stops whose
 * element isn't on screen are skipped.
 *
 * The OKJT kit's AdminTutorial runs it (the open state, skipping, measuring
 * each stop's element, ← → and Escape); Najenga draws the spotlight and the
 * card, and remembers on the account who has finished.
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

    return (
        <AdminTutorial
            open={isOpen}
            steps={KIT_STEPS}
            skipMissing
            scrollIntoView={false}
            onComplete={finish}
            render={(tour) => <TourCard {...tour} />}
        />
    );
}

/** The spotlight and the card, as Najenga has always drawn them. */
function TourCard({ step: kitStep, index, count, rect, next, back, finish }) {
    const step = { ...kitStep, target: kitStep.name };
    const steps = { length: count };
    const last = index >= steps.length - 1;
    const pad = 6;
    // The card sits below the target, or beside it for the sidebar; centred without one.
    const cardStyle = rect
        ? step.target === 'sidebar'
            ? { top: Math.max(16, rect.top + 80), left: rect.right + 16 }
            : { top: rect.bottom + 14, left: Math.min(Math.max(16, rect.left + rect.width / 2 - 160), window.innerWidth - 336) }
        : { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };

    return (
        <div className="fixed inset-0 z-[60]">
            {rect ? (
                // A spotlight: everything dimmed except the target.
                <div
                    aria-hidden="true"
                    className="pointer-events-none fixed rounded-xl ring-2 ring-[#DC143C] transition-all duration-200"
                    style={{ top: rect.top - pad, left: rect.left - pad, width: rect.width + pad * 2, height: rect.height + pad * 2, boxShadow: '0 0 0 9999px rgba(0,0,0,0.6)' }}
                />
            ) : (
                <div aria-hidden="true" className="fixed inset-0 bg-black/60" />
            )}
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="tour-title"
                aria-describedby="tour-body"
                className="fixed w-80 max-w-[calc(100vw-2rem)] rounded-2xl border border-white/10 bg-surface-overlay p-5 shadow-2xl"
                style={cardStyle}
            >
                <p className="mb-1 text-[11px] font-semibold capitalize text-gray-500">
                    {index + 1} of {steps.length}
                </p>
                <h2 id="tour-title" className="text-lg font-semibold text-white">{step.title}</h2>
                <p id="tour-body" className="mt-1.5 text-sm text-gray-300">{step.body}</p>
                <div className="mt-4 flex items-center gap-2">
                    <button type="button" onClick={finish} className="mr-auto text-sm text-gray-400 hover:text-white">
                        Skip tour
                    </button>
                    {index > 0 && (
                        <button type="button" onClick={back} className="rounded-xl border border-white/10 px-3 py-1.5 text-sm text-gray-200 hover:bg-white/5">
                            Back
                        </button>
                    )}
                    <button
                        type="button"
                        autoFocus
                        onClick={() => (last ? finish() : next())}
                        className="rounded-xl bg-gradient-to-r from-[rgb(139,0,0)] to-[rgb(220,20,60)] px-3 py-1.5 text-sm font-semibold text-white"
                    >
                        {last ? 'Done' : 'Next'}
                    </button>
                </div>
            </div>
        </div>
    );
}
