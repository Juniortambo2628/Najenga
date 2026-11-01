import {
  Container,
  FaqSection,
  ImageCard,
  JourneyChapter,
  JourneyGlance,
  PhotoHero,
  PillLink,
  SECTION_OFFSET,
  SectionHeading,
  SectionNav,
  SiteLayout,
  useSignedIn,
} from '@okjt/site';
import { featureGroup } from '../content/marketing';
import { JOURNEYS, TOOLKIT } from '../content/journeys';
import { CONTACT_EMAIL } from '../content/legal';

const OTHER = { homeowners: 'contractors', contractors: 'homeowners' };

/**
 * A chapter's picture for the kit: a screen from the app by its media key
 * (site.config.jsx), or a photo from site in the same frame.
 */
const chapterMedia = (media) =>
  media.screen ? media.screen.replace(/^\/marketing\/|\.webp$/g, '') : { src: media.photo, alt: '', url: 'On site' };

/** A step-by-step journey through Najenga: for homeowners or for contractors. */
export default function Journey({ id }) {
  const journey = JOURNEYS[id];
  const other = JOURNEYS[OTHER[id]];
  const signedIn = useSignedIn();

  return (
    <SiteLayout overlay cta={false}>
      <PhotoHero tall image={journey.photo} position={journey.photoPosition} eyebrow={journey.eyebrow} title={journey.title} text={journey.text} after={<JourneyGlance journey={journey} />}>
        <PillLink to={signedIn ? '/dashboard' : '/register'} variant="light" size="lg">
          {signedIn ? 'Open your dashboard' : 'Start your first project'}
        </PillLink>
        <PillLink to="/#inside" variant="glass" size="lg" arrow>
          Everything inside
        </PillLink>
      </PhotoHero>

      <div className="pt-24">
        <SectionNav
          label="The journey"
          numbered
          sections={[...journey.chapters.map((c) => ({ id: c.id, label: c.title })), { id: 'toolkit', label: 'Your toolkit' }, { id: 'faq', label: 'Questions' }]}
        />
      </div>

      <Container className="py-20">
        {journey.chapters.map((chapter, i) => (
          <JourneyChapter key={chapter.id} chapter={{ ...chapter, media: chapterMedia(chapter.media) }} index={i} />
        ))}
      </Container>

      <section id="toolkit" className={`${SECTION_OFFSET} py-24`}>
        <Container>
          <SectionHeading eyebrow="Your toolkit" title="Everything in this journey, in depth" text="Each of these is a whole part of Najenga. Open one to see what it does." />
          <div className="mt-14 grid gap-5 md:grid-cols-2">
            {TOOLKIT[journey.id].map((groupId, i) => {
              const group = featureGroup(groupId);
              return (
                <ImageCard
                  key={groupId}
                  to="/#inside"
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
            to={`/for-${other.id}`}
            image={other.photo}
            tags={[other.eyebrow, 'Step by step']}
            title={other.title}
            text={other.text}
            className="mt-5 min-h-[20rem]"
            titleClass="text-3xl sm:text-4xl"
          />
        </Container>
      </section>

      <FaqSection
        items={journey.faqs}
        text={
          <>
            Something else?{' '}
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-accent underline underline-offset-4">
              Talk to our team.
            </a>
          </>
        }
      />
    </SiteLayout>
  );
}
