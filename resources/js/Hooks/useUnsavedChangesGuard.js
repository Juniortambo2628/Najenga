import { useEffect } from 'react';
import { router } from '@inertiajs/react';
import { useUnsavedChangesGuard as useKitGuard, confirmLeave } from '@okjt/dashboard';

// Shared by every guard on the page: one answer ("Leave") or one save lets the
// next visit through for all of them.
const bypass = { current: false };

/**
 * Warn before leaving a page with unsaved edits.
 *
 * The OKJT kit's guard does most of it: the page-wide record of unsaved forms
 * (the navbar's "Unsaved changes" chip reads it), the browser's prompt on
 * reload or close, and asking before in-app links. What stays here is
 * Najenga's own router (the page API in frontend/src/najenga/inertia.jsx):
 * its visits ask through the kit's confirmLeave(), and the visit a form makes
 * right after saving is let through.
 *
 *   const form = useForm({...});
 *   useUnsavedChangesGuard(form.isDirty);
 *
 * The form's own submit is never blocked, and neither is the visit its
 * success handler makes straight after saving (e.g. back to the list).
 */
export default function useUnsavedChangesGuard(dirty, message = 'Your changes on this page have not been saved.') {
    useKitGuard(!!dirty, message);

    useEffect(() => {
        if (!dirty) return undefined;

        let writing = false;
        let clearBypass = null;
        const offStart = router.on('start', (event) => {
            writing = event.detail.visit.method !== 'get';
        });
        // Fires before the visit's own onSuccess, so its follow-up visit passes.
        const offSuccess = router.on('success', () => {
            if (!writing) return;
            bypass.current = true;
            clearTimeout(clearBypass);
            clearBypass = setTimeout(() => {
                bypass.current = false;
            }, 1000);
        });
        const offFinish = router.on('finish', () => {
            writing = false;
        });

        const offBefore = router.on('before', (event) => {
            const visit = event.detail.visit;
            if (event.defaultPrevented) return undefined; // another guard is already asking
            if (visit.method !== 'get' || visit.only?.length || visit.prefetch) return undefined;
            if (bypass.current) {
                bypass.current = false;
                return undefined;
            }
            const url = new URL(visit.url, window.location.href);
            if (url.pathname === window.location.pathname) return undefined;

            event.preventDefault();
            confirmLeave(message).then((leave) => {
                if (!leave) return;
                bypass.current = true;
                router.visit(url.pathname + url.search + url.hash);
            });
            return false;
        });

        return () => {
            clearTimeout(clearBypass);
            offStart();
            offSuccess();
            offFinish();
            offBefore();
        };
    }, [dirty, message]);
}
