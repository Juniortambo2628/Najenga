import { useState, useEffect } from 'react';
import { Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import GlassButton from './GlassButton';

export default function HeroSection({ auth }) {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 24);
        handleScroll();
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <section className="px-3 pt-3 sm:px-6 sm:pt-6">
            <div className="relative mx-auto max-w-[1500px] overflow-hidden rounded-[1.5rem] border border-white/10 bg-[#151617] sm:rounded-[2rem]">
                <div className="absolute inset-0">
                    <img
                        src="/Najenga-backgrounds/pexels-curtis-adams-1694007-7027840.webp"
                        alt="A construction project taking shape"
                        fetchPriority="high"
                        className="absolute inset-0 h-full w-full object-cover object-center opacity-55"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/25 to-black/80" />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-black/10" />
                </div>

                <motion.nav
                    className={`relative z-10 border-b border-white/10 transition-all duration-300 ${scrolled ? 'bg-black/50 backdrop-blur-xl' : 'bg-black/10'}`}
                    aria-label="Main navigation"
                >
                    <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-3 sm:px-8 sm:py-4">
                        <Link href={route('home')} aria-label="Najenga home" className="shrink-0">
                            <img src="/Najenga-logos/Najenga-Logo-header-footer-logo-transparent.webp" alt="Najenga" className="h-11 w-auto sm:h-14" />
                        </Link>
                        <div className="hidden items-center gap-7 lg:flex">
                            <a href="#platform" className="text-sm text-white/75 transition hover:text-white">Platform</a>
                            <a href="#why-najenga" className="text-sm text-white/75 transition hover:text-white">Why Najenga</a>
                            <a href="#explore" className="text-sm text-white/75 transition hover:text-white">For your team</a>
                        </div>
                        <div className="flex items-center gap-2 sm:gap-3">
                            {auth?.user ? (
                                <Link href={route('dashboard')} className="rounded-full border border-white/25 bg-black/20 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-white/10 sm:px-5">Dashboard</Link>
                            ) : (
                                <>
                                    <Link href={route('login')} className="hidden rounded-full px-4 py-2.5 text-sm font-medium text-white/80 transition hover:text-white sm:inline-flex">Sign in</Link>
                                    <GlassButton href={route('register')} variant="primary" className="px-4 py-2.5 text-xs shadow-none sm:px-5 sm:text-sm">Get started <i aria-hidden="true" className="fas fa-arrow-right text-[10px]" /></GlassButton>
                                </>
                            )}
                        </div>
                    </div>
                </motion.nav>

                <div className="relative z-[1] mx-auto grid max-w-7xl gap-8 px-5 pb-8 pt-14 sm:px-8 sm:pb-12 sm:pt-20 lg:grid-cols-[1fr_20rem] lg:items-end lg:gap-12 lg:pb-16 lg:pt-24">
                    <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65, ease: 'easeOut' }}>
                        <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/25 px-3.5 py-2 text-xs font-medium uppercase tracking-[0.16em] text-white/80 backdrop-blur-md">
                            <span className="h-1.5 w-1.5 rounded-full bg-rose-400" /> Built for construction teams
                        </span>
                        <h1 className="max-w-4xl text-[clamp(3rem,8vw,7.5rem)] font-semibold leading-[0.92] tracking-[-0.055em] text-white">
                            Build better.<br /><span className="text-white/65">Stay in control.</span>
                        </h1>
                    </motion.div>
                    <motion.div className="max-w-md lg:pb-2" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.15 }}>
                        <p className="text-base leading-7 text-white/75 sm:text-lg">Bring project finances, progress photos, documents, and your team into one clear workspace.</p>
                        <div className="mt-6 flex flex-wrap items-center gap-3">
                            <GlassButton href={auth?.user ? route('dashboard') : route('register')} variant="brand" className="px-6 py-3 text-sm shadow-none">
                                {auth?.user ? 'Open dashboard' : 'Start managing projects'} <i aria-hidden="true" className="fas fa-arrow-right text-xs" />
                            </GlassButton>
                            <a href="#platform" className="inline-flex items-center gap-2 px-3 py-3 text-sm font-medium text-white/80 transition hover:text-white">Explore platform <i aria-hidden="true" className="fas fa-arrow-down text-xs" /></a>
                        </div>
                    </motion.div>
                </div>

                <div className="relative z-[1] mx-5 mb-5 overflow-hidden rounded-xl border border-white/15 bg-black/20 backdrop-blur-sm sm:mx-8 sm:mb-8 sm:rounded-2xl">
                    <div className="grid grid-cols-1 divide-y divide-white/10 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
                        {[
                            { value: '01', label: 'Project finances', icon: 'fa-receipt' },
                            { value: '02', label: 'Site progress', icon: 'fa-camera' },
                            { value: '03', label: 'Team updates', icon: 'fa-people-group' },
                        ].map((item) => (
                            <a key={item.value} href="#platform" className="group flex items-center gap-4 px-5 py-4 transition hover:bg-white/[0.06] sm:px-6 sm:py-5">
                                <span className="text-xs tracking-widest text-white/35">{item.value}</span>
                                <i aria-hidden="true" className={`fas ${item.icon} text-sm text-rose-200/80`} />
                                <span className="flex-1 text-sm font-medium text-white/80">{item.label}</span>
                                <i aria-hidden="true" className="fas fa-arrow-up-right-from-square text-xs text-white/35 transition group-hover:text-white/80" />
                            </a>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
