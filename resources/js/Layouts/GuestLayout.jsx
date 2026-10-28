import { Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import FlashToast from '@/Components/FlashToast';

/** The three steps each sign-in page walks through, shown under the showcase. */
const STEPS = {
    register: ['Create your account', 'Set up a project', 'Invite your team'],
    login: ['Sign in', 'Pick a project', 'Pick up where you left off'],
    forgot: ['Enter your email', 'Check your inbox', 'Choose a new password'],
    reset: ['Confirm your email', 'Choose a new password', 'Sign in again'],
    verify: ['Check your email', 'Open the link', 'Start building'],
    confirm: ['Confirm it’s you', 'Enter your password', 'Carry on'],
};

const FEATURES = [
    { icon: 'fa-receipt', label: 'Expenses' },
    { icon: 'fa-images', label: 'Photos' },
    { icon: 'fa-file-alt', label: 'Documents' },
    { icon: 'fa-calendar-alt', label: 'Timeline' },
    { icon: 'fa-users', label: 'Team' },
];

/**
 * The sign-in pages' layout, after Naoa's: a light card with the form on the
 * left, and on the right (desktops only) a dark showcase of Najenga with the
 * page's own headline and steps. Phones get the form alone, full width.
 */
export default function GuestLayout({ children, stepKey = 'register', title, subtitle }) {
    const steps = STEPS[stepKey] || STEPS.register;

    return (
        <div className="flex min-h-dvh items-center justify-center bg-[#F1ECE8] p-3 sm:p-6 lg:p-10">
            <Toaster position="top-right" />
            <FlashToast />

            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45 }}
                className="grid w-full max-w-6xl gap-3 rounded-[2rem] border border-white bg-[#FBF9F7] p-3 shadow-[0_30px_80px_-30px_rgba(26,21,20,0.35)] lg:grid-cols-2"
            >
                <section className="flex flex-col px-5 py-8 sm:px-10 lg:px-14 lg:py-12">
                    <div className="flex items-center justify-between gap-4">
                        <Link href={route('home')} aria-label="Najenga home" className="flex items-center gap-2.5">
                            <img src="/Najenga-logos/Najenga-Logo-trimmed-dark.webp" alt="" className="h-9 w-auto" />
                            <span className="hidden text-[11px] text-[#A8998F] sm:inline">Construction projects</span>
                        </Link>
                        <Link
                            href={route('home')}
                            className="inline-flex items-center gap-1.5 rounded-full border border-[#E6DFD9] px-3 py-1.5 text-xs font-medium text-[#5E5450] transition hover:border-[#C2414F] hover:text-[#1A1514]"
                        >
                            <i aria-hidden="true" className="fas fa-arrow-left text-[10px]" />
                            Back to the website
                        </Link>
                    </div>

                    <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-10 lg:mx-0">{children}</div>
                </section>

                <Showcase title={title} subtitle={subtitle} steps={steps} />
            </motion.div>
        </div>
    );
}

/** The dark right-hand panel: the page's headline, a stylised glimpse of a project, its steps. */
function Showcase({ title, subtitle, steps }) {
    return (
        <aside aria-hidden="true" className="relative hidden min-h-[640px] flex-col overflow-hidden rounded-[1.6rem] bg-[#140F0E] px-10 pb-8 pt-14 text-white lg:flex">
            {/* A crimson glow at the top, like site lights at dusk */}
            <div className="absolute -top-40 left-1/2 h-[30rem] w-[46rem] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(220,20,60,0.45),rgba(139,0,0,0.2)_55%,transparent)]" />

            <div className="relative text-center">
                <p className="text-4xl font-semibold tracking-tight">{title || 'Build it right.'}</p>
                <p className="mx-auto mt-3 max-w-sm text-lg font-light text-white/70">{subtitle || 'Every shilling, every photo, every document.'}</p>
            </div>

            {/* A phone-style card: a project at a glance */}
            <div className="relative mt-10 flex flex-1 items-center justify-center">
                <div className="relative w-64 rounded-[2.2rem] border border-white/10 bg-gradient-to-b from-[#2E1A1C] to-[#120B0C] p-5 shadow-2xl">
                    <div className="flex justify-between text-[10px] text-white/60">
                        <span>9:41</span>
                        <span>● ● ●</span>
                    </div>
                    <p className="mt-5 text-[11px] text-white/50">Your project</p>
                    <p className="text-lg font-semibold leading-tight">Three-bedroom bungalow</p>
                    <p className="mt-0.5 text-[11px] text-white/60">Kitengela · 62% of the budget used</p>
                    <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.06] p-3">
                        <p className="text-[11px] text-white/50">Spending by week</p>
                        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
                            <div className="h-full w-[62%] rounded-full bg-gradient-to-r from-[#8B0000] to-[#DC143C]" />
                        </div>
                        <div className="mt-3 flex h-14 items-end gap-1.5">
                            {[40, 55, 35, 70, 90, 60, 80].map((h, i) => (
                                <span key={i} className="flex-1 rounded-t bg-gradient-to-t from-[#5A0E16] to-[#E0485F]" style={{ height: `${h}%`, opacity: 0.55 + i * 0.06 }} />
                            ))}
                        </div>
                    </div>
                </div>

                {/* A floating note, like a receipt arriving */}
                <div className="absolute left-2 top-[64%] flex items-center gap-3 rounded-2xl border border-white/10 bg-[#24161A]/90 px-3.5 py-2.5 shadow-xl backdrop-blur xl:left-6">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#DC143C]/25">
                        <i className="fas fa-receipt text-xs text-rose-200" />
                    </span>
                    <span className="leading-tight">
                        <span className="block text-[11px] font-medium">Receipt read from WhatsApp</span>
                        <span className="block text-[10px] text-white/50">KES 32,000 · Cement, 40 bags</span>
                    </span>
                </div>
            </div>

            <ol className="relative mt-10 grid grid-cols-3 gap-2 text-[11px]">
                {steps.map((step, i) => (
                    <li key={step} className={`rounded-xl border px-3 py-2 ${i === 0 ? 'border-rose-300/30 bg-rose-500/10 text-white' : 'border-white/10 text-white/50'}`}>
                        <span className="block text-white/40">Step {i + 1}</span>
                        {step}
                    </li>
                ))}
            </ol>

            <ul className="relative mt-6 flex justify-between text-[11px] text-white/40">
                {FEATURES.map((feature) => (
                    <li key={feature.label} className="flex items-center gap-1.5">
                        <i className={`fas ${feature.icon}`} />
                        {feature.label}
                    </li>
                ))}
            </ul>
        </aside>
    );
}
