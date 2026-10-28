import InputError from '@/Components/InputError';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { usePasskeyVerify } from '@laravel/passkeys/react';
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
    const {
        verify,
        isLoading: passkeyLoading,
        error: passkeyError,
        isSupported: passkeySupported,
    } = usePasskeyVerify({
        autofill: true,
        onSuccess: (response) => {
            if (response.redirect) {
                window.location.href = response.redirect;
            }
        },
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
                <h1 className="text-3xl font-semibold tracking-tight text-[#1A1514] mb-1">Sign In Account</h1>
                <p className="text-[#6B5D58] text-sm">Enter your credentials to access your account.</p>
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
                        autoComplete="username webauthn"
                        autoFocus
                        onChange={(e) => setData('email', e.target.value)}
                    />
                    <InputError light message={errors.email} className="mt-2" />
                </div>

                {/* Password */}
                {mode === 'password' && (
                    <div>
                        <label htmlFor="password" className="block text-[#3A2F2C] text-sm font-medium mb-2">
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            name="password"
                            value={data.password}
                            className="auth-field"
                            placeholder="Enter your password"
                            autoComplete="current-password"
                            onChange={(e) => setData('password', e.target.value)}
                        />
                        <InputError light message={errors.password} className="mt-2" />
                    </div>
                )}

                {/* Login Code */}
                {mode === 'code' && codeSent && (
                    <div>
                        <label htmlFor="code" className="block text-[#3A2F2C] text-sm font-medium mb-2">
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
                            className="auth-field"
                            placeholder="6-digit code"
                            autoFocus
                            onChange={(e) => setData('code', e.target.value.replace(/\D/g, ''))}
                        />
                        <InputError light message={errors.code} className="mt-2" />
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
                                className="w-4 h-4 rounded border-[#D8CEC7] bg-[#F1ECE8] text-[rgb(139,0,0)] focus:ring-[rgb(139,0,0)]"
                            />
                            <span className="text-[#6B5D58] text-sm">Remember me</span>
                        </label>
                        {canResetPassword && (
                            <Link
                                href={route('password.request')}
                                className="text-sm text-[#6B5D58] hover:text-[#1A1514] transition"
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

            {passkeySupported && (
                <div className="mt-5">
                    <div className="flex items-center gap-3 mb-4">
                        <span className="flex-1 h-px bg-[#F1ECE8]"></span>
                        <span className="text-[#8A7B72] text-xs">or</span>
                        <span className="flex-1 h-px bg-[#F1ECE8]"></span>
                    </div>
                    <motion.button
                        type="button"
                        onClick={() => verify()}
                        disabled={passkeyLoading}
                        className="w-full h-12 px-5 rounded-full border border-[#E6DFD9] bg-white text-[#1A1514] text-sm font-medium hover:bg-[#F1ECE8] transition disabled:opacity-50"
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                    >
                        {passkeyLoading
                            ? 'Waiting for authenticator...'
                            : 'Sign in with passkey'}
                    </motion.button>
                    {passkeyError && (
                        <p className="text-sm text-red-600 mt-2 text-center">
                            {passkeyError}
                        </p>
                    )}
                </div>
            )}

            <div className="text-center mt-4">
                <button
                    type="button"
                    onClick={() => switchMode(mode === 'password' ? 'code' : 'password')}
                    className="text-sm text-[#6B5D58] hover:text-[#1A1514] transition"
                >
                    {mode === 'password'
                        ? 'Email me a sign-in code instead'
                        : 'Use password instead'}
                </button>
            </div>

            <p className="text-center text-[#6B5D58] text-sm mt-6">
                Don't have an account?{' '}
                <Link href={route('register')} className="text-[#1A1514] font-semibold hover:underline">
                    Sign up
                </Link>
            </p>
        </GuestLayout>
    );
}
