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
                <h1 className="text-3xl font-semibold tracking-tight text-[#1A1514] mb-1">Secure Area</h1>
                <p className="text-[#6B5D58] text-sm">Please confirm your password before continuing.</p>
            </div>

            {/* Lock Icon */}
            <div className="flex justify-center mb-6">
                <div className="w-16 h-16 rounded-full bg-[#F1ECE8] flex items-center justify-center">
                    <i aria-hidden="true" className="fas fa-lock text-2xl text-[#B3122E]"></i>
                </div>
            </div>

            <p className="text-[#6B5D58] text-sm text-center mb-6">
                This is a secure area of the application. Please confirm your password before continuing.
            </p>

            <form onSubmit={submit} className="space-y-4">
                {/* Password */}
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
                        autoFocus
                        onChange={(e) => setData('password', e.target.value)}
                    />
                    <InputError light message={errors.password} className="mt-2" />
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
