import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, ArrowUpRight, Bell, Check, Fingerprint, HardHat, History, House, MailOpen, ShieldCheck, UserLock } from 'lucide-react';
import {
  Container,
  Eyebrow,
  FaqSection,
  FeatureExplorer,
  ImageCard,
  Photo,
  PhotoHero,
  PillLink,
  SECTION_OFFSET,
  SectionHeading,
  SectionNav,
  SiteLayout,
  useSignedIn,
} from '@okjt/site';
import { BG, FEATURE_GROUPS } from '../content/marketing';
import { CONTACT_EMAIL } from '../content/legal';

/** The numbers under the hero. */
const FACTS = [
  ['5', 'kinds of record in one place, from receipts to milestones'],
  ['3', 'roles, so everyone gets the right say'],
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
  { title: 'Set up the project', text: 'Its budget, location and dates, and the people involved: the owner, the contractor, the site manager, the family.', link: 'Roles & sharing', to: '#together' },
  { title: 'Pay for the work', text: 'Log every payment as it happens: M-Pesa, bank or cash. Forward a receipt on WhatsApp and Najenga reads it for you.', link: 'Money', to: '#inside' },
  { title: 'Watch it go up', text: 'Photos dated from the camera, notes pinned on them, and milestones on one timeline — even when you can’t be on site.', link: 'Site', to: '#inside' },
  { title: 'Keep the paperwork', text: 'Plans, permits, contracts and quotes in folders, with the project they belong to. Search finds any of them.', link: 'Files', to: '#inside' },
  { title: 'Hand over with confidence', text: 'Every cost, photo and change on record, with who made it and when. Nothing to reconstruct at the end.', link: 'Insight', to: '#inside' },
];

const SAFETY = [
  { icon: Fingerprint, title: 'Passkeys', text: 'Sign in with your fingerprint, face or a security key.' },
  { icon: ShieldCheck, title: 'Two-factor sign-in', text: 'A code from your authenticator app as well as your password.' },
  { icon: MailOpen, title: 'Emailed codes', text: 'Forgot your password on site? A one-time code works instead.' },
  { icon: Bell, title: 'New-device alerts', text: 'An email whenever your account is opened somewhere new.' },
  { icon: UserLock, title: 'Only who you invite', text: 'Projects are private. Each person sees only the projects they’re on.' },
  { icon: History, title: 'Nothing lost', text: 'Deleted by mistake? Restore it, with the history of every change.' },
];

const FAQS = [
  { q: 'What is Najenga?', a: 'A workspace for construction projects: what was spent and on what, how the site is coming along, the paperwork, and who is doing what. “Najenga” is Kiswahili for “I’m building”.' },
  { q: 'Who is it for?', a: 'Anyone with a build to keep track of: people building their own home (often from far away), contractors and site managers running several sites, and the people who pay for, check and approve the work.' },
  { q: 'Can I send receipts and photos on WhatsApp?', a: 'Yes. Link your WhatsApp number in Settings, then send receipts and site photos to Najenga’s number. Receipts are read for you and wait as drafts for you to check; photos go to the project.' },
  { q: 'Who can see my project?', a: 'Only the people you invite. Each gets a role — owner, editor or viewer — that decides whether they can change things or only look; owners can share running the project with co-owners. Everyone else sees nothing.' },
  { q: 'I deleted something by mistake. Can I get it back?', a: 'Yes. Every change is kept in the version history, with who made it and when. Open the history, find the version you want and restore it.' },
  { q: 'I run several sites. Does Najenga handle that?', a: 'Yes. Pick a project in the switcher at the top and every page shows just that one; pick “All projects” to see them side by side.' },
  { q: 'Does it work on my phone?', a: 'Yes. Najenga works in any modern browser, on a phone on site as well as on a computer in the office. Nothing to install.' },
  { q: 'How do I start?', a: 'Create an account, set up your first project with its budget, and invite the people who should follow it. It takes a few minutes.' },
];

/** The explorer's areas, in the kit's shape: each area's key points sit under its summary. */
const GROUPS = FEATURE_GROUPS.map((group) => ({
  ...group,
  features: group.points,
  media: group.screen ? group.screen.replace(/^\/marketing\/|\.webp$/g, '') : undefined,
  summary: (
    <>
      <p>{group.summary}</p>
      <ul className="mt-4 space-y-2">
        {group.points.map((point) => (
          <li key={point} className="flex gap-2">
            <Check aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
            {point}
          </li>
        ))}
      </ul>
    </>
  ),
}));

