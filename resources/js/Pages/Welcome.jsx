import { Head } from '@inertiajs/react';
import { motion } from 'framer-motion';
import MarketingNav from '@/Components/Landing/MarketingNav';
import MarketingFooter from '@/Components/Landing/MarketingFooter';
import SectionNav, { SECTION_OFFSET } from '@/Components/Landing/SectionNav';
import FeatureExplorer from '@/Components/Landing/FeatureExplorer';
import FaqSection from '@/Components/Landing/FaqSection';
import { Container, Eyebrow, ImageCard, Photo, PillLink, SectionHeading } from '@/Components/Landing/ui';

const BG = '/Najenga-backgrounds';

/** The numbers under the hero. */
const FACTS = [
    ['5', 'kinds of record in one place, from receipts to milestones'],
    ['4', 'roles, so everyone gets the right say'],
    ['8', 'currencies, the Kenyan shilling first'],
    ['1', 'WhatsApp number to send receipts and photos to'],
];

/** The bar of sections under the hero. */
const SECTIONS = [
    { id: 'journey', label: 'How it works' },
    { id: 'inside', label: 'Inside Najenga' },
    { id: 'who', label: 'Who it’s for' },
    { id: 'together', label: 'Build together' },
    { id: 'safe', label: 'Kept safe' },
    { id: 'faq', label: 'Questions' },
];

/** A build, start to finish, each step pointing at where Najenga helps. */
const JOURNEY = [
    { title: 'Set up the project', text: 'Its budget, location and dates, and the people involved: the owner, the contractor, the site manager, the family.', link: 'Roles & sharing', href: '#together' },
    { title: 'Pay for the work', text: 'Log every payment as it happens: M-Pesa, bank or cash. Forward a receipt on WhatsApp and Najenga reads it for you.', link: 'Money', href: '#inside' },
    { title: 'Watch it go up', text: 'Photos dated from the camera, notes pinned on them, and milestones on one timeline — even when you can’t be on site.', link: 'Site', href: '#inside' },
    { title: 'Keep the paperwork', text: 'Plans, permits, contracts and quotes in folders, with the project they belong to. Search finds any of them.', link: 'Files', href: '#inside' },
    { title: 'Hand over with confidence', text: 'Every cost, photo and change on record, with who made it and when. Nothing to reconstruct at the end.', link: 'Insight', href: '#inside' },
];

/** The "Inside Najenga" explorer. */
const FEATURE_GROUPS = [
    {
        id: 'money',
        eyebrow: 'Money',
        title: 'Every shilling, accounted for',
        summary: 'Record costs as they happen — in a form, in a spreadsheet view, or by sending the receipt on WhatsApp. Najenga reads the receipt, you confirm it, and each cost lands in its project and category.',
        points: ['Receipts read for you, then checked by a person', 'M-Pesa codes, bank references and cash in one list', 'Totals by category, and receipts still missing'],
        stats: [['8', 'currencies'], ['3', 'ways to record a cost'], ['1', 'list of every payment']],
        image: `${BG}/pexels-curtis-adams-1694007-7027840.webp`,
        screen: '/marketing/expenses.webp',
    },
    {
        id: 'site',
        eyebrow: 'Site',
        title: 'The site, week by week',
        summary: 'Upload photos from site or send them on WhatsApp. Najenga dates each one from the camera, flags the ones it had to guess, and keeps them with their project.',
        points: ['Dates read from the photo itself', 'Pin notes and drawings on a photo', 'Milestones and progress on one timeline'],
        stats: [['Day', 'to year timeline views'], ['Pins', 'drawn on photos'], ['Zip', 'download a batch']],
        image: `${BG}/pexels-d-goug-211350543-38210397.webp`,
    },
    {
        id: 'files',
        eyebrow: 'Files',
        title: 'Plans and paperwork, where you left them',
        summary: 'Drawings, permits, contracts and quotes in folders for each project. Preview them in the browser, talk about them in comments, and find any of them from the search bar.',
        points: ['Folders for each project', 'PDFs and images open in the browser', 'Comments beside every document'],
        stats: [['Folders', 'inside folders'], ['PDF', 'preview in place'], ['⌘K', 'search everything']],
        image: `${BG}/pexels-expect-best-79873-323776.webp`,
    },
    {
        id: 'team',
        eyebrow: 'Team',
        title: 'The right say for everyone',
        summary: 'Invite people by email and choose what they can do: run the project, change records, or only look. See who else is working on the same page, and undo a mistake from the version history.',
        points: ['Owner, manager, editor and viewer roles', 'Who’s online, and what changed since you looked', 'Every change kept, and restorable'],
        stats: [['4', 'roles'], ['7', 'days to accept an invite'], ['1', 'click to restore']],
        image: `${BG}/pexels-40037226-7667625.webp`,
    },
    {
        id: 'insight',
        eyebrow: 'Insight',
        title: 'Know where the project stands',
        summary: 'Each project’s overview shows its budget used, latest work and team. Analytics and activity logs show the rest, and a weekly email sums up what came in on WhatsApp.',
        points: ['Budget used, at a glance', 'Spending by category and over time', 'A weekly summary in your inbox'],
        stats: [['%', 'of budget used'], ['Weekly', 'WhatsApp summary'], ['CSV', 'export any list']],
        image: `${BG}/pexels-ninobur-16787444.webp`,
        screen: '/marketing/overview.webp',
    },
];

