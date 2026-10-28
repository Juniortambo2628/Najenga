import InputError from '@/Components/InputError';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';

export default function ResetPassword({ token, email }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        token: token,
        email: email,
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('password.store'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <GuestLayout
            stepKey="reset"
            title="Create New Password"
            subtitle="Choose a strong password to secure your account."
        >
            <Head title="Reset Password - Najenga" />

            <div className="mb-8">
                <h1 className="text-3xl font-semibold tracking-tight text-[#1A1514] mb-1">Reset Password</h1>
                <p className="text-[#6B5D58] text-sm">Enter your new password below.</p>
            </div>

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
                        autoComplete="username"
                        onChange={(e) => setData('email', e.target.value)}
                    />
                    <InputError light message={errors.email} className="mt-2" />
                </div>

                {/* Password */}
                <div>
                    <label htmlFor="password" className="block text-[#3A2F2C] text-sm font-medium mb-2">
                        New Password
                    </label>
                    <input
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="auth-field"
                        placeholder="Enter new password"
                        autoComplete="new-password"
                        autoFocus
                        onChange={(e) => setData('password', e.target.value)}
                    />
                    <InputError light message={errors.password} className="mt-2" />
                </div>

                {/* Confirm Password */}
                <div>
                    <label htmlFor="password_confirmation" className="block text-[#3A2F2C] text-sm font-medium mb-2">
                        Confirm Password
                    </label>
                    <input
                        id="password_confirmation"
                        type="password"
                        name="password_confirmation"
                        value={data.password_confirmation}
                        className="auth-field"
                        placeholder="Confirm your password"
                        autoComplete="new-password"
                        onChange={(e) => setData('password_confirmation', e.target.value)}
                    />
                    <InputError light message={errors.password_confirmation} className="mt-2" />
                </div>

                {/* Submit */}
                <motion.button
                    type="submit"
                    disabled={processing}
                    className="auth-submit"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                >
                    {processing ? 'Resetting...' : 'Reset Password'}
                </motion.button>
            </form>

            <p className="text-center text-[#6B5D58] text-sm mt-6">
                <Link href={route('login')} className="text-[#1A1514] font-semibold hover:underline">
                    Back to Sign In
                </Link>
            </p>
        </GuestLayout>
    );
}
