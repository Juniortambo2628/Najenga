import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';

export default function VerifyEmail({ status }) {
    const { post, processing } = useForm({});

    const submit = (e) => {
        e.preventDefault();
        post(route('verification.send'));
    };

    return (
        <GuestLayout
            stepKey="verify"
            title="Verify Your Email"
            subtitle="We've sent you a verification link. Check your inbox."
        >
            <Head title="Email Verification - Najenga" />

            <div className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-1">Email Verification</h2>
                <p className="text-gray-400 text-sm">Verify your email to start using Najenga.</p>
            </div>

            {/* Mail Icon */}
            <div className="flex justify-center mb-6">
                <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center">
                    <i className="fas fa-envelope text-2xl text-white/60"></i>
                </div>
            </div>

            <p className="text-gray-400 text-sm text-center mb-6">
                Thanks for signing up! Before getting started, could you verify your email address by
                clicking on the link we just emailed to you?
            </p>

            {status === 'verification-link-sent' && (
                <div className="mb-4 p-3 bg-green-500/20 border border-green-500/30 rounded-xl text-green-400 text-sm text-center">
                    A new verification link has been sent to the email address you provided during registration.
                </div>
            )}

            <form onSubmit={submit} className="space-y-4">
                <motion.button
                    type="submit"
                    disabled={processing}
                    className="auth-submit"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                >
                    {processing ? 'Sending...' : 'Resend Verification Email'}
                </motion.button>
            </form>

            <div className="flex items-center justify-center gap-4 mt-6">
                <Link href={route('login')} className="text-gray-400 text-sm hover:text-white transition">
                    Back to Login
                </Link>
                <span className="text-gray-600">|</span>
                <Link
                    href={route('logout')}
                    method="post"
                    as="button"
                    className="text-gray-400 text-sm hover:text-white transition"
                >
                    Log Out
                </Link>
            </div>
        </GuestLayout>
    );
}
