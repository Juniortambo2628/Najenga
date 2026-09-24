import { Head, Link, useForm, usePage } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';

export default function LoginCode({ email, awaitingCode }) {
    const { flash } = usePage().props;
    const status = flash?.status;

    const requestForm = useForm({ email: email || '' });
    const verifyForm = useForm({ email: email || '', code: '' });

    const requestCode = (e) => {
        e.preventDefault();
        requestForm.post(route('login.code.request'));
    };

    const verifyCode = (e) => {
        e.preventDefault();
        verifyForm.post(route('login.code.verify'), {
            onFinish: () => verifyForm.reset('code'),
        });
    };

    const resend = () => {
        requestForm.post(route('login.code.request'), { preserveScroll: true });
    };

    return (
        <GuestLayout
            stepKey="login-code"
            title="Sign in with a code"
            subtitle="We'll email you a one-time code instead of a password."
        >
            <Head title="Sign in with a code - Najenga" />

            <div className="mb-6">
                <h2 className="text-2xl font-bold text-white mb-1">
                    {awaitingCode ? 'Enter your code' : 'Get a sign-in code'}
                </h2>
                <p className="text-gray-400 text-sm">
                    {awaitingCode
                        ? `We sent a 6-digit code to ${email}. It expires in 10 minutes.`
                        : 'Enter your account email and we\'ll send you a code.'}
                </p>
            </div>

            {status && (
                <div className="mb-4 rounded-lg border border-green-500/20 bg-green-500/10 px-3 py-2 text-sm text-green-300">
                    {status}
                </div>
            )}

            {!awaitingCode ? (
                <form onSubmit={requestCode} className="space-y-4">
                    <div>
                        <InputLabel htmlFor="email" value="Email" />
                        <TextInput
                            id="email"
                            type="email"
                            name="email"
                            autoComplete="email"
                            value={requestForm.data.email}
                            className="mt-1 block w-full"
                            onChange={(e) => requestForm.setData('email', e.target.value)}
                            required
                            autoFocus
                        />
                        <InputError message={requestForm.errors.email} className="mt-2" />
                    </div>

                    <div className="flex items-center justify-between">
                        <Link href={route('login')} className="text-sm text-gray-400 hover:text-white underline">
                            Use password instead
                        </Link>
                        <PrimaryButton disabled={requestForm.processing}>Send code</PrimaryButton>
                    </div>
                </form>
            ) : (
                <form onSubmit={verifyCode} className="space-y-4">
                    <div>
                        <InputLabel htmlFor="code" value="Sign-in code" />
                        <TextInput
                            id="code"
                            name="code"
                            type="text"
                            inputMode="numeric"
                            autoComplete="one-time-code"
                            maxLength={6}
                            value={verifyForm.data.code}
                            className="mt-1 block w-full"
                            onChange={(e) => verifyForm.setData('code', e.target.value)}
                            required
                            autoFocus
                        />
                        <InputError message={verifyForm.errors.code} className="mt-2" />
                    </div>

                    <div className="flex items-center justify-between">
                        <button
                            type="button"
                            onClick={resend}
                            disabled={requestForm.processing}
                            className="text-sm text-gray-400 hover:text-white underline disabled:opacity-50"
                        >
                            Resend code
                        </button>
                        <PrimaryButton disabled={verifyForm.processing}>Sign in</PrimaryButton>
                    </div>

                    <p className="text-center text-gray-500 text-xs">
                        <Link href={route('login')} className="hover:text-white underline">
                            Cancel and use password
                        </Link>
                    </p>
                </form>
            )}
        </GuestLayout>
    );
}
