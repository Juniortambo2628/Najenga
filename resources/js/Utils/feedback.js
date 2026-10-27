/*
 * App-wide confirmations, usable from any handler without hooks:
 *   if (!(await confirmAction('Delete this expense?'))) return;
 *   const name = await promptAction({ title: 'Rename folder', label: 'Name', defaultValue });
 * <ConfirmHost/> (mounted once in AuthenticatedLayout) renders the dialog.
 */

let showDialog = null;

/** Registered by ConfirmHost; returns an unregister function. */
export function registerConfirmHost(show) {
    showDialog = show;
    return () => {
        if (showDialog === show) showDialog = null;
    };
}

const DANGER = /\b(delete|remove|unlink|turn off|disable|regenerate|discard)\b/i;
const VERBS = ['Delete', 'Remove', 'Unlink', 'Regenerate', 'Turn off', 'Disable', 'Discard', 'Send', 'Restore'];

/** Normalise a string or options object into dialog options. */
export function confirmOptions(input) {
    const opts = typeof input === 'string' ? { message: input } : { ...input };
    const text = `${opts.title || ''} ${opts.message || ''}`;
    const verb = VERBS.find((v) => new RegExp(`^\\s*(are you sure you want to\\s+)?${v}\\b`, 'i').test(opts.message || ''));
    const short = opts.message && opts.message.length <= 70;
    return {
        title: opts.title || (short ? opts.message : 'Are you sure?'),
        message: opts.title || !short ? opts.message || null : null,
        confirmLabel: opts.confirmLabel || verb || 'Confirm',
        cancelLabel: opts.cancelLabel || 'Cancel',
        tone: opts.tone || (DANGER.test(text) ? 'danger' : 'default'),
        input: opts.input || null, // { label, defaultValue, placeholder } — see promptAction
    };
}

/** Ask the user to confirm. Resolves true or false. */
export function confirmAction(input) {
    const opts = confirmOptions(input);
    if (!showDialog) {
        // Outside the dashboard (no host mounted): the browser's own dialog.
        return Promise.resolve(window.confirm([opts.title, opts.message].filter(Boolean).join('\n\n')));
    }
    return new Promise((resolve) => showDialog(opts, resolve));
}

/**
 * Ask for a short text value. Resolves the trimmed text, or null if cancelled.
 * @param {{ title, message?, label?, defaultValue?, placeholder?, confirmLabel? }} opts
 */
export function promptAction({ label, defaultValue = '', placeholder, ...opts }) {
    const options = confirmOptions({ confirmLabel: 'Save', tone: 'default', ...opts, input: { label, defaultValue, placeholder } });
    if (!showDialog) {
        const value = window.prompt(options.title, defaultValue);
        return Promise.resolve(value === null ? null : value.trim());
    }
    return new Promise((resolve) => showDialog(options, resolve));
}
