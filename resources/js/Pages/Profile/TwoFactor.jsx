import InputError from '@/Components/InputError';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { rootBreadcrumbs } from '@/Config/navigation';
import { Head, Link, usePage } from '@inertiajs/react';
import DashboardPage from '@/Components/DashboardPage';
import { useEffect, useState } from 'react';
import useAction, { visit } from '@/Hooks/useAction';

export default function TwoFactor({ enabled, pending: initialPending }) {
    const [pending, setPending] = useState(initialPending);
    const [isEnabled, setIsEnabled] = useState(enabled);
    const [qr, setQr] = useState(null);
    const [secret, setSecret] = useState(null);
    const [codes, setCodes] = useState(null);
    const [showCodes, setShowCodes] = useState(false);
    const [code, setCode] = useState('');
    const { errors } = usePage().props;

    const confirmError =
        errors?.confirmTwoFactorAuthentication?.code || errors?.code;

    const loadCodes = () =>
        fetch(route('two-factor.recovery-codes'))
            .then((response) => (response.ok ? response.json() : []))
            .then((data) => setCodes(Array.isArray(data) ? data : []));

    useEffect(() => {
        if (!pending || isEnabled) {
            return;
        }

        Promise.all([
            fetch(route('two-factor.qr-code')).then((response) =>
                response.json()
            ),
            fetch(route('two-factor.secret-key')).then((response) =>
                response.json()
            ),
        ]).then(([qrData, secretData]) => {
            setQr(qrData.svg || null);
            setSecret(secretData.secretKey || null);
        });
    }, [pending, isEnabled]);

    useEffect(() => {
        if (isEnabled && showCodes) {
            loadCodes();
        }
    }, [isEnabled, showCodes]);

    const enableAction = useAction(() => visit('post', route('two-factor.enable'), {}, { preserveScroll: false }), {
        key: () => 'enable',
        onSuccess: () => setPending(true),
    });
    const enable = () => enableAction.run();

    const confirmAction2fa = useAction((value) => visit('post', route('two-factor.confirm'), { code: value }, { preserveScroll: false }), {
        key: () => 'confirm',
        error: false, // the code field shows the error
        onSuccess: () => {
            setIsEnabled(true);
            setPending(false);
            setCode('');
            setShowCodes(true);
        },
    });
    const confirm = (e) => {
        e.preventDefault();
        confirmAction2fa.run(code);
    };

    const regenerateAction = useAction(() => visit('post', route('two-factor.regenerate-recovery-codes'), {}, { preserveScroll: false }), {
        confirm: { title: 'Regenerate recovery codes?', message: 'Your old codes will stop working.', confirmLabel: 'Regenerate' },
        key: () => 'regenerate',
        onSuccess: () => loadCodes(),
    });
    const regenerate = () => regenerateAction.run();

    const disableAction = useAction(() => visit('delete', route('two-factor.disable'), {}, { preserveScroll: false }), {
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
                        { label: 'Settings', href: route('profile.edit') },
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
                            href={route('profile.edit')}
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
