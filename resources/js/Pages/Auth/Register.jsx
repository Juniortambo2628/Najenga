import InputError from '@/Components/InputError';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';

export default function Register({ email = '', joiningProject = null }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        first_name: '',
        last_name: '',
        username: '',
        email: email || '',
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <GuestLayout
            stepKey="register"
            title="Get Started with Us"
            subtitle="Complete these easy steps to register your account."
        >
            <Head title="Register - Najenga" />

            <div className="mb-8">
                <h1 className="text-3xl font-semibold tracking-tight text-[#1A1514] mb-1">Sign Up Account</h1>
                <p className="text-[#6B5D58] text-sm">Enter your personal data to create your account.</p>
                {joiningProject && (
                    <p role="status" className="mt-3 rounded-xl border border-rose-400/20 bg-rose-500/10 px-3 py-2 text-sm text-rose-100">
                        <i aria-hidden="true" className="fas fa-user-plus mr-2" />
                        Create your account to join <strong>{joiningProject}</strong>.
                    </p>
                )}
            </div>

            <form onSubmit={submit} className="space-y-4">
                {/* Name Fields */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="first_name" className="block text-[#3A2F2C] text-sm font-medium mb-2">
                            First Name
                        </label>
                        <input
                            id="first_name"
                            type="text"
                            name="first_name"
                            value={data.first_name}
                            className="auth-field"
                            placeholder="eg. John"
                            autoFocus
                            onChange={(e) => setData('first_name', e.target.value)}
                            required
                        />
                        <InputError light message={errors.first_name} className="mt-2" />
                    </div>
                    <div>
                        <label htmlFor="last_name" className="block text-[#3A2F2C] text-sm font-medium mb-2">
                            Last Name
                        </label>
                        <input
                            id="last_name"
                            type="text"
                            name="last_name"
                            value={data.last_name}
                            className="auth-field"
                            placeholder="eg. Francisco"
                            onChange={(e) => setData('last_name', e.target.value)}
                            required
                        />
                        <InputError light message={errors.last_name} className="mt-2" />
                    </div>
                </div>

                {/* Username */}
                <div>
                    <label htmlFor="username" className="block text-[#3A2F2C] text-sm font-medium mb-2">
                        Username
                    </label>
                    <input
                        id="username"
                        type="text"
                        name="username"
                        value={data.username}
                        className="auth-field"
                        placeholder="Choose a username"
                        autoComplete="username"
                        onChange={(e) => setData('username', e.target.value)}
                        required
                    />
                    <InputError light message={errors.username} className="mt-2" />
                </div>

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
                        required
                    />
                    <InputError light message={errors.email} className="mt-2" />
                </div>

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
                        autoComplete="new-password"
                        onChange={(e) => setData('password', e.target.value)}
                        required
                    />
                    <p className="text-[#6B5D58] text-xs mt-1">Must be at least 8 characters.</p>
                    <InputError light message={errors.password} className="mt-1" />
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
                        required
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
                    {processing ? 'Creating Account...' : 'Sign Up'}
                </motion.button>
            </form>

            <p className="text-center text-[#6B5D58] text-sm mt-6">
                Already have an account?{' '}
                <Link href={route('login')} className="text-[#1A1514] font-semibold hover:underline">
                    Log in
                </Link>
            </p>
        </GuestLayout>
    );
}
