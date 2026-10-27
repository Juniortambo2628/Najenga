import { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import HeroSection from '@/Components/Landing/HeroSection';
import ScrollReveal from '@/Components/Landing/ScrollReveal';
import GlassButton from '@/Components/Landing/GlassButton';

const FEATURES = [
    { icon: 'fa-receipt', title: 'Smart receipts', subtitle: 'AI-powered OCR', description: 'Turn receipts into organized expense records with less manual entry.', image: '/Najenga-backgrounds/pexels-artbovich-7031408.webp', details: ['Capture receipt information', 'Review extracted expense details', 'Keep expenses connected to a project'] },
    { icon: 'fa-camera', title: 'Progress photos', subtitle: 'Visual project records', description: 'Keep site photos, annotations, and project updates together.', image: '/Najenga-backgrounds/pexels-clement-proust-363898785-31763541.webp', details: ['Organize photos by project', 'Annotate important details', 'Follow visual updates in the timeline'] },
    { icon: 'fa-chart-line', title: 'Project analytics', subtitle: 'Clear reporting', description: 'Understand spending and project progress at a glance.', image: '/Najenga-backgrounds/pexels-d-goug-211350543-38210397.webp', details: ['Review project activity', 'See expenses in context', 'Make progress easier to communicate'] },
    { icon: 'fa-users', title: 'Team collaboration', subtitle: 'Shared workspace', description: 'Keep your team and clients aligned around the same project.', image: '/Najenga-backgrounds/pexels-kelly-28964416.webp', details: ['Keep project conversations together', 'Share updates with the right people', 'Give teams a common project view'] },
    { icon: 'fa-file-lines', title: 'Project documents', subtitle: 'Organized files', description: 'Find the plans, records, and files each project needs.', image: '/Najenga-backgrounds/pexels-ninobur-16803023.webp', details: ['Keep documents with their project', 'Find important files in one place', 'Pair records with project updates'] },
    { icon: 'fa-mobile-screen', title: 'Work anywhere', subtitle: 'Mobile ready', description: 'Check project information from site or office.', image: '/Najenga-backgrounds/pexels-vip-foto-8491089.webp', details: ['Open project information on site', 'Add updates as work happens', 'Keep key records close at hand'] },
];

const BENEFITS = [
    { icon: 'fa-clock', title: 'Spend less time on admin', description: 'Bring receipts, project records, and updates into one workflow.' },
    { icon: 'fa-scale-balanced', title: 'Keep budgets visible', description: 'Record expenses as work happens and keep project costs in view.' },
    { icon: 'fa-eye', title: 'Make progress easy to see', description: 'Use photos and timelines to share a clear view of work on site.' },
    { icon: 'fa-lock', title: 'Keep project work together', description: 'Give your team one place for the information projects rely on.' },
];

const WORKFLOW = [
    { number: '01', icon: 'fa-folder-plus', title: 'Set up a project', description: 'Give the work a home for its people, schedule, and records.' },
    { number: '02', icon: 'fa-camera', title: 'Keep the site in view', description: 'Add photos, notes, and updates as the work moves forward.' },
    { number: '03', icon: 'fa-chart-pie', title: 'Review the details', description: 'Bring expenses and progress together when it is time to report.' },
];

const FAQS = [
    { question: 'What is Najenga?', answer: 'Najenga is a construction project management workspace for keeping project activity, records, and teams organized.' },
    { question: 'What can I keep with a project?', answer: 'Projects can bring together timelines, expenses, receipts, photos, documents, and updates.' },
    { question: 'Can I record work from a phone?', answer: 'The interface is designed to work across screen sizes, so you can access project information from site or office.' },
    { question: 'How do I get started?', answer: 'Create an account, set up your first project, and invite the people who need to follow the work.' },
];

function SectionHeading({ eyebrow, title, description, className = '' }) {
    return (
        <div className={`mb-10 flex flex-col gap-4 md:mb-12 md:flex-row md:items-end md:justify-between ${className}`}>
            <div className="max-w-2xl">
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-rose-300">{eyebrow}</p>
                <h2 className="text-3xl font-semibold leading-tight text-white sm:text-4xl lg:text-5xl">{title}</h2>
            </div>
            {description && <p className="max-w-md text-sm leading-7 text-white/55 md:text-base">{description}</p>}
        </div>
    );
}

function FeatureCard({ feature, index, active, onClick }) {
    return (
        <button type="button" onClick={onClick} aria-pressed={active} className={`group relative isolate flex min-h-[22rem] w-full flex-col justify-between overflow-hidden rounded-3xl border text-left transition duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 ${active ? 'border-rose-200/50' : 'border-white/10 hover:border-white/25'}`}>
            <img src={feature.image} alt="" loading="lazy" className="absolute inset-0 -z-20 h-full w-full object-cover transition duration-700 group-hover:scale-105" />
            <div className={`absolute inset-0 -z-10 transition-colors duration-300 ${active ? 'bg-gradient-to-t from-black via-black/40 to-black/5' : 'bg-gradient-to-t from-black/95 via-black/55 to-black/15'}`} />
            <div className="flex w-full items-center justify-between p-5 sm:p-7">
                <span className="flex h-11 w-11 items-center justify-center rounded-full border border-white/25 bg-black/30 text-rose-200 backdrop-blur-md"><i aria-hidden="true" className={`fas ${feature.icon}`} /></span>
                <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/25 bg-black/20 text-white transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:bg-white group-hover:text-black"><i aria-hidden="true" className="fas fa-arrow-up-right-from-square text-xs" /></span>
            </div>
            <div className="w-full p-5 pt-12 sm:p-7 sm:pt-16">
                <p className="mb-2 text-xs font-medium uppercase tracking-[0.16em] text-white/65">{feature.subtitle}</p>
                <h3 className="mb-2 text-2xl font-semibold text-white sm:text-3xl">{feature.title}</h3>
                <p className="max-w-md text-sm leading-6 text-white/70">{feature.description}</p>
                <span className="mt-5 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-white/75">Explore feature <i aria-hidden="true" className="fas fa-arrow-right text-[10px] transition group-hover:translate-x-1" /></span>
            </div>
            <span className="absolute right-6 top-1/2 -z-10 text-8xl font-semibold tracking-tighter text-white/[0.06]">0{index + 1}</span>
        </button>
    );
}

export default function Welcome({ auth }) {
    const [activeFeature, setActiveFeature] = useState(0);
    const feature = FEATURES[activeFeature];

    const exploreFeature = (index) => {
        setActiveFeature(index);
        document.getElementById('explore')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    return (
        <main className="min-h-screen overflow-hidden bg-[#0b0c0d] text-white">
            <Head title="Najenga | Construction project management" />
            <HeroSection auth={auth} />

            <section id="platform" className="scroll-mt-24 px-4 py-20 sm:px-8 lg:px-12 lg:py-28">
                <div className="mx-auto max-w-7xl">
                    <ScrollReveal>
                        <SectionHeading
                            eyebrow="One connected workspace"
                            title="Every part of your project has a place."
                            description="From the first receipt to the latest site photo, keep the details of your construction work organized and easy to follow. Select a card to take a closer look."
                        />
                    </ScrollReveal>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        {FEATURES.map((item, index) => (
                            <ScrollReveal key={item.title} delay={Math.min(index * 0.05, 0.2)}>
                                <FeatureCard feature={item} index={index} active={activeFeature === index} onClick={() => exploreFeature(index)} />
                            </ScrollReveal>
                        ))}
                    </div>
                </div>
            </section>

            <section id="explore" className="scroll-mt-8 border-y border-white/[0.07] bg-[#111213] px-4 py-20 sm:px-8 lg:px-12 lg:py-28">
                <div className="mx-auto max-w-7xl">
                    <ScrollReveal>
                        <SectionHeading
                            eyebrow="Inside Najenga"
                            title="Choose a tool. See where it fits."
                            description="Explore how the parts of Najenga support the everyday work of a construction project."
                        />
                    </ScrollReveal>
                    <div className="grid gap-5 lg:grid-cols-[17rem_1fr] lg:gap-8">
                        <div className="flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0" role="group" aria-label="Choose a Najenga feature">
                            {FEATURES.map((item, index) => (
                                <button key={item.title} type="button" aria-pressed={activeFeature === index} onClick={() => setActiveFeature(index)} className={`flex shrink-0 items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm transition lg:w-full ${activeFeature === index ? 'border-rose-300/30 bg-rose-950/40 text-white' : 'border-transparent text-white/55 hover:border-white/10 hover:bg-white/[0.04] hover:text-white'}`}>
                                    <i aria-hidden="true" className={`fas ${item.icon} w-4 text-center ${activeFeature === index ? 'text-rose-200' : 'text-white/45'}`} />
                                    <span className="whitespace-nowrap">{item.title}</span>
                                    <i aria-hidden="true" className={`fas fa-arrow-right ml-auto hidden text-xs lg:inline ${activeFeature === index ? 'text-rose-200' : 'text-white/25'}`} />
                                </button>
                            ))}
                        </div>
                        <div key={feature.title} aria-live="polite" className="grid overflow-hidden rounded-3xl border border-white/10 bg-[#18191a] lg:min-h-[27rem] lg:grid-cols-2">
                            <div className="relative min-h-64 lg:min-h-full">
                                <img src={feature.image} alt="" className="absolute inset-0 h-full w-full object-cover" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
                                <span className="absolute bottom-5 left-5 rounded-full border border-white/20 bg-black/35 px-3 py-1.5 text-xs text-white/80 backdrop-blur">{feature.subtitle}</span>
                            </div>
                            <div className="flex flex-col justify-center p-6 sm:p-9 lg:p-10">
                                <span className="mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-rose-950/70 text-lg text-rose-200"><i aria-hidden="true" className={`fas ${feature.icon}`} /></span>
                                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-rose-300">Feature 0{activeFeature + 1}</p>
                                <h3 className="text-2xl font-semibold text-white sm:text-3xl">{feature.title}</h3>
                                <p className="mt-3 text-sm leading-7 text-white/55">{feature.description}</p>
                                <ul className="mt-6 space-y-3">
                                    {feature.details.map((detail) => <li key={detail} className="flex items-start gap-3 text-sm text-white/75"><i aria-hidden="true" className="fas fa-check mt-1 text-xs text-rose-300" /><span>{detail}</span></li>)}
                                </ul>
                                <Link href={auth?.user ? route('dashboard') : route('register')} className="mt-8 inline-flex w-fit items-center gap-2 text-sm font-semibold text-white transition hover:text-rose-200">{auth?.user ? 'Open your dashboard' : 'Get started with Najenga'} <i aria-hidden="true" className="fas fa-arrow-right text-xs" /></Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section id="workflow" className="scroll-mt-24 px-4 py-20 sm:px-8 lg:px-12 lg:py-28">
                <div className="mx-auto max-w-7xl">
                    <ScrollReveal>
                        <SectionHeading eyebrow="From site to summary" title="A project rhythm your whole team can follow." description="Keep the day-to-day details moving through one clear, shared process." />
                    </ScrollReveal>
                    <div className="grid gap-3 md:grid-cols-3">
                        {WORKFLOW.map((step, index) => (
                            <ScrollReveal key={step.number} delay={index * 0.08}>
                                <article className="h-full rounded-2xl border border-white/[0.08] bg-white/[0.025] p-6 transition hover:-translate-y-1 hover:border-rose-300/25 hover:bg-white/[0.04] sm:p-8">
                                    <div className="mb-10 flex items-center justify-between"><span className="text-sm font-medium tracking-[0.18em] text-rose-200">{step.number}</span><i aria-hidden="true" className={`fas ${step.icon} text-lg text-white/45`} /></div>
                                    <h3 className="mb-3 text-xl font-semibold text-white">{step.title}</h3>
                                    <p className="text-sm leading-6 text-white/50">{step.description}</p>
                                    {index < WORKFLOW.length - 1 && <div className="mt-8 hidden items-center gap-2 text-xs text-white/25 md:flex"><span className="h-px flex-1 bg-white/10" /><i aria-hidden="true" className="fas fa-arrow-right" /></div>}
                                </article>
                            </ScrollReveal>
                        ))}
                    </div>
                </div>
            </section>

            <section id="why-najenga" className="scroll-mt-24 border-y border-white/[0.07] bg-[#111213] px-4 py-20 sm:px-8 lg:px-12 lg:py-28">
                <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-2 lg:items-center lg:gap-20">
                    <ScrollReveal>
                        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-rose-300">Built for the work</p>
                        <h2 className="max-w-xl text-3xl font-semibold leading-tight text-white sm:text-4xl lg:text-5xl">A clearer picture of every project.</h2>
                        <p className="mt-5 max-w-lg text-base leading-7 text-white/55">Construction moves quickly. Najenga brings the day-to-day records into one view, so your team can spend more time moving work forward.</p>
                        <div className="mt-8"><GlassButton href={route('register')} variant="brand" className="px-6 py-3 text-sm shadow-none">Explore Najenga <i aria-hidden="true" className="fas fa-arrow-right text-xs" /></GlassButton></div>
                    </ScrollReveal>
                    <div className="grid gap-3 sm:grid-cols-2">
                        {BENEFITS.map((benefit, index) => (
                            <ScrollReveal key={benefit.title} delay={index * 0.06}>
                                <article className="h-full rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5 transition hover:border-rose-300/30 hover:bg-white/[0.04] sm:p-6">
                                    <span className="mb-5 flex h-10 w-10 items-center justify-center rounded-full bg-rose-950/70 text-rose-200"><i aria-hidden="true" className={`fas ${benefit.icon}`} /></span>
                                    <h3 className="mb-2 font-semibold text-white">{benefit.title}</h3>
                                    <p className="text-sm leading-6 text-white/50">{benefit.description}</p>
                                </article>
                            </ScrollReveal>
                        ))}
                    </div>
                </div>
            </section>

            <section id="questions" className="scroll-mt-24 px-4 py-20 sm:px-8 lg:px-12 lg:py-28">
                <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.7fr_1.3fr] lg:gap-20">
                    <ScrollReveal>
                        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-rose-300">Questions</p>
                        <h2 className="text-3xl font-semibold leading-tight text-white sm:text-4xl lg:text-5xl">A few things to know.</h2>
                        <p className="mt-4 max-w-sm text-sm leading-7 text-white/50">Have another question? <a href="mailto:najenga-info@okjtech.co.ke" className="text-white/80 underline decoration-white/25 underline-offset-4 hover:text-white">Talk to our team.</a></p>
                    </ScrollReveal>
                    <div className="space-y-2">
                        {FAQS.map((item, index) => (
                            <ScrollReveal key={item.question} delay={Math.min(index * 0.05, 0.15)}>
                                <details className="group rounded-2xl border border-white/[0.08] bg-white/[0.025] open:border-white/15 open:bg-white/[0.04]">
                                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 text-sm font-medium text-white marker:hidden sm:p-6 sm:text-base [&::-webkit-details-marker]:hidden">
                                        {item.question}
                                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 text-white/55 transition group-open:rotate-45 group-open:bg-rose-950/70 group-open:text-rose-100"><i aria-hidden="true" className="fas fa-plus text-xs" /></span>
                                    </summary>
                                    <p className="max-w-2xl px-5 pb-5 text-sm leading-7 text-white/55 sm:px-6 sm:pb-6">{item.answer}</p>
                                </details>
                            </ScrollReveal>
                        ))}
                    </div>
                </div>
            </section>

            <section id="get-started" className="px-4 pb-20 sm:px-8 lg:px-12 lg:pb-28">
                <div className="relative isolate mx-auto max-w-7xl overflow-hidden rounded-3xl border border-white/10 bg-[#191a1b]">
                    <img src="/Najenga-backgrounds/pexels-40037226-7667625.webp" alt="Construction project underway" loading="lazy" className="absolute inset-0 -z-20 h-full w-full object-cover opacity-40" />
                    <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#0b0c0d] via-[#0b0c0d]/85 to-[#0b0c0d]/30" />
                    <div className="grid gap-8 p-7 sm:p-10 lg:grid-cols-[1fr_auto] lg:items-end lg:p-14">
                        <div className="max-w-2xl">
                            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-rose-300">Your project, in view</p>
                            <h2 className="text-3xl font-semibold leading-tight text-white sm:text-4xl lg:text-5xl">Build with a clearer view of the work.</h2>
                            <p className="mt-4 max-w-xl text-sm leading-7 text-white/60 sm:text-base">Bring project updates, spending, and documentation into a workspace designed for construction teams.</p>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            <GlassButton href={auth?.user ? route('dashboard') : route('register')} variant="brand" className="px-6 py-3 text-sm shadow-none">{auth?.user ? 'Open dashboard' : 'Get started'}</GlassButton>
                            {!auth?.user && <GlassButton href={route('login')} variant="ghost" className="px-6 py-3 text-sm shadow-none">Sign in</GlassButton>}
                        </div>
                    </div>
                </div>
            </section>

            <footer className="border-t border-white/[0.07] bg-[#080909] px-4 py-10 sm:px-8 lg:px-12">
                <div className="mx-auto flex max-w-7xl flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
                    <div className="max-w-sm">
                        <Link href={route('home')} aria-label="Najenga home" className="inline-flex"><img src="/Najenga-logos/Najenga-Logo-header-footer-logo-transparent.webp" alt="Najenga" loading="lazy" className="h-12 w-auto" /></Link>
                        <p className="mt-3 text-sm leading-6 text-white/45">Construction project management by OKJ Technologies.</p>
                    </div>
                    <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-3 text-sm text-white/55">
                        <a href="#platform" className="transition hover:text-white">Platform</a>
                        <a href="#explore" className="transition hover:text-white">Explore tools</a>
                        <a href="#questions" className="transition hover:text-white">Questions</a>
                        <a href="mailto:najenga-info@okjtech.co.ke" className="transition hover:text-white">Contact</a>
                        <Link href={route('login')} className="transition hover:text-white">Sign in</Link>
                        <Link href={route('privacy')} className="transition hover:text-white">Privacy</Link>
                    </nav>
                </div>
                <div className="mx-auto mt-8 max-w-7xl border-t border-white/[0.07] pt-5 text-xs text-white/35">© {new Date().getFullYear()} Najenga by OKJ Technologies</div>
            </footer>
        </main>
    );
}
