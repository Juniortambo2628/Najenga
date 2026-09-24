import { useMemo, useState } from 'react';
import { router } from '@inertiajs/react';
import { createPasskey, passkeySupported } from '@/Utils/webauthn';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import DangerButton from '@/Components/DangerButton';
import TextInput from '@/Components/TextInput';

const relativeDate = (iso) => {
    if (!iso) return 'never';
    const then = new Date(iso).getTime();
    const days = Math.round((Date.now() - then) / 86_400_000);
    if (days === 0) return 'today';
    if (days === 1) return 'yesterday';
    if (days < 30) return `${days}d ago`;
    if (days < 365) return `${Math.round(days / 30)}mo ago`;
    return `${Math.round(days / 365)}y ago`;
};

export default function PasskeysForm({ passkeys = [] }) {
    const supported = useMemo(() => passkeySupported(), []);
    const [adding, setAdding] = useState(false);
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const [busy, setBusy] = useState(false);

    const cancel = () => {
        setAdding(false);
        setName('');
        setError('');
    };

    const addPasskey = async (e) => {
        e.preventDefault();
        setError('');
        if (!name.trim()) {
            setError('Give this passkey a name (e.g. "MacBook", "Titan key").');
            return;
        }
        setBusy(true);
        try {
            const optsRes = await window.axios.post(route('passkeys.options'));
            const response = await createPasskey(optsRes.data);
            router.post(
                route('passkeys.register'),
                { name: name.trim(), response },
                {
                    preserveScroll: true,
                    onSuccess: () => cancel(),
                    onError: (errs) => setError(errs.response || errs.name || 'Could not register passkey.'),
                    onFinish: () => setBusy(false),
                },
            );
        } catch (err) {
            setBusy(false);
            setError(err?.message || 'Passkey setup was cancelled.');
        }
    };

    const remove = (passkey) => {
        if (!window.confirm(`Remove passkey "${passkey.name}"?`)) return;
        router.delete(route('passkeys.destroy', passkey.id), { preserveScroll: true });
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                        <i aria-hidden="true" className="fas fa-fingerprint text-purple-400"></i>
                    </div>
                    <div>
                        <p className="text-white font-medium text-sm">Passkeys</p>
                        <p className="text-gray-400 text-xs">Use biometrics or security keys to sign in</p>
                    </div>
                </div>
                {supported ? (
                    <PrimaryButton type="button" onClick={() => setAdding(true)} disabled={adding}>
                        Add passkey
                    </PrimaryButton>
                ) : (
                    <span className="px-3 py-1 rounded-lg bg-white/5 text-gray-400 text-xs font-medium border border-white/10">
                        Browser doesn't support
                    </span>
                )}
            </div>

            {adding && (
                <form
                    onSubmit={addPasskey}
                    className="p-4 bg-white/5 border border-purple-500/20 rounded-xl space-y-3"
                >
                    <div>
                        <InputLabel htmlFor="passkey-name" value="Name this passkey" />
                        <TextInput
                            id="passkey-name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            maxLength={100}
                            placeholder="e.g. Personal MacBook"
                            className="mt-1 block w-full"
                            autoFocus
                        />
                        <p className="text-xs text-gray-400 mt-1">
                            Your browser will prompt you to use Touch ID, Windows Hello, or a security key.
                        </p>
                        <InputError message={error} className="mt-2" />
                    </div>
                    <div className="flex items-center gap-2">
                        <PrimaryButton type="submit" disabled={busy}>
                            {busy ? 'Waiting for browser…' : 'Create'}
                        </PrimaryButton>
                        <button type="button" onClick={cancel} className="text-xs text-gray-400 hover:text-white underline">
                            Cancel
                        </button>
                    </div>
                </form>
            )}

            {passkeys.length > 0 && (
                <div className="p-4 bg-black/40 border border-white/10 rounded-xl">
                    <ul className="divide-y divide-white/10">
                        {passkeys.map((p) => (
                            <li key={p.id} className="py-3 flex items-center justify-between gap-3">
                                <div className="min-w-0">
                                    <p className="text-white text-sm font-medium truncate">{p.name}</p>
                                    <p className="text-xs text-gray-400">
                                        Added {relativeDate(p.created_at)} · Last used {relativeDate(p.last_used_at)}
                                    </p>
                                </div>
                                <DangerButton type="button" onClick={() => remove(p)}>
                                    Remove
                                </DangerButton>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
