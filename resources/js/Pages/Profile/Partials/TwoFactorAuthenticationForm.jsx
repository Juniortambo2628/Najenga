import { useState } from 'react';
import Button from '@/Components/Button';
import axios from 'axios';
import { router, useForm } from '@inertiajs/react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import useAction from '@/Hooks/useAction';

/** The page's data again, after one of the kit's two-step endpoints (/api/2fa/…). */
const reload = () => router.reload({ preserveScroll: true });

export default function TwoFactorAuthenticationForm({ twoFactor }) {
    const enabled = !!twoFactor?.enabled;
    const pending = twoFactor?.pending || null;
    const recoveryCodes = twoFactor?.recovery_codes || [];
    const [showingCodes, setShowingCodes] = useState(false);

    const confirmForm = useForm({ code: '' });

    const startSetup = useAction(() => axios.post('/api/2fa/setup').then(reload), { key: () => 'enable' });

    const disable = useAction(() => axios.post('/api/2fa/disable').then(reload), {
        confirm: { title: 'Turn off two-factor authentication?', confirmLabel: 'Turn off', tone: 'danger' },
        success: 'Two-factor authentication is off',
        key: () => 'disable',
    });

    const cancelPending = useAction(() => axios.post('/api/2fa/disable').then(reload), { key: () => 'cancel' });

    const confirm = useAction((code) => axios.post('/api/2fa/confirm', { code }).then(reload), {
        error: false, // the code field shows it
        key: () => 'confirm',
        onSuccess: () => {
            confirmForm.reset('code');
            setShowingCodes(true);
        },
        onError: (error) => confirmForm.setError('code', error.response?.data?.message || 'That code didn’t work. Try again.'),
    });
    const submitConfirm = (e) => {
        e.preventDefault();
        confirmForm.clearErrors();
        confirm.run(confirmForm.data.code);
    };

    const regenerate = useAction(() => axios.post('/api/2fa/recovery-codes').then(reload), {
        confirm: { title: 'Regenerate recovery codes?', message: 'Your old codes will stop working.', confirmLabel: 'Regenerate', tone: 'danger' },
        key: () => 'regenerate',
    });

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                        <i aria-hidden="true" className="fas fa-mobile-alt text-blue-400"></i>
                    </div>
                    <div>
                        <p className="text-white font-medium text-sm">Authenticator App</p>
                        <p className="text-gray-400 text-xs">Use an authenticator app to generate one-time codes</p>
                    </div>
                </div>
                {enabled ? (
                    <div className="flex items-center gap-2">
                        <span className="px-3 py-1 rounded-lg bg-green-500/10 text-green-400 text-xs font-medium border border-green-500/20">
                            Enabled
                        </span>
                        <Button variant="danger" type="button" onClick={() => disable.run()} disabled={disable.pending}>
                            Disable
                        </Button>
                    </div>
                ) : pending ? (
                    <span className="px-3 py-1 rounded-lg bg-blue-500/10 text-blue-400 text-xs font-medium border border-blue-500/20">
                        Setup in progress
                    </span>
                ) : (
                    <Button type="button" onClick={() => startSetup.run()} disabled={startSetup.pending}>
                        Enable
                    </Button>
                )}
            </div>

            {pending && (
                <div className="p-4 bg-white/5 border border-blue-500/20 rounded-xl space-y-4">
                    <div>
                        <p className="text-sm text-white font-medium">Scan this QR with your authenticator app</p>
                        <p className="text-xs text-gray-400 mt-1">
                            Google Authenticator, 1Password, Authy, Bitwarden — any TOTP app works.
                        </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4 items-start">
                        <div
                            className="bg-white rounded-lg p-2 shrink-0"
                            dangerouslySetInnerHTML={{ __html: pending.qr_svg }}
                        />
                        <div className="flex-1 space-y-2 min-w-0">
                            <p className="text-xs text-gray-400">Can't scan? Enter this key manually:</p>
                            <code className="block text-xs bg-black/40 border border-white/10 rounded px-2 py-1 text-white break-all">
                                {pending.secret}
                            </code>
                        </div>
                    </div>
                    <form onSubmit={submitConfirm} className="space-y-3">
                        <InputLabel htmlFor="two-factor-code" value="Enter the 6-digit code from your app" />
                        <TextInput
                            id="two-factor-code"
                            type="text"
                            inputMode="numeric"
                            autoComplete="one-time-code"
                            maxLength={6}
                            value={confirmForm.data.code}
                            onChange={(e) => confirmForm.setData('code', e.target.value)}
                            className="block w-40"
                        />
                        <InputError message={confirmForm.errors.code} />
                        <div className="flex items-center gap-2">
                            <Button type="submit" disabled={confirm.pending}>
                                Confirm
                            </Button>
                            <button
                                type="button"
                                onClick={() => cancelPending.run()}
                                className="text-xs text-gray-400 hover:text-white underline"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
                        <i aria-hidden="true" className="fas fa-key text-green-400"></i>
                    </div>
                    <div>
                        <p className="text-white font-medium text-sm">Recovery Codes</p>
                        <p className="text-gray-400 text-xs">Store recovery codes in a safe place if you lose access</p>
                    </div>
                </div>
                {enabled ? (
                    <div className="flex items-center gap-2">
                        <Button type="button" onClick={() => setShowingCodes((s) => !s)}>
                            {showingCodes ? 'Hide' : 'Show'}
                        </Button>
                        <Button type="button" onClick={() => regenerate.run()} disabled={regenerate.pending}>
                            Regenerate
                        </Button>
                    </div>
                ) : (
                    <span className="px-3 py-1 rounded-lg bg-white/5 text-gray-400 text-xs font-medium border border-white/10">
                        Unavailable
                    </span>
                )}
            </div>

            {enabled && showingCodes && recoveryCodes.length > 0 && (
                <div className="p-4 bg-black/40 border border-white/10 rounded-xl">
                    <p className="text-xs text-gray-400 mb-2">Each code can be used once. Store them somewhere safe.</p>
                    <ul className="grid grid-cols-2 gap-1 font-mono text-sm text-white">
                        {recoveryCodes.map((c) => (
                            <li key={c} className="px-2 py-1 bg-white/5 rounded">{c}</li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