const SAFETY = [
    { icon: 'fa-fingerprint', title: 'Passkeys', text: 'Sign in with your fingerprint, face or a security key.' },
    { icon: 'fa-shield-halved', title: 'Two-factor sign-in', text: 'A code from your authenticator app as well as your password.' },
    { icon: 'fa-envelope-open-text', title: 'Emailed codes', text: 'Forgot your password on site? A one-time code works instead.' },
    { icon: 'fa-bell', title: 'New-device alerts', text: 'An email whenever your account is opened somewhere new.' },
    { icon: 'fa-user-lock', title: 'Only who you invite', text: 'Projects are private. Each person sees only the projects they’re on.' },
    { icon: 'fa-clock-rotate-left', title: 'Nothing lost', text: 'Deleted by mistake? Restore it, with the history of every change.' },
];

const FAQS = [
    { q: 'What is Najenga?', a: 'A workspace for construction projects: what was spent and on what, how the site is coming along, the paperwork, and who is doing what. “Najenga” is Kiswahili for “I’m building”.' },
    { q: 'Who is it for?', a: 'Anyone with a build to keep track of: people building their own home (often from far away), contractors and site managers running several sites, and the people who pay for, check and approve the work.' },
    { q: 'Can I send receipts and photos on WhatsApp?', a: 'Yes. Link your WhatsApp number in Settings, then send receipts and site photos to Najenga’s number. Receipts are read for you and wait as drafts for you to check; photos go to the project.' },
    { q: 'Who can see my project?', a: 'Only the people you invite. Each gets a role — owner, manager, editor or viewer — that decides whether they can change things or only look. Everyone else sees nothing.' },
    { q: 'I deleted something by mistake. Can I get it back?', a: 'Yes. Every change is kept in the version history, with who made it and when. Open the history, find the version you want and restore it.' },
    { q: 'I run several sites. Does Najenga handle that?', a: 'Yes. Pick a project in the switcher at the top and every page shows just that one; pick “All projects” to see them side by side.' },
    { q: 'Does it work on my phone?', a: 'Yes. Najenga works in any modern browser, on a phone on site as well as on a computer in the office. Nothing to install.' },
    { q: 'How do I start?', a: 'Create an account, set up your first project with its budget, and invite the people who should follow it. It takes a few minutes.' },
];

