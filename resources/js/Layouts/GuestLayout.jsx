import { Link } from '@inertiajs/react';
import { motion } from 'framer-motion';

const STEPS = {
    register: [
        { num: 1, label: 'Sign up your account' },
        { num: 2, label: 'Set up your workspace' },
        { num: 3, label: 'Set up your profile' },
    ],
    login: [
        { num: 1, label: 'Enter your credentials' },
        { num: 2, label: 'Access your dashboard' },
        { num: 3, label: 'Manage your projects' },
    ],
    forgot: [
        { num: 1, label: 'Enter your email' },
        { num: 2, label: 'Check your inbox' },
        { num: 3, label: 'Create new password' },
    ],
    reset: [
        { num: 1, label: 'Verify your identity' },
        { num: 2, label: 'Enter new password' },
        { num: 3, label: 'Sign in again' },
    ],
    verify: [
        { num: 1, label: 'Check your email' },
        { num: 2, label: 'Click verification link' },
        { num: 3, label: 'Start building' },
    ],
    confirm: [
        { num: 1, label: 'Confirm your identity' },
        { num: 2, label: 'Enter password' },
        { num: 3, label: 'Continue securely' },
    ],
};

export default function GuestLayout({ children, stepKey = 'register', title, subtitle }) {
    const steps = STEPS[stepKey] || STEPS.register;

    return (
        <div className="flex min-h-screen">
            {/* Left Panel - Image + Branding */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
                {/* Background Image */}
                <div className="absolute inset-0">
                    <img
                        src="/Najenga-backgrounds/pexels-curtis-adams-1694007-7027840.jpg"
                        alt="Construction site"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-[rgb(139,0,0)]/80 via-black/60 to-black/90" />
                </div>

                {/* Content */}
                <div className="relative z-10 flex flex-col justify-center px-12 xl:px-16 w-full">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, ease: 'easeOut' }}
                    >
                        <Link href="/" className="flex items-center gap-3 mb-12">
                            <img
                                src="/Najenga-logos/Najenga-Logo-header-footer-logo-transparent.png"
                                alt="Najenga"
                                className="h-14"
                            />
                        </Link>

                        <h1 className="text-4xl xl:text-5xl font-bold text-white leading-tight mb-4">
                            {title || 'Get Started with Us'}
                        </h1>
                        <p className="text-lg text-white/70 mb-10 max-w-md">
                            {subtitle || 'Complete these easy steps to register your account.'}
                        </p>

                        <div className="space-y-3 max-w-sm">
                            {steps.map((step, idx) => (
                                <motion.div
                                    key={step.num}
                                    className={`flex items-center gap-4 px-5 py-4 rounded-xl transition-all duration-300 ${
                                        idx === 0
                                            ? 'bg-white text-black font-semibold shadow-lg'
                                            : 'bg-white/10 text-white/70 border border-white/10'
                                    }`}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.4, delay: 0.2 + idx * 0.1 }}
                                >
                                    <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                                        idx === 0
                                            ? 'bg-[rgb(139,0,0)] text-white'
                                            : 'bg-white/20 text-white'
                                    }`}>
                                        {step.num}
                                    </span>
                                    <span className="text-sm">{step.label}</span>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Right Panel - Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center bg-[#0a0a0a] p-6 sm:p-8">
                <motion.div
                    className="w-full max-w-md"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                >
                    {/* Mobile Logo */}
                    <div className="lg:hidden text-center mb-8">
                        <Link href="/" className="inline-flex items-center gap-3">
                            <img
                                src="/Najenga-logos/Najenga-Logo-header-footer-logo-transparent.png"
                                alt="Najenga"
                                className="h-12"
                            />
                        </Link>
                    </div>

                    {children}
                </motion.div>
            </div>
        </div>
    );
}
