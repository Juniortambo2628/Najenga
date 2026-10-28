import { useMemo, useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import { assertPasskey, passkeySupported } from '@/Utils/webauthn';
import InputError from '@/Components/InputError';

export default function PasskeyLogin() {
    const supported = useMemo(() => passkeySupported(), []);
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [busy, setBusy] = useState(false);

    const signIn = async (e) => {
        e.preventDefault();
        setError('');
        if (!email.trim()) {
            setError('Enter your account email.');
            return;
        }
        setBusy(true);
        try {
            const optsRes = await window.axios.post(route('login.passkey.options'), {
                email: email.trim(),
            });
            const response = await assertPasskey(optsRes.data);
            router.post(
                route('login.passkey.verify'),
                { response },
                {
                    onError: (errs) => setError(errs.response || 'Passkey sign-in failed.'),
                    onFinish: () => setBusy(false),
                },
            );
        } catch (err) {
            setBusy(false);
            setError(err?.message || 'Passkey sign-in was cancelled.');
        }
    };

    return (
        <GuestLayout
            stepKey="passkey"
            title="Sign in with a passkey"
            subtitle="Use Touch ID, Windows Hello, or a security key."
        >
            <Head title="Sign in with a passkey - Najenga" />

            <div className="mb-6">
                <h1 className="text-3xl font-semibold tracking-tight text-[#1A1514] mb-1">Passkey sign-in</h1>
                <p className="text-[#6B5D58] text-sm">
                    {supported
                        ? 'Enter your email and confirm with your device.'
                        : 'This browser does not support passkeys. Use password or email code instead.'}
                </p>
            </div>

            {supported && (
                <form onSubmit={signIn} className="space-y-4">
                    <div>
                        <label htmlFor="email" className="mb-2 block text-xs font-semibold text-[#3A2F2C]">Email</label>
                        <input
                            id="email"
                            type="email"
                            name="email"
                            autoComplete="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="auth-field"
                            required
                            autoFocus
                        />
                        <InputError light message={error} className="mt-2" />
                    </div>

                    <div className="flex items-center justify-between">
                        <Link href={route('login')} className="text-sm text-[#6B5D58] hover:text-[#1A1514] underline">
                            Use password instead
                        </Link>
                        <button type="submit" disabled={busy} className="auth-submit !mt-0 !w-auto px-8">
                            {busy ? 'Waiting for browser…' : 'Continue with passkey'}
                        </button>
                    </div>
                </form>
            )}

            <p className="text-center text-[#6B5D58] text-sm mt-6">
                <Link href={route('login.code')} className="hover:text-[#1A1514] underline">
                    Or sign in with an email code
                </Link>
            </p>
        </GuestLayout>
    );
}
