import { useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import toast from 'react-hot-toast';

/**
 * Surfaces server-side flash messages as toasts.
 *
 * Laravel flash is a single-use bag, so only one of these fires per visit.
 * The effect is keyed on the flash object's identity rather than its string
 * content: Inertia builds a fresh props object on every visit, so two
 * consecutive actions that share an identical message still produce two
 * toasts, while an all-null flash short-circuits to nothing.
 */
export default function FlashToast() {
    const flash = usePage().props.flash;

    useEffect(() => {
        if (!flash) return;

        if (flash.error) {
            toast.error(flash.error);
        } else if (flash.success) {
            toast.success(flash.success);
        } else if (flash.status) {
            toast(flash.status);
        }
    }, [flash]);

    return null;
}
