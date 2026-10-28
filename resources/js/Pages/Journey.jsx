import { Head } from '@inertiajs/react';
import MarketingNav from '@/Components/Landing/MarketingNav';
import MarketingFooter from '@/Components/Landing/MarketingFooter';
import PhotoHero from '@/Components/Landing/PhotoHero';
import SectionNav, { SECTION_OFFSET } from '@/Components/Landing/SectionNav';
import FaqSection from '@/Components/Landing/FaqSection';
import { Container, Eyebrow, ImageCard, PillLink, SectionHeading } from '@/Components/Landing/ui';
import { JOURNEYS, TOOLKIT } from '@/Config/journeys';
import { featureGroup } from '@/Config/marketing';

const OTHER = { homeowners: 'contractors', contractors: 'homeowners' };

/** "At a glance" numbers, overlapping the hero. */
function Glance({ journey }) {
    return (
        <div className="rounded-[2rem] bg-white p-6 shadow-[0_40px_80px_-40px_rgba(26,21,20,0.5)] sm:p-10">
            <dl className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
                {journey.glance.map(([value, label]) => (
                    <div key={label} className="flex flex-col-reverse justify-end rounded-2xl bg-[#F4F1EE] p-5">
                        <dt className="mt-1 text-sm text-[#5E5450]">{label}</dt>
                        <dd className="font-display text-3xl font-light tracking-tight text-[#1A1514] sm:text-4xl">{value}</dd>
                    </div>
                ))}
            </dl>
        </div>
    );
}

/** A chapter's picture: a screen from the app in a dark frame, or a photo from site. */
function Media({ media, title }) {
    if (media.screen) {
        return (
            <div className="overflow-hidden rounded-[1.75rem] border border-[#E2D9D2] bg-[#140F0E] p-2 shadow-[0_40px_80px_-40px_rgba(26,21,20,0.7)]">
                <img src={media.screen} alt={`Najenga: ${title}`} loading="lazy" className="w-full rounded-[1.35rem]" />
            </div>
        );
    }
    return (
        <div className="aspect-[4/3] overflow-hidden rounded-[1.75rem] shadow-[0_40px_80px_-40px_rgba(26,21,20,0.7)]">
            <img src={media.photo} alt="" loading="lazy" className="h-full w-full object-cover" />
        </div>
    );
}

/**
 * One chapter of the journey. On wide screens the picture stays put on the
 * left while the title, steps and fine print sit beside it; on phones they stack.
 */