/** "About Najenga" panel overlapping the bottom of the hero. */
function HeroPanel() {
  return (
    <div className="grid gap-4 rounded-[2rem] bg-white/85 p-4 shadow-[0_40px_90px_-40px_color-mix(in_srgb,var(--color-ink)_60%,transparent)] backdrop-blur-xl sm:p-5 lg:grid-cols-4">
      <div className="flex flex-col justify-between rounded-3xl bg-gradient-to-br from-white to-tint p-6 sm:p-8 lg:col-span-2">
        <Eyebrow>About Najenga</Eyebrow>
        <h2 className="mt-6 !font-display text-4xl !font-light leading-[1.02] tracking-tight !text-ink sm:text-5xl">
          One build,
          <br />
          every detail.
        </h2>
        <p className="mt-6 max-w-md text-sm leading-relaxed text-soft">
          “Najenga” is Kiswahili for “I’m building”. From the first bag of cement to the keys in your hand, Najenga keeps the money, the site, the paperwork and the people in one calm place.
        </p>
      </div>
      {[
        { to: '/for-homeowners', icon: House, title: 'For homeowners', text: 'Follow your build from anywhere, and know where every shilling went.' },
        { to: '/for-contractors', icon: HardHat, title: 'For contractors', text: 'Every site, crew and client under one sign-in.' },
      ].map(({ to, icon: Icon, title, text }) => (
        <Link key={title} to={to} className="group flex min-h-[14rem] flex-col justify-between rounded-3xl border border-line bg-white p-6 transition-shadow hover:shadow-[0_20px_50px_-30px_color-mix(in_srgb,var(--color-ink)_50%,transparent)]">
          <div className="flex items-start justify-between">
            <h3 className="!font-display text-2xl !font-normal leading-tight !text-ink">{title}</h3>
            <ArrowUpRight aria-hidden="true" className="h-4 w-4 text-accent transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </div>
          <div>
            <Icon aria-hidden="true" className="h-5 w-5 text-accent-soft" />
            <p className="mt-3 text-sm leading-relaxed text-soft">{text}</p>
          </div>
        </Link>
      ))}
      <ImageCard
        image={`${BG}/pexels-kelly-28964416.webp`}
        title="Every receipt, read for you"
        text="Send it on WhatsApp; check what Najenga read; it’s filed."
        to="#inside"
        className="min-h-[18rem] lg:col-span-3"
      />
      <ImageCard image={`${BG}/pexels-clement-proust-363898785-31763541.webp`} title="The site, week by week" text="Photos dated from the camera." to="#inside" className="min-h-[18rem]" />
    </div>
  );
}

