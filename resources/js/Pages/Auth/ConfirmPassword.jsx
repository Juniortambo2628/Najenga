import InputError from '@/Components/InputError';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';

export default function ConfirmPassword() {
    const { data, setData, post, processing, errors, reset } = useForm({
        password: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('password.confirm'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout
            stepKey="confirm"
            title="Confirm Your Password"
            subtitle="This is a secure area. Please confirm your password."
        >
            <Head title="Confirm Password - Najenga" />

            <div className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-1">Secure Area</h2>
                <p className="text-gray-400 text-sm">Please confirm your password before continuing.</p>
            </div>

            {/* Lock Icon */}
            <div className="flex justify-center mb-6">
                <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center">
                    <i className="fas fa-lock text-2xl text-white/60"></i>
                </div>
            </div>

            <p className="text-gray-400 text-sm text-center mb-6">
                This is a secure area of the application. Please confirm your password before continuing.
            </p>

            <form onSubmit={submit} className="space-y-4">
                {/* Password */}
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
                        autoFocus
                        onChange={(e) => setData('password', e.target.value)}
                    />
                    <InputError message={errors.password} className="mt-2" />
                </div>

                {/* Submit */}
                <motion.button
                    type="submit"
                    disabled={processing}
                    className="auth-submit"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                >
                    {processing ? 'Confirming...' : 'Confirm Password'}
                </motion.button>
            </form>
        </GuestLayout>
    );
}