function Chapter({ chapter, index }) {
    return (
        <article id={chapter.id} className={`${SECTION_OFFSET} grid gap-8 border-t border-[#E2D9D2] py-14 first:border-t-0 first:pt-0 lg:grid-cols-12 lg:gap-12 lg:py-16`}>
            <div className="lg:sticky lg:top-24 lg:col-span-7 lg:self-start">
                <Media media={chapter.media} title={chapter.title} />
            </div>

            <div className="lg:col-span-5">
                <div className="flex items-center gap-3">
                    <span aria-hidden="true" className="font-display text-4xl font-extralight text-[#D4A7A0]">
                        {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className="rounded-full bg-[#1A1514] px-3 py-1 text-[11px] font-semibold text-white">{chapter.when}</span>
                </div>
                <h2 className="mt-3 font-display text-3xl font-light tracking-tight text-[#1A1514] sm:text-4xl">{chapter.title}</h2>
                <p className="mt-3 leading-relaxed text-[#5E5450]">{chapter.intro}</p>

                <ol className="mt-6 divide-y divide-[#F0EAE5] rounded-3xl border border-[#E6DFD9] bg-white">
                    {chapter.steps.map((step, i) => (
                        <li key={step.title} className="flex gap-4 p-5">
                            <span aria-hidden="true" className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#F4EEEA] text-xs font-semibold text-[#B3122E]">
                                {i + 1}
                            </span>
                            <div>
                                <h3 className="text-base font-semibold text-[#1A1514]">{step.title}</h3>
                                <p className="mt-1 text-sm leading-relaxed text-[#5E5450]">{step.text}</p>
                            </div>
                        </li>
                    ))}
                </ol>

                {chapter.details.length > 0 && (
                    <div className="mt-4 rounded-3xl bg-[#EDE6E1] p-5">
                        <Eyebrow>The nitty-gritty</Eyebrow>
                        <ul className="mt-3 space-y-2 text-sm text-[#3A2F2C]">
                            {chapter.details.map((detail) => (
                                <li key={detail} className="flex gap-3">
                                    <i aria-hidden="true" className="fas fa-circle-check mt-1 text-xs text-[#B3122E]" />
                                    {detail}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
                {chapter.tip && (
                    <div className="mt-4 flex gap-4 rounded-3xl bg-[#1A1514] p-5 text-white">
                        <i aria-hidden="true" className="fas fa-lightbulb mt-0.5 text-rose-300" />
                        <div>
                            <p className="text-[11px] font-semibold text-rose-200">Good to know</p>
                            <p className="mt-2 text-sm leading-relaxed text-white/85">{chapter.tip}</p>
                        </div>
                    </div>
                )}
            </div>
        </article>
    );
}

/** A step-by-step journey through Najenga, after Naoa's: for homeowners or for contractors. */
export default function Journey({ auth, journeyId }) {
    const journey = JOURNEYS[journeyId];
    const other = JOURNEYS[OTHER[journeyId]];
    const signedIn = !!auth?.user;

    return (
        <div className="min-h-screen bg-[#F4F1EE] text-[#1A1514]">
            <Head title={`${journey.eyebrow} | Najenga`} />
            <MarketingNav auth={auth} />

            <main id="main-content">
                <PhotoHero image={journey.photo} position={journey.photoPosition} eyebrow={journey.eyebrow} title={journey.title} text={journey.text} after={<Glance journey={journey} />}>
                    <PillLink href={signedIn ? route('dashboard') : route('register')} variant="light" size="lg">
                        {signedIn ? 'Open your dashboard' : 'Start your first project'}
                    </PillLink>
                    <PillLink href={`${route('home')}#inside`} variant="glass" size="lg" arrow>
                        Everything inside
                    </PillLink>
                </PhotoHero>

                <div className="pt-24">
                    <SectionNav
                        label="The journey"
                        sections={[...journey.chapters.map((c) => ({ id: c.id, label: c.title })), { id: 'toolkit', label: 'Your toolkit' }, { id: 'faq', label: 'Questions' }]}
                    />
                </div>

                <Container className="py-20">
                    {journey.chapters.map((chapter, i) => (
                        <Chapter key={chapter.id} chapter={chapter} index={i} />
                    ))}
                </Container>

                <section id="toolkit" className={`${SECTION_OFFSET} py-24`}>
                    <Container>
                        <SectionHeading eyebrow="Your toolkit" title="Everything in this journey, in depth" text="Each of these is a whole part of Najenga. Open one to see what it does." />
                        <div className="mt-14 grid gap-5 md:grid-cols-2">
                            {TOOLKIT[journey.id].map((id, i) => {
                                const group = featureGroup(id);
                                return (
                                    <ImageCard
                                        key={id}
                                        href={`${route('home')}#inside`}
                                        image={group.image}
                                        tags={[group.eyebrow]}
                                        title={group.title}
                                        text={group.summary}
                                        className={i === 0 || i === 3 ? 'min-h-[26rem]' : 'min-h-[22rem]'}
                                    />
                                );
                            })}
                        </div>
                        <ImageCard
                            href={route(`journey.${other.id}`)}
                            image={other.photo}
                            tags={[other.eyebrow, 'Step by step']}
                            title={other.title}
                            text={other.text}
                            className="mt-5 min-h-[20rem]"
                            titleClass="text-3xl sm:text-4xl"
                        />
                    </Container>
                </section>

                <FaqSection items={journey.faqs} text={<>Something else? <a href="mailto:najenga-info@okjtech.co.ke" className="text-[#B3122E] underline underline-offset-4">Talk to our team.</a></>} />
            </main>

            <MarketingFooter auth={auth} />
        </div>
    );
}
