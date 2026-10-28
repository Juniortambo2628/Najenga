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
                <h1 className="text-3xl font-semibold tracking-tight text-[#1A1514] mb-1">Reset Password</h1>
                <p className="text-[#6B5D58] text-sm">Enter your email to receive a password reset link.</p>
            </div>

            {status && (
                <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-sm text-center">
                    {status}
                </div>
            )}

            <form onSubmit={submit} className="space-y-4">
                {/* Email */}
                <div>
                    <label htmlFor="email" className="block text-[#3A2F2C] text-sm font-medium mb-2">
                        Email
                    </label>
                    <input
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="auth-field"
                        placeholder="eg. johnfrans@gmail.com"
                        autoFocus
                        onChange={(e) => setData('email', e.target.value)}
                    />
                    <InputError light message={errors.email} className="mt-2" />
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

            <p className="text-center text-[#6B5D58] text-sm mt-6">
                Remember your password?{' '}
                <Link href={route('login')} className="text-[#1A1514] font-semibold hover:underline">
                    Sign in
                </Link>
            </p>
        </GuestLayout>
    );
}