/** Najenga's front page, on the OKJT kit. */
export default function Home() {
  const signedIn = useSignedIn();
  const start = signedIn ? { to: '/dashboard', label: 'Open your dashboard' } : { to: '/register', label: 'Start your first project' };

  return (
    <SiteLayout overlay cta={false}>
      <PhotoHero
        image={`${BG}/pexels-vip-foto-8491089.webp`}
        tall
        position="center 40%"
        eyebrow="Construction project management"
        title={
          <>
            <span className="block">Build it right.</span>
            <span className="block">
              Keep every <span className="font-light text-accent-soft">shilling</span> in sight.
            </span>
          </>
        }
        text="What was spent and on what, how the site is coming along, the plans and permits, and who is doing what — for every project, on your phone or in the office."
        after={<HeroPanel />}
      >
        <PillLink to={start.to} variant="light" size="lg">
          {start.label}
        </PillLink>
        <PillLink to="#inside" variant="glass" size="lg" arrow>
          See what’s inside
        </PillLink>
      </PhotoHero>

      <section aria-label="Najenga in numbers" className="py-24">
        <Container>
          <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-3xl bg-line lg:grid-cols-4">
            {FACTS.map(([value, label]) => (
              <div key={label} className="flex flex-col-reverse justify-end bg-tint p-6 sm:p-8">
                <dt className="mt-2 text-sm text-soft">{label}</dt>
                <dd className="font-display text-5xl font-extralight tracking-tight text-ink sm:text-6xl">{value}</dd>
              </div>
            ))}
          </dl>
        </Container>
      </section>

      <SectionNav sections={SECTIONS} label="On this page" />

      <section id="journey" className={`${SECTION_OFFSET} pt-24`}>
        <Container>
          <SectionHeading
            eyebrow="Najenga — “I’m building”"
            title="From the first bag of cement to the keys in your hand"
            text="A build is months of payments, deliveries, photos and paperwork, with people coming and going. Najenga keeps each step on record, so nobody has to remember it."
          />
          <ol className="mt-14 grid gap-4 md:grid-cols-5">
            {JOURNEY.map((step, i) => (
              <motion.li
                key={step.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.45, delay: i * 0.06 }}
                className="flex flex-col rounded-3xl bg-white p-6"
              >
                <span aria-hidden="true" className="font-display text-4xl font-extralight text-accent-soft">{String(i + 1).padStart(2, '0')}</span>
                <h3 className="mt-3 !font-sans text-base !font-semibold !text-ink">{step.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-soft">{step.text}</p>
                <Link to={step.to} className="mt-4 inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-accent hover:text-ink">
                  {step.link} <ArrowRight aria-hidden="true" className="h-3 w-3" />
                </Link>
              </motion.li>
            ))}
          </ol>
        </Container>
      </section>

      <section id="inside" className={`${SECTION_OFFSET} py-24`}>
        <Container>
          <SectionHeading eyebrow="Inside Najenga" title="Everything a build needs" text="Pick an area to see what it does for you." />
          <div className="mt-14">
            <FeatureExplorer groups={GROUPS} href={() => start.to} linkLabel={signedIn ? 'Open your dashboard' : 'Start a project'} countLabel="key points" />
          </div>
        </Container>
      </section>

      <section id="who" className={`${SECTION_OFFSET} py-24`}>
        <Container>
          <SectionHeading eyebrow="Who it’s for" title="For the people paying — and the people building" />
          <div className="mt-14 grid gap-5 lg:grid-cols-2">
            <ImageCard
              to="/for-homeowners"
              image={`${BG}/pexels-artbovich-7031607.webp`}
              tags={['Homeowners', 'Step by step']}
              title="See your house go up, wherever you are"
              text="Photos from site each week, every payment with its receipt, and the plans in one place — so you can follow the build from Nairobi, Mombasa or abroad."
              className="min-h-[32rem]"
              titleClass="text-3xl sm:text-5xl"
            />
            <ImageCard
              to="/for-contractors"
              image={`${BG}/pexels-40037226-7667625.webp`}
              tags={['Contractors', 'Step by step']}
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
            <ul className="mt-8 space-y-3 text-sm text-body">
              {['Invitations by email, with a role each', 'Who’s online, on which page', 'Version history, with one-click restore'].map((point) => (
                <li key={point} className="flex gap-3">
                  <Check aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                  {point}
                </li>
              ))}
            </ul>
            <PillLink to={start.to} variant="outline" className="mt-8" arrow>
              {signedIn ? 'Open your dashboard' : 'Start a project'}
            </PillLink>
          </div>
          <div className="lg:col-span-7">
            <div className="overflow-hidden rounded-[1.75rem] border border-line bg-ink-deep p-2 shadow-[0_40px_80px_-40px_color-mix(in_srgb,var(--color-ink)_70%,transparent)]">
              <img src="/marketing/overview.webp" alt="A project's overview in Najenga: its budget used, latest expenses and team" loading="lazy" className="w-full rounded-[1.35rem]" />
            </div>
          </div>
        </Container>
      </section>

      <section id="safe" className={`${SECTION_OFFSET} py-24`}>
        <Container>
          <div className="overflow-hidden rounded-[2rem] bg-ink-deep p-6 text-white sm:p-10 lg:p-14">
            <div className="grid gap-6 lg:grid-cols-2 lg:items-end">
              <h2 className="!font-display text-5xl !font-light leading-[1.02] tracking-tight !text-white sm:text-6xl">Your project, kept safe</h2>
              <p className="max-w-md text-white/70">Money and contracts deserve more than a password. Najenga gives every account modern ways to sign in, and keeps every record’s history.</p>
            </div>
            <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {SAFETY.map(({ icon: Icon, title, text }) => (
                <div key={title} className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
                  <Icon aria-hidden="true" className="h-5 w-5 text-accent-soft" />
                  <h3 className="mt-4 !font-sans !font-semibold !text-white">{title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-white/60">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      <FaqSection
        items={FAQS}
        text={
          <>
            Something else?{' '}
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-accent underline underline-offset-4">
              Talk to our team.
            </a>
          </>
        }
      />

      <section className="pb-24">
        <Container>
          <div className="relative isolate overflow-hidden rounded-[2rem] px-6 py-16 text-center text-white sm:px-12 sm:py-20">
            <Photo image={`${BG}/pexels-artbovich-7031607.webp`} className="-z-20" />
            <div className="absolute inset-0 -z-10 bg-gradient-to-br from-accent-strong/90 via-ink-deep/85 to-ink-deep/90" />
            <h2 className="mx-auto max-w-3xl !font-display text-4xl !font-light leading-[1.05] tracking-tight !text-white sm:text-6xl">Start your build with a clear view of it.</h2>
            <p className="mx-auto mt-5 max-w-xl text-white/80">Set up your first project in a few minutes, and invite the people who should follow it.</p>
            <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
              <PillLink to={signedIn ? '/dashboard' : '/register'} variant="light" size="lg">
                {signedIn ? 'Open your dashboard' : 'Get started'}
              </PillLink>
              {!signedIn && (
                <PillLink to="/login" variant="glass" size="lg">
                  Sign in
                </PillLink>
              )}
            </div>
          </div>
        </Container>
      </section>
    </SiteLayout>
  );
}