/** "About Najenga" panel overlapping the bottom of the hero. */
function HeroPanel() {
    return (
        <div className="grid gap-4 rounded-[2rem] bg-white/85 p-4 shadow-[0_40px_90px_-40px_rgba(26,21,20,0.6)] backdrop-blur-xl sm:p-5 lg:grid-cols-4">
            <div className="flex flex-col justify-between rounded-3xl bg-gradient-to-br from-white to-[#F4F1EE] p-6 sm:p-8 lg:col-span-2">
                <Eyebrow>About Najenga</Eyebrow>
                <h2 className="mt-6 font-display text-4xl font-light leading-[1.02] tracking-tight text-[#1A1514] sm:text-5xl">
                    One build,
                    <br />
                    every detail.
                </h2>
                <p className="mt-6 max-w-md text-sm leading-relaxed text-[#5E5450]">
                    “Najenga” is Kiswahili for “I’m building”. From the first bag of cement to the keys in your hand, Najenga keeps the money, the site, the paperwork and the people in one calm place.
                </p>
            </div>
            {[
                { href: '#who', icon: 'fa-house', title: 'For homeowners', text: 'Follow your build from anywhere, and know where every shilling went.' },
                { href: '#who', icon: 'fa-helmet-safety', title: 'For contractors', text: 'Every site, crew and client under one sign-in.' },
            ].map((card) => (
                <a key={card.title} href={card.href} className="group flex min-h-[14rem] flex-col justify-between rounded-3xl border border-[#EFE8E2] bg-white p-6 transition-shadow hover:shadow-[0_20px_50px_-30px_rgba(26,21,20,0.5)]">
                    <div className="flex items-start justify-between">
                        <h3 className="font-display text-2xl font-normal leading-tight text-[#1A1514]">{card.title}</h3>
                        <i aria-hidden="true" className="fas fa-arrow-up-right-from-square text-sm text-[#B3122E] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                    </div>
                    <div>
                        <i aria-hidden="true" className={`fas ${card.icon} text-[#D4A7A0]`} />
                        <p className="mt-3 text-sm leading-relaxed text-[#5E5450]">{card.text}</p>
                    </div>
                </a>
            ))}
            <ImageCard
                image={`${BG}/pexels-kelly-28964416.webp`}
                title="Every receipt, read for you"
                text="Send it on WhatsApp; check what Najenga read; it’s filed."
                href="#inside"
                className="min-h-[18rem] lg:col-span-3"
            />
            <ImageCard image={`${BG}/pexels-clement-proust-363898785-31763541.webp`} title="The site, week by week" text="Photos dated from the camera." href="#inside" className="min-h-[18rem]" />
        </div>
    );
}

/** The full-bleed photo hero with the About panel overlapping its bottom edge. */
function Hero({ auth }) {
    const signedIn = !!auth?.user;
    return (
        <section className="relative">
            <div className="relative isolate flex min-h-[100svh] flex-col justify-center overflow-hidden pb-56 pt-32 text-white sm:pb-64">
                <Photo src={`${BG}/pexels-vip-foto-8491089.webp`} position="center 40%" eager className="-z-20" />
                <div className="absolute inset-0 -z-10 bg-gradient-to-b from-[#140F0E]/75 via-[#140F0E]/45 to-[#140F0E]/70" />
                <Container>
                    <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="mx-auto max-w-5xl text-center">
                        <Eyebrow light>Construction project management</Eyebrow>
                        <h1 className="mt-5 font-display text-[2.75rem] font-extralight leading-[1.02] tracking-tight text-white sm:text-7xl lg:text-[6.25rem]">
                            <span className="block">Build it right.</span>
                            <span className="block">
                                Keep every <span className="font-light text-rose-200">shilling</span> in sight.
                            </span>
                        </h1>
                        <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-white/85 sm:text-lg">
                            What was spent and on what, how the site is coming along, the plans and permits, and who is doing what — for every project, on your phone or in the office.
                        </p>
                        <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
                            <PillLink href={signedIn ? route('dashboard') : route('register')} variant="light" size="lg">
                                {signedIn ? 'Open your dashboard' : 'Start your first project'}
                            </PillLink>
                            <PillLink href="#inside" variant="glass" size="lg" arrow>
                                See what’s inside
                            </PillLink>
                        </div>
                    </motion.div>
                </Container>
            </div>
            <Container className="relative z-10 -mt-44 sm:-mt-52">
                <HeroPanel />
            </Container>
        </section>
    );
}

