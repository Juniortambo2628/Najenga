import InputError from '@/Components/InputError';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { useState } from 'react';

export default function TwoFactorChallenge() {
    const [mode, setMode] = useState('code');
    const { data, setData, post, processing, errors, reset } = useForm({
        code: '',
        recovery_code: '',
    });

    const switchMode = (nextMode) => {
        setMode(nextMode);
        reset('code', 'recovery_code');
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('two-factor.login.store'));
    };

    return (
        <GuestLayout>
            <Head title="Two-Factor Authentication" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="auth-card"
            >
                <div className="text-center mb-8">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/10 flex items-center justify-center">
                        <i className="fas fa-shield-halved text-2xl text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-2">
                        Two-Factor Authentication
                    </h1>
                    <p className="text-gray-400 text-sm">
                        {mode === 'code'
                            ? 'Enter the 6-digit code from your authenticator app.'
                            : 'Enter one of your recovery codes to sign in.'}
                    </p>
                </div>

                <form onSubmit={submit} className="space-y-6">
                    {mode === 'code' ? (
                        <div>
                            <label
                                htmlFor="code"
                                className="block text-gray-300 text-sm font-medium mb-2"
                            >
                                Authentication Code
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
                                onChange={(e) =>
                                    setData(
                                        'code',
                                        e.target.value.replace(/\D/g, '')
                                    )
                                }
                            />
                            <InputError message={errors.code} className="mt-2" />
                        </div>
                    ) : (
                        <div>
                            <label
                                htmlFor="recovery_code"
                                className="block text-gray-300 text-sm font-medium mb-2"
                            >
                                Recovery Code
                            </label>
                            <input
                                id="recovery_code"
                                type="text"
                                name="recovery_code"
                                autoComplete="one-time-code"
                                value={data.recovery_code}
                                className="auth-input"
                                placeholder="Enter recovery code"
                                autoFocus
                                onChange={(e) =>
                                    setData('recovery_code', e.target.value)
                                }
                            />
                            <InputError
                                message={errors.recovery_code}
                                className="mt-2"
                            />
                        </div>
                    )}

                    <motion.button
                        type="submit"
                        disabled={processing}
                        className="auth-submit"
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                    >
                        {processing ? 'Please wait...' : 'Verify & Sign In'}
                    </motion.button>
                </form>

                <div className="text-center mt-4">
                    <button
                        type="button"
                        onClick={() =>
                            switchMode(mode === 'code' ? 'recovery' : 'code')
                        }
                        className="text-sm text-gray-400 hover:text-white transition"
                    >
                        {mode === 'code'
                            ? 'Use a recovery code instead'
                            : 'Use an authentication code instead'}
                    </button>
                </div>

                <p className="text-center text-gray-400 text-sm mt-6">
                    <Link
                        href={route('login')}
                        className="hover:text-white transition"
                    >
                        Back to sign in
                    </Link>
                </p>
            </motion.div>
        </GuestLayout>
    );
}
