import { useEffect, useRef, useState } from 'react';
import { Dialog, DialogPanel, DialogTitle, Description } from '@headlessui/react';
import { registerConfirmHost } from '@/Utils/feedback';

/** Renders the dialogs requested through confirmAction() / promptAction(). Mount once. */
export default function ConfirmHost() {
    const [request, setRequest] = useState(null); // { opts, resolve }
    const [typed, setTyped] = useState('');
    const confirmRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(
        () =>
            registerConfirmHost((opts, resolve) => {
                setTyped(opts.input?.defaultValue || '');
                setRequest({ opts, resolve });
            }),
        [],
    );

    // Prompts resolve the typed text (or null); confirmations resolve true/false.
    const close = (accepted) => {
        if (!request) return;
        const isPrompt = !!request.opts.input;
        request.resolve(isPrompt ? (accepted ? typed.trim() : null) : accepted);
        setRequest(null);
    };

    const opts = request?.opts;
    const danger = opts?.tone === 'danger';
    const blocked = !!opts?.input && !typed.trim();

    return (
        <Dialog
            open={!!request}
            onClose={() => close(false)}
            initialFocus={opts?.input ? inputRef : confirmRef}
            role="alertdialog"
            className="relative z-[300]"
        >
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" aria-hidden="true" />
            <div className="fixed inset-0 flex items-center justify-center p-4">
                {opts && (
                    <DialogPanel className="w-full max-w-md rounded-2xl border border-white/10 bg-surface-overlay p-6 shadow-2xl">
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                if (!blocked) close(true);
                            }}
                        >
                            <div className="flex gap-4">
                                <div
                                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                                        danger ? 'bg-red-500/10 text-red-300' : 'bg-rose-500/10 text-rose-200'
                                    }`}
                                >
                                    <i aria-hidden="true" className={`fas ${danger ? 'fa-triangle-exclamation' : 'fa-circle-question'}`} />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <DialogTitle className="text-lg font-semibold text-white">{opts.title}</DialogTitle>
                                    {opts.message && <Description className="mt-1 whitespace-pre-line text-sm text-gray-400">{opts.message}</Description>}
                                    {opts.input && (
                                        <label className="mt-4 block text-sm text-gray-300">
                                            {opts.input.label}
                                            <input
                                                ref={inputRef}
                                                value={typed}
                                                onChange={(e) => setTyped(e.target.value)}
                                                placeholder={opts.input.placeholder}
                                                className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white focus:border-[#8B0000] focus:outline-none focus:ring-0"
                                            />
                                        </label>
                                    )}
                                </div>
                            </div>
                            <div className="mt-6 flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => close(false)}
                                    className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-gray-200 transition hover:bg-white/10 hover:text-white"
                                >
                                    {opts.cancelLabel}
                                </button>
                                <button
                                    ref={confirmRef}
                                    type="submit"
                                    disabled={blocked}
                                    className={`rounded-xl px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                                        danger
                                            ? 'bg-red-600 text-white hover:bg-red-500'
                                            : 'bg-gradient-to-r from-[rgb(139,0,0)] to-[rgb(220,20,60)] text-white hover:shadow-lg hover:shadow-[rgb(139,0,0)]/25'
                                    }`}
                                >
                                    {opts.confirmLabel}
                                </button>
                            </div>
                        </form>
                    </DialogPanel>
                )}
            </div>
        </Dialog>
    );
}
