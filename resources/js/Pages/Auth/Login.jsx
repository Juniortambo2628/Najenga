import InputError from '@/Components/InputError';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { useState } from 'react';

export default function Login({ status, canResetPassword }) {
    const [mode, setMode] = useState('password');
    const [codeSent, setCodeSent] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
        code: '',
    });

    const switchMode = (nextMode) => {
        setMode(nextMode);
        setCodeSent(false);
        reset('password', 'code');
    };

    const submit = (e) => {
        e.preventDefault();

        if (mode === 'code') {
            if (!codeSent) {
                post(route('login-code.request'), {
                    onSuccess: () => setCodeSent(true),
                });
            } else {
                post(route('login-code.verify'));
            }
            return;
        }

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout
            stepKey="login"
            title="Welcome Back"
            subtitle="Sign in to access your projects and continue building."
        >
            <Head title="Login - Najenga" />

            <div className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-1">Sign In Account</h2>
                <p className="text-gray-400 text-sm">Enter your credentials to access your account.</p>
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
                        autoComplete="username"
                        autoFocus
                        onChange={(e) => setData('email', e.target.value)}
                    />
                    <InputError message={errors.email} className="mt-2" />
                </div>

                {/* Password */}
                {mode === 'password' && (
                    <div>
                        <label htmlFor="password" className="block text-gray-300 text-sm font-medium mb-2">
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            name="password"
                            value={data.password}
                            className="auth-input"
                            placeholder="Enter your password"
                            autoComplete="current-password"
                            onChange={(e) => setData('password', e.target.value)}
                        />
                        <InputError message={errors.password} className="mt-2" />
                    </div>
                )}

                {/* Login Code */}
                {mode === 'code' && codeSent && (
                    <div>
                        <label htmlFor="code" className="block text-gray-300 text-sm font-medium mb-2">
                            Sign-In Code
                        </label>
                        <input
                            id="code"
                            type="text"
                            name="code"
                            inputMode="numeric"
                            autoComplete="one-time-code"
                            maxLength={6}
                            value={data.code}
                            className="auth-input"
                            placeholder="6-digit code"
                            autoFocus
                            onChange={(e) => setData('code', e.target.value.replace(/\D/g, ''))}
                        />
                        <InputError message={errors.code} className="mt-2" />
                    </div>
                )}

                {/* Remember Me + Forgot */}
                {mode === 'password' && (
                    <div className="flex items-center justify-between">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                name="remember"
                                checked={data.remember}
                                onChange={(e) => setData('remember', e.target.checked)}
                                className="w-4 h-4 rounded border-white/20 bg-white/10 text-[rgb(139,0,0)] focus:ring-[rgb(139,0,0)]"
                            />
                            <span className="text-gray-400 text-sm">Remember me</span>
                        </label>
                        {canResetPassword && (
                            <Link
                                href={route('password.request')}
                                className="text-sm text-gray-400 hover:text-white transition"
                            >
                                Forgot password?
                            </Link>
                        )}
                    </div>
                )}

                {/* Submit */}
                <motion.button
                    type="submit"
                    disabled={processing}
                    className="auth-submit"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                >
                    {processing
                        ? 'Please wait...'
                        : mode === 'password'
                            ? 'Sign In'
                            : codeSent
                                ? 'Verify & Sign In'
                                : 'Send Sign-In Code'}
                </motion.button>
            </form>

            <div className="text-center mt-4">
                <button
                    type="button"
                    onClick={() => switchMode(mode === 'password' ? 'code' : 'password')}
                    className="text-sm text-gray-400 hover:text-white transition"
                >
                    {mode === 'password'
                        ? 'Email me a sign-in code instead'
                        : 'Use password instead'}
                </button>
            </div>

            <p className="text-center text-gray-400 text-sm mt-6">
                Don't have an account?{' '}
                <Link href={route('register')} className="text-white font-semibold hover:underline">
                    Sign up
                </Link>
            </p>
        </GuestLayout>
    );
}
