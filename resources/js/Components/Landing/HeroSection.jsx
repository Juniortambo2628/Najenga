import { useState, useEffect } from 'react';
import { Link } from '@inertiajs/react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Badge from './Badge';
import GlassButton from './GlassButton';

const HERO_STATS = [
    { value: 'AI', label: 'Smart Receipt Analysis', icon: 'fa-receipt' },
    { value: 'Pro', label: 'Timeline Projections', icon: 'fa-calendar-check' },
    { value: '360', label: 'Budget Planning', icon: 'fa-chart-pie' },
];

export default function HeroSection({ auth }) {
    const [scrolled, setScrolled] = useState(false);
    const { scrollY } = useScroll();
    const bgY = useTransform(scrollY, [0, 600], [0, 150]);
    const contentY = useTransform(scrollY, [0, 600], [0, -50]);
    const opacity = useTransform(scrollY, [0, 400], [1, 0.3]);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 40);
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <section className="relative min-h-screen flex flex-col overflow-hidden">
            {/* Background Image with Parallax */}
            <div className="absolute inset-0 overflow-hidden">
                <motion.div className="absolute inset-0 -inset-x-[5%] -inset-y-[10%]" style={{ y: bgY }}>
                    <img
                        src="/Najenga-backgrounds/pexels-curtis-adams-1694007-7027840.jpg"
                        alt="Construction site"
                        className="w-full h-full object-cover"
                    />
                </motion.div>
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80" />
            </div>

            {/* Navigation - Sticky */}
            <motion.nav
                className={`relative z-20 transition-all duration-500 ${
                    scrolled
                        ? 'py-3 bg-black/80 backdrop-blur-xl border-b border-white/10 shadow-2xl'
                        : 'py-5 bg-transparent'
                }`}
            >
                <div className="container mx-auto px-4 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3">
                        <motion.img
                            src="/Najenga-logos/Najenga-Logo-header-footer-logo-transparent.png"
                            alt="Najenga"
                            className="h-16"
                            animate={{ scale: scrolled ? 0.85 : 1 }}
                            transition={{ duration: 0.3 }}
                        />
                    </Link>

                    <div className="hidden md:flex items-center gap-8">
                        <a href="#features" className="text-white/80 hover:text-white transition text-sm font-medium">Features</a>
                        <a href="#benefits" className="text-white/80 hover:text-white transition text-sm font-medium">Benefits</a>
                        <a href="#testimonials" className="text-white/80 hover:text-white transition text-sm font-medium">Testimonials</a>
                    </div>

                    <div className="flex items-center gap-4">
                        {auth.user ? (
                            <Link href="/dashboard" className="glass-nav-btn">
                                Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link href="/login" className="hidden sm:inline-flex text-white/80 hover:text-white transition text-sm font-medium">
                                    Login
                                </Link>
                                <Link href="/register" className="glass-nav-btn">
                                    Get Started
                                    <i className="fas fa-arrow-right text-xs ml-1"></i>
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </motion.nav>

            {/* Hero Content with Parallax */}
            <motion.div
                className="relative z-10 flex-1 flex items-end pb-16"
                style={{ y: contentY, opacity }}
            >
                <div className="container mx-auto px-4">
                    <div className="grid lg:grid-cols-2 gap-12 items-end">
                        {/* Left: Tags + Headline */}
                        <div>
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.2 }}
                            >
                                <Badge variant="glass" className="mb-6">
                                    Build with purpose
                                </Badge>
                            </motion.div>
                            <motion.h1
                                className="text-5xl md:text-7xl font-bold text-white leading-tight mb-6"
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.4 }}
                            >
                                Where precision
                                <br />
                                becomes the standard
                            </motion.h1>
                            <motion.p
                                className="text-lg text-white/70 max-w-md mb-8 hidden lg:block"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.6 }}
                            >
                                Professional construction management for teams who build to last, not just to finish.
                            </motion.p>
                        </div>

                        {/* Right: Stats + CTA */}
                        <motion.div
                            className="flex flex-col items-start lg:items-end gap-6"
                            initial={{ opacity: 0, x: 30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, delay: 0.5 }}
                        >
                            <p className="text-white/80 text-sm max-w-xs text-left lg:text-right hidden lg:block">
                                Trusted by construction professionals across Kenya to deliver projects on time and on budget.
                            </p>
                            <div className="flex flex-wrap gap-4">
                                <GlassButton href="/register" variant="brand">
                                    Get Started
                                </GlassButton>
                                <GlassButton href="/login" variant="ghost" icon="arrow-right">
                                    How it works
                                </GlassButton>
                            </div>
                        </motion.div>
                    </div>

                    {/* Stats Bar */}
                    <motion.div
                        className="mt-12 inline-flex glass-stat-bar rounded-2xl overflow-hidden"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.8 }}
                    >
                        {HERO_STATS.map((stat, idx) => (
                            <div key={idx} className="px-8 py-5 text-center">
                                <div className="flex items-center justify-center gap-2 mb-1">
                                    <i className={`fas ${stat.icon} text-[#DC143C]`}></i>
                                    <span className="text-3xl font-bold text-white">{stat.value}</span>
                                </div>
                                <div className="text-sm text-white/60 mt-1">{stat.label}</div>
                            </div>
                        ))}
                    </motion.div>
                </div>
            </motion.div>
        </section>
    );
}
