import { LegalPage, SiteLayout } from '@okjt/site';
import { EFFECTIVE_DATE, PRIVACY, TERMS } from '../content/legal';

const DOCS = {
  privacy: { title: 'Privacy Policy', intro: `How Najenga collects, uses and protects your information. Effective ${EFFECTIVE_DATE}.`, sections: PRIVACY },
  terms: { title: 'Terms of Service', intro: `The terms for using Najenga. Effective ${EFFECTIVE_DATE}.`, sections: TERMS },
};

/** The privacy policy and terms, in the kit's legal layout. */
export default function Legal({ doc }) {
  const { title, intro, sections } = DOCS[doc];
  return (
    <SiteLayout cta={false}>
      <LegalPage title={title} intro={intro} sections={sections} />
    </SiteLayout>
  );
}
