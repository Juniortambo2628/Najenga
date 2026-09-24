import { useMemo, useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import { assertPasskey, passkeySupported } from '@/Utils/webauthn';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';

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
                <h2 className="text-2xl font-bold text-white mb-1">Passkey sign-in</h2>
                <p className="text-gray-400 text-sm">
                    {supported
                        ? 'Enter your email and confirm with your device.'
                        : 'This browser does not support passkeys. Use password or email code instead.'}
                </p>
            </div>

            {supported && (
                <form onSubmit={signIn} className="space-y-4">
                    <div>
                        <InputLabel htmlFor="email" value="Email" />
                        <TextInput
                            id="email"
                            type="email"
                            name="email"
                            autoComplete="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="mt-1 block w-full"
                            required
                            autoFocus
                        />
                        <InputError message={error} className="mt-2" />
                    </div>

                    <div className="flex items-center justify-between">
                        <Link href={route('login')} className="text-sm text-gray-400 hover:text-white underline">
                            Use password instead
                        </Link>
                        <PrimaryButton disabled={busy}>
                            {busy ? 'Waiting for browser…' : 'Continue with passkey'}
                        </PrimaryButton>
                    </div>
                </form>
            )}

            <p className="text-center text-gray-400 text-sm mt-6">
                <Link href={route('login.code')} className="hover:text-white underline">
                    Or sign in with an email code
                </Link>
            </p>
        </GuestLayout>
    );
}