/** Najenga's front page, laid out after Naoa's. */
export default function Welcome({ auth }) {
    const signedIn = !!auth?.user;
    return (
        <div className="min-h-screen bg-[#F4F1EE] text-[#1A1514]">
            <Head title="Najenga | Construction project management" />
            <MarketingNav auth={auth} />

            <main id="main-content">
                <Hero auth={auth} />

                <section aria-label="Najenga in numbers" className="py-24">
                    <Container>
                        <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-3xl bg-[#E2D9D2] lg:grid-cols-4">
                            {FACTS.map(([value, label]) => (
                                <div key={label} className="flex flex-col-reverse justify-end bg-[#F4F1EE] p-6 sm:p-8">
                                    <dt className="mt-2 text-sm text-[#5E5450]">{label}</dt>
                                    <dd className="font-display text-5xl font-extralight tracking-tight text-[#1A1514] sm:text-6xl">{value}</dd>
                                </div>
                            ))}
                        </dl>
                    </Container>
                </section>

                <SectionNav sections={SECTIONS} />

                <section id="journey" className={`${SECTION_OFFSET} pt-24`}>
                    <Container>
                        <SectionHeading
                            eyebrow="Najenga — “I’m building”"
                            title="From the first bag of cement to the keys in your hand"
                            text="A build is months of payments, deliveries, photos and paperwork, with people coming and going. Najenga keeps each step on record, so nobody has to remember it."
                        />
                        <ol className="mt-14 grid gap-4 md:grid-cols-5">
                            {JOURNEY.map((step, i) => (
                                <li key={step.title} className="flex flex-col rounded-3xl bg-white p-6">
                                    <span aria-hidden="true" className="font-display text-4xl font-extralight text-[#D4A7A0]">{String(i + 1).padStart(2, '0')}</span>
                                    <h3 className="mt-3 text-base font-semibold text-[#1A1514]">{step.title}</h3>
                                    <p className="mt-2 flex-1 text-sm leading-relaxed text-[#5E5450]">{step.text}</p>
                                    <a href={step.href} className="mt-4 inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-[#B3122E] hover:text-[#1A1514]">
                                        {step.link} <i aria-hidden="true" className="fas fa-arrow-right text-[9px]" />
                                    </a>
                                </li>
                            ))}
                        </ol>
                    </Container>
                </section>

                <section id="inside" className={`${SECTION_OFFSET} py-24`}>
                    <Container>
                        <SectionHeading eyebrow="Inside Najenga" title="Everything a build needs" text="Pick an area to see what it does for you." />
                        <div className="mt-14">
                            <FeatureExplorer groups={FEATURE_GROUPS} />
                        </div>
                    </Container>
                </section>

                <section id="who" className={`${SECTION_OFFSET} py-24`}>
                    <Container>
                        <SectionHeading eyebrow="Who it’s for" title="For the people paying — and the people building" />
                        <div className="mt-14 grid gap-5 lg:grid-cols-2">
                            <ImageCard
                                image={`${BG}/pexels-artbovich-7031607.webp`}
                                tags={['Homeowners', 'Building from afar']}
                                title="See your house go up, wherever you are"
                                text="Photos from site each week, every payment with its receipt, and the plans in one place — so you can follow the build from Nairobi, Mombasa or abroad."
                                className="min-h-[32rem]"
                                titleClass="text-3xl sm:text-5xl"
                            />
                            <ImageCard
                                image={`${BG}/pexels-40037226-7667625.webp`}
                                tags={['Contractors', 'Site managers']}
                                title="Run every site from one place"
                                text="Each project with its crew, budget and paperwork. Switch between sites in a tap, and show clients exactly where their money went."
                                className="min-h-[32rem]"
                                titleClass="text-3xl sm:text-5xl"
                            />
                        </div>
                        <ImageCard
                            image={`${BG}/pexels-ninobur-16803023.webp`}
                            position="center 30%"
                            tags={['WhatsApp', 'No app to install']}
                            title="Send it on WhatsApp. Najenga files it."
                            text="A receipt, a delivery note, a photo of the slab: send it to Najenga’s number from the phone you already use. Receipts are read for you and wait for your check."
                            className="mt-5 min-h-[24rem]"
                            titleClass="text-3xl sm:text-5xl"
                        />
                    </Container>
                </section>

                <section id="together" className={`${SECTION_OFFSET} py-24`}>
                    <Container className="grid items-center gap-12 lg:grid-cols-12">
                        <div className="lg:col-span-5">
                            <SectionHeading
                                eyebrow="Build together"
                                title="Everyone on the project. Nothing lost."
                                text="Invite the owner, the contractor and the site team with the right say each. See who’s working on what, catch up on what changed since you last looked, and undo any mistake."
                                align="left"
                            />
                            <ul className="mt-8 space-y-3 text-sm text-[#3A2F2C]">
                                {['Invitations by email, with a role each', 'Who’s online, on which page', 'Version history, with one-click restore'].map((point) => (
                                    <li key={point} className="flex gap-3">
                                        <i aria-hidden="true" className="fas fa-check mt-1 text-xs text-[#B3122E]" />
                                        {point}
                                    </li>
                                ))}
                            </ul>
                            <PillLink href={signedIn ? route('dashboard') : route('register')} variant="outline" className="mt-8" arrow>
                                {signedIn ? 'Open your dashboard' : 'Start a project'}
                            </PillLink>
                        </div>
                        <div className="lg:col-span-7">
                            <div className="overflow-hidden rounded-[1.75rem] border border-[#E2D9D2] bg-[#140F0E] p-2 shadow-[0_40px_80px_-40px_rgba(26,21,20,0.7)]">
                                <img src="/marketing/overview.webp" alt="A project's overview in Najenga: its budget used, latest expenses and team" loading="lazy" className="w-full rounded-[1.35rem]" />
                            </div>
                        </div>
                    </Container>
                </section>

                <section id="safe" className={`${SECTION_OFFSET} py-24`}>
                    <Container>
                        <div className="overflow-hidden rounded-[2rem] bg-[#140F0E] p-6 text-white sm:p-10 lg:p-14">
                            <div className="grid gap-6 lg:grid-cols-2 lg:items-end">
                                <h2 className="font-display text-5xl font-light leading-[1.02] tracking-tight sm:text-6xl">Your project, kept safe</h2>
                                <p className="max-w-md text-white/70">Money and contracts deserve more than a password. Najenga gives every account modern ways to sign in, and keeps every record’s history.</p>
                            </div>
                            <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                {SAFETY.map((item) => (
                                    <div key={item.title} className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
                                        <i aria-hidden="true" className={`fas ${item.icon} text-rose-300`} />
                                        <h3 className="mt-4 font-semibold">{item.title}</h3>
                                        <p className="mt-1 text-sm leading-relaxed text-white/60">{item.text}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </Container>
                </section>

                <FaqSection items={FAQS} text={<>Something else? <a href="mailto:najenga-info@okjtech.co.ke" className="text-[#B3122E] underline underline-offset-4">Talk to our team.</a></>} />

                <section className="pb-24">
                    <Container>
                        <div className="relative isolate overflow-hidden rounded-[2rem] px-6 py-16 text-center text-white sm:px-12 sm:py-20">
                            <Photo src={`${BG}/pexels-artbovich-7031607.webp`} className="-z-20" />
                            <div className="absolute inset-0 -z-10 bg-gradient-to-br from-[#8B0000]/90 via-[#140F0E]/85 to-[#140F0E]/90" />
                            <h2 className="mx-auto max-w-3xl font-display text-4xl font-light leading-[1.05] tracking-tight sm:text-6xl">Start your build with a clear view of it.</h2>
                            <p className="mx-auto mt-5 max-w-xl text-white/80">Set up your first project in a few minutes, and invite the people who should follow it.</p>
                            <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
                                <PillLink href={signedIn ? route('dashboard') : route('register')} variant="light" size="lg">
                                    {signedIn ? 'Open your dashboard' : 'Get started'}
                                </PillLink>
                                {!signedIn && (
                                    <PillLink href={route('login')} variant="glass" size="lg">
                                        Sign in
                                    </PillLink>
                                )}
                            </div>
                        </div>
                    </Container>
                </section>
            </main>

            <MarketingFooter auth={auth} />
        </div>
    );
}
