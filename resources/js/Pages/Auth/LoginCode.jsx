import { Head, Link, useForm, usePage } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import InputError from '@/Components/InputError';

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
                <h1 className="text-3xl font-semibold tracking-tight text-[#1A1514] mb-1">
                    {awaitingCode ? 'Enter your code' : 'Get a sign-in code'}
                </h1>
                <p className="text-[#6B5D58] text-sm">
                    {awaitingCode
                        ? `We sent a 6-digit code to ${email}. It expires in 10 minutes.`
                        : 'Enter your account email and we\'ll send you a code.'}
                </p>
            </div>

            {status && (
                <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                    {status}
                </div>
            )}

            {!awaitingCode ? (
                <form onSubmit={requestCode} className="space-y-4">
                    <div>
                        <label htmlFor="email" className="mb-2 block text-xs font-semibold text-[#3A2F2C]">Email</label>
                        <input
                            id="email"
                            type="email"
                            name="email"
                            autoComplete="email"
                            value={requestForm.data.email}
                            className="auth-field"
                            onChange={(e) => requestForm.setData('email', e.target.value)}
                            required
                            autoFocus
                        />
                        <InputError light message={requestForm.errors.email} className="mt-2" />
                    </div>

                    <div className="flex items-center justify-between">
                        <Link href={route('login')} className="text-sm text-[#6B5D58] hover:text-[#1A1514] underline">
                            Use password instead
                        </Link>
                        <button type="submit" disabled={requestForm.processing} className="auth-submit !mt-0 !w-auto px-8">Send code</button>
                    </div>
                </form>
            ) : (
                <form onSubmit={verifyCode} className="space-y-4">
                    <div>
                        <label htmlFor="code" className="mb-2 block text-xs font-semibold text-[#3A2F2C]">Sign-in code</label>
                        <input
                            id="code"
                            name="code"
                            type="text"
                            inputMode="numeric"
                            autoComplete="one-time-code"
                            maxLength={6}
                            value={verifyForm.data.code}
                            className="auth-field"
                            onChange={(e) => verifyForm.setData('code', e.target.value)}
                            required
                            autoFocus
                        />
                        <InputError light message={verifyForm.errors.code} className="mt-2" />
                    </div>

                    <div className="flex items-center justify-between">
                        <button
                            type="button"
                            onClick={resend}
                            disabled={requestForm.processing}
                            className="text-sm text-[#6B5D58] hover:text-[#1A1514] underline disabled:opacity-50"
                        >
                            Resend code
                        </button>
                        <button type="submit" disabled={verifyForm.processing} className="auth-submit !mt-0 !w-auto px-8">Sign in</button>
                    </div>

                    <p className="text-center text-[#8A7B72] text-xs">
                        <Link href={route('login')} className="hover:text-[#1A1514] underline">
                            Cancel and use password
                        </Link>
                    </p>
                </form>
            )}
        </GuestLayout>
    );
}
