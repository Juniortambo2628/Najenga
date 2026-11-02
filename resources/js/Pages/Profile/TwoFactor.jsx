import InputError from '@/Components/InputError';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { rootBreadcrumbs } from '@/Config/navigation';
import { Head, Link } from '@inertiajs/react';
import DashboardPage from '@/Components/DashboardPage';
import axios from 'axios';
import { useEffect, useState } from 'react';
import useAction from '@/Hooks/useAction';

/** Two-step sign-in, on the kit's endpoints (/api/2fa/…). `setup` is a setup already started: its secret and QR code. */
export default function TwoFactor({ enabled, pending: initialPending, setup = null }) {
    const [pending, setPending] = useState(initialPending);
    const [isEnabled, setIsEnabled] = useState(enabled);
    const [qr, setQr] = useState(setup?.qr_svg ?? null);
    const [secret, setSecret] = useState(setup?.secret ?? null);
    const [codes, setCodes] = useState(null);
    const [showCodes, setShowCodes] = useState(false);
    const [code, setCode] = useState('');
    const [confirmError, setConfirmError] = useState(null);

    const loadCodes = () =>
        axios
            .get('/api/2fa/recovery-codes')
            .then((response) => setCodes(response.data?.recovery_codes ?? []))
            .catch(() => setCodes([]));

    useEffect(() => {
        if (isEnabled && showCodes) {
            loadCodes();
        }
    }, [isEnabled, showCodes]);

    const enableAction = useAction(() => axios.post('/api/2fa/setup'), {
        key: () => 'enable',
        onSuccess: (response) => {
            setQr(response.data?.qr_code_svg || null);
            setSecret(response.data?.secret || null);
            setPending(true);
        },
    });
    const enable = () => enableAction.run();

    const confirmAction2fa = useAction((value) => axios.post('/api/2fa/confirm', { code: value }), {
        key: () => 'confirm',
        error: false, // the code field shows the error
        onSuccess: (response) => {
            setIsEnabled(true);
            setPending(false);
            setCode('');
            setConfirmError(null);
            setCodes(response.data?.recovery_codes ?? null);
            setShowCodes(true);
        },
        onError: (error) => setConfirmError(error.response?.data?.message || 'That code didn’t work. Try again.'),
    });
    const confirm = (e) => {
        e.preventDefault();
        confirmAction2fa.run(code);
    };

    const regenerateAction = useAction(() => axios.post('/api/2fa/recovery-codes'), {
        confirm: { title: 'Regenerate recovery codes?', message: 'Your old codes will stop working.', confirmLabel: 'Regenerate' },
        key: () => 'regenerate',
        onSuccess: (response) => setCodes(response.data?.recovery_codes ?? []),
    });
    const regenerate = () => regenerateAction.run();

    const disableAction = useAction(() => axios.post('/api/2fa/disable'), {
        confirm: 'Turn off two-factor authentication?',
        key: () => 'disable',
        onSuccess: () => {
            setIsEnabled(false);
            setPending(false);
            setCodes(null);
            setShowCodes(false);
            setQr(null);
            setSecret(null);
        },
    });
    const disable = () => disableAction.run();

    const processing = enableAction.pending || confirmAction2fa.pending || regenerateAction.pending || disableAction.pending;

    return (
        <AuthenticatedLayout>
            <Head title="Two-Factor Authentication" />

            <DashboardPage
                className="max-w-4xl mx-auto"
                hero={{
                    title: 'Two-Factor Authentication',
                    subtitle: 'Add an extra layer of security to your account',
                    breadcrumbs: [
                        ...rootBreadcrumbs(),
                        { label: 'Settings', href: route('settings') },
                        { label: 'Two-Factor Authentication' },
                    ],
                }}
            >
                <div className="space-y-6">
                    <section className="panel p-6">
                        <header className="mb-6 flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-bold text-white">
                                    Authenticator App
                                </h2>
                                <p className="text-sm text-gray-400 mt-1">
                                    Use an authenticator app to generate
                                    one-time codes when you sign in.
                                </p>
                            </div>
                            <span
                                className={`px-3 py-1 rounded-lg text-xs font-medium border ${
                                    isEnabled
                                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                        : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                                }`}
                            >
                                {isEnabled ? 'Enabled' : 'Not Enabled'}
                            </span>
                        </header>

                        {!isEnabled && !pending && (
                            <div>
                                <p className="text-sm text-gray-400 mb-4">
                                    Scan the QR code with your authenticator
                                    app, then enter the code it generates to
                                    finish setup.
                                </p>
                                <button
                                    type="button"
                                    onClick={enable}
                                    disabled={processing}
                                    className="px-5 py-2.5 rounded-xl bg-[rgb(139,0,0)] text-white text-sm font-medium hover:bg-[rgb(160,20,20)] transition disabled:opacity-50"
                                >
                                    {processing
                                        ? 'Please wait...'
                                        : 'Set up authenticator app'}
                                </button>
                            </div>
                        )}

                        {pending && !isEnabled && (
                            <div className="space-y-6">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                                        {qr ? (
                                            <div
                                                className="bg-white rounded-lg p-3 w-fit mx-auto"
                                                dangerouslySetInnerHTML={{
                                                    __html: qr,
                                                }}
                                            />
                                        ) : (
                                            <p className="text-gray-500 text-sm text-center">
                                                Loading QR code...
                                            </p>
                                        )}
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-sm text-gray-400 mb-2">
                                                Or enter this key manually:
                                            </p>
                                            <code className="block break-all px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm">
                                                {secret || '...'}
                                            </code>
                                        </div>
                                        <form
                                            onSubmit={confirm}
                                            className="space-y-3"
                                        >
                                            <label
                                                htmlFor="confirm-code"
                                                className="block text-gray-300 text-sm font-medium"
                                            >
                                                Confirmation code
                                            </label>
                                            <input
                                                id="confirm-code"
                                                type="text"
                                                inputMode="numeric"
                                                autoComplete="one-time-code"
                                                maxLength={6}
                                                value={code}
                                                className="auth-input"
                                                placeholder="6-digit code"
                                                onChange={(e) =>
                                                    setCode(
                                                        e.target.value.replace(
                                                            /\D/g,
                                                            ''
                                                        )
                                                    )
                                                }
                                            />
                                            <InputError
                                                message={confirmError}
                                                className="mt-1"
                                            />
                                            <button
                                                type="submit"
                                                disabled={processing || code.length !== 6}
                                                className="px-5 py-2.5 rounded-xl bg-[rgb(139,0,0)] text-white text-sm font-medium hover:bg-[rgb(160,20,20)] transition disabled:opacity-50"
                                            >
                                                {processing
                                                    ? 'Verifying...'
                                                    : 'Confirm and enable'}
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        )}

                        {isEnabled && (
                            <div className="flex flex-wrap gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowCodes((v) => !v)}
                                    className="px-5 py-2.5 rounded-xl bg-white/10 text-white text-sm font-medium hover:bg-white/15 transition"
                                >
                                    {showCodes
                                        ? 'Hide recovery codes'
                                        : 'View recovery codes'}
                                </button>
                                <button
                                    type="button"
                                    onClick={regenerate}
                                    disabled={processing}
                                    className="px-5 py-2.5 rounded-xl bg-white/10 text-white text-sm font-medium hover:bg-white/15 transition disabled:opacity-50"
                                >
                                    Regenerate recovery codes
                                </button>
                                <button
                                    type="button"
                                    onClick={disable}
                                    disabled={processing}
                                    className="px-5 py-2.5 rounded-xl bg-red-500/10 text-red-400 text-sm font-medium border border-red-500/20 hover:bg-red-500/20 transition disabled:opacity-50"
                                >
                                    Disable two-factor authentication
                                </button>
                            </div>
                        )}
                    </section>

                    {isEnabled && showCodes && (
                        <section className="panel p-6">
                            <header className="mb-4">
                                <h2 className="text-lg font-bold text-white">
                                    Recovery Codes
                                </h2>
                                <p className="text-sm text-gray-400 mt-1">
                                    Store these codes somewhere safe. Each code
                                    can be used once if you lose access to your
                                    authenticator app.
                                </p>
                            </header>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
                                {(codes || []).map((recoveryCode) => (
                                    <code
                                        key={recoveryCode}
                                        className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm text-center"
                                    >
                                        {recoveryCode}
                                    </code>
                                ))}
                                {!codes && (
                                    <p className="text-gray-500 text-sm col-span-full">
                                        Loading...
                                    </p>
                                )}
                            </div>
                            <button
                                type="button"
                                onClick={() =>
                                    navigator.clipboard.writeText(
                                        (codes || []).join('\n')
                                    )
                                }
                                className="px-5 py-2.5 rounded-xl bg-white/10 text-white text-sm font-medium hover:bg-white/15 transition"
                            >
                                Copy all codes
                            </button>
                        </section>
                    )}

                    <div>
                        <Link
                            href={route('settings')}
                            className="text-sm text-gray-400 hover:text-white transition"
                        >
                            &larr; Back to settings
                        </Link>
                    </div>
                </div>
            </DashboardPage>
        </AuthenticatedLayout>
    );
}
