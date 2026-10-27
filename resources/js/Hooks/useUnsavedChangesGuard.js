import { useEffect, useId } from 'react';
import { router } from '@inertiajs/react';
import { confirmAction } from '@/Utils/feedback';
import { reportUnsaved } from '@/Utils/unsavedChanges';

// Shared by every guard on the page: one answer ("Leave") or one save lets the
// next visit through for all of them.
const bypass = { current: false };

/**
 * Warn before leaving a page with unsaved edits: on reload or close (the
 * browser's prompt) and on Inertia navigation (the styled confirm dialog).
 * While `dirty`, the navbar shows an "Unsaved changes" chip.
 *
 *   const form = useForm({...});
 *   useUnsavedChangesGuard(form.isDirty);
 *
 * The form's own submit is never blocked, and neither is the visit its
 * success handler makes straight after saving (e.g. back to the list).
 */
export default function useUnsavedChangesGuard(dirty, message = 'Your changes on this page have not been saved.') {
    const key = useId();

    useEffect(() => {
        reportUnsaved(key, !!dirty);
        return () => reportUnsaved(key, false);
    }, [key, dirty]);

    useEffect(() => {
        if (!dirty) return undefined;

        const onBeforeUnload = (e) => {
            e.preventDefault();
            e.returnValue = '';
        };

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
            confirmAction({ title: 'Leave without saving?', message, confirmLabel: 'Leave', tone: 'danger' }).then((leave) => {
                if (!leave) return;
                bypass.current = true;
                router.visit(url.pathname + url.search + url.hash);
            });
            return false;
        });

        window.addEventListener('beforeunload', onBeforeUnload);
        return () => {
            window.removeEventListener('beforeunload', onBeforeUnload);
            clearTimeout(clearBypass);
            offStart();
            offSuccess();
            offFinish();
            offBefore();
        };
    }, [dirty, message]);
}
