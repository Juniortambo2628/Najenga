import InputError from '@/Components/InputError';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';

export default function ForgotPassword({ status }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('password.email'));
    };

    return (
        <GuestLayout
            stepKey="forgot"
            title="Forgot Password?"
            subtitle="No worries! Enter your email and we'll send you a reset link."
        >
            <Head title="Forgot Password - Najenga" />

            <div className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-1">Reset Password</h2>
                <p className="text-gray-400 text-sm">Enter your email to receive a password reset link.</p>
            </div>

            {status && (
                <div className="mb-4 p-3 bg-green-500/20 border border-green-500/30 rounded-xl text-green-400 text-sm text-center">
                    {status}
                </div>
            )}

            <form onSubmit={submit} className="space-y-4">
                {/* Email */}
                <div>
                    <label htmlFor="email" className="block text-gray-300 text-sm font-medium mb-2">
                        Email
                    </label>
                    <input
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="auth-input"
                        placeholder="eg. johnfrans@gmail.com"
                        autoFocus
                        onChange={(e) => setData('email', e.target.value)}
                    />
                    <InputError message={errors.email} className="mt-2" />
                </div>

                {/* Submit */}
                <motion.button
                    type="submit"
                    disabled={processing}
                    className="auth-submit"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                >
                    {processing ? 'Sending...' : 'Send Reset Link'}
                </motion.button>
            </form>

            <p className="text-center text-gray-400 text-sm mt-6">
                Remember your password?{' '}
                <Link href={route('login')} className="text-white font-semibold hover:underline">
                    Sign in
                </Link>
            </p>
        </GuestLayout>
    );
}
