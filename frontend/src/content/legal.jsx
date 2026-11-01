import { Link } from 'react-router-dom';

/**
 * Najenga's terms and privacy policy, word for word from the Inertia pages,
 * as sections for the OKJT kit's LegalPage (it numbers them).
 */
export const EFFECTIVE_DATE = '16 September 2026';
export const LAST_UPDATED = '2026-09-16';
export const CONTACT_EMAIL = 'najenga-info@okjtech.co.ke';

export const TERMS = [
  { id: 'acceptance', title: 'Acceptance', body: (
    <>
              <p>By creating an account or using Najenga, you agree to these Terms and to our{' '}
                  <Link to="/privacy">Privacy Policy</Link>.
                  If you do not agree, do not use the service.
              </p>
    </>
  ) },
  { id: 'the-service', title: 'The service', body: (
    <>
              <p>Najenga is a construction project-management platform: projects, expenses, receipts,
                  documents, photos, timelines, analytics, and messaging integrations (email, WhatsApp).
                  We may add, change or remove features at any time.
              </p>
    </>
  ) },
  { id: 'your-account', title: 'Your account', body: (
    <>
              <p>You are responsible for keeping your credentials secure and for all activity under your
                  account. Notify us immediately of any unauthorised access.
              </p>
    </>
  ) },
  { id: 'acceptable-use', title: 'Acceptable use', body: (
    <>
              <ul>
                  <li>Do not upload content you do not have the rights to.</li>
                  <li>Do not use the service to harass, defraud, spam or violate any law.</li>
                  <li>Do not attempt to reverse-engineer or attack the service.</li>
              </ul>
    </>
  ) },
  { id: 'your-content', title: 'Your content', body: (
    <>
              <p>You retain ownership of the content you upload. You grant us a limited license to store,
                  process and display that content solely to provide the service to you and your
                  authorised collaborators.
              </p>
    </>
  ) },
  { id: 'whatsapp-business-messaging', title: 'WhatsApp Business messaging', body: (
    <>
              <p>Messages you exchange with Najenga through WhatsApp are subject to WhatsApp&apos;s own terms.
                  You consent to receive service-related messages when you link your number.
              </p>
    </>
  ) },
  { id: 'fees', title: 'Fees', body: (
    <>
              <p>Where paid plans apply, fees and billing terms will be presented at the point of purchase.</p>
    </>
  ) },
  { id: 'termination', title: 'Termination', body: (
    <>
              <p>You may delete your account at any time from your Profile page. We may suspend or terminate
                  an account that violates these Terms or that we reasonably suspect of causing harm.
              </p>
    </>
  ) },
  { id: 'disclaimer', title: 'Disclaimer', body: (
    <>
              <p>The service is provided &ldquo;as is&rdquo; without warranties of any kind. We do not guarantee
                  uninterrupted or error-free operation.
              </p>
    </>
  ) },
  { id: 'limitation-of-liability', title: 'Limitation of liability', body: (
    <>
              <p>To the maximum extent permitted by law, our aggregate liability for any claim arising out of
                  or relating to the service is limited to the fees you paid us in the twelve months preceding
                  the event giving rise to the claim, or KES 10,000, whichever is higher.
              </p>
    </>
  ) },
  { id: 'governing-law', title: 'Governing law', body: (
    <>
              <p>These Terms are governed by the laws of Kenya. Any dispute will be subject to the exclusive
                  jurisdiction of the courts of Nairobi, Kenya.
              </p>
    </>
  ) },
  { id: 'contact', title: 'Contact', body: (
    <>
              <p>Questions? Write to us at{' '}
                  <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
              </p>
    </>
  ) },
];

export const PRIVACY = [
  { id: 'who-we-are', title: 'Who we are', body: (
    <>
              <p>
                  Najenga (&ldquo;we&rdquo;, &ldquo;us&rdquo;) is a construction and project-management platform operated by
                  OKJTech, based in Nairobi, Kenya. This Privacy Policy explains what data we collect when you use
                  the Najenga application at <a href="https://najenga.okjtech.co.ke">najenga.okjtech.co.ke</a>,
                  how we use it, and the choices you have.
              </p>
    </>
  ) },
  { id: 'information-we-collect', title: 'Information we collect', body: (
    <>
              <ul>
                  <li>
                      <b>Account information</b> — name, email address, phone number, username, and (optionally) a
                      profile image, provided when you sign up or update your profile.
                  </li>
                  <li>
                      <b>Authentication data</b> — hashed password, session cookies, and (for two-factor
                      verification via WhatsApp) one-time codes stored temporarily in our cache.
                  </li>
                  <li>
                      <b>Project data</b> — projects, timelines, expenses, receipts, photos and documents that you
                      or teammates upload, including any metadata you attach (title, date, category, amount,
                      location, notes, comments, annotations).
                  </li>
                  <li>
                      <b>WhatsApp integration data</b> — when you link your WhatsApp number, we store your
                      WhatsApp business ID (<code>wa_id</code>) and verification timestamp. If you send messages
                      or images to our WhatsApp business number, we receive and store the message ID, sender
                      number, timestamp, text content, and any attached images used for receipt extraction. Meta
                      Platforms Inc. also processes this data as our sub-processor under the WhatsApp Business
                      Platform.
                  </li>
                  <li>
                      <b>Optical Character Recognition (OCR) data</b> — receipts and documents you upload may be
                      sent to our OCR provider (OCR.space) to extract text such as amount, merchant name and
                      date. The extracted text is stored against the corresponding expense record.
                  </li>
                  <li>
                      <b>Activity logs</b> — records of key actions (creating, updating and deleting records) for
                      security and audit purposes.
                  </li>
                  <li>
                      <b>Technical data</b> — IP address, browser type, device information and pages visited,
                      collected in server access logs.
                  </li>
              </ul>
    </>
  ) },
  { id: 'how-we-use-your-information', title: 'How we use your information', body: (
    <>
              <ul>
                  <li>To provide and operate the Najenga service (accounts, projects, expenses, documents, timelines).</li>
                  <li>To authenticate you, keep your session secure, and prevent unauthorised access.</li>
                  <li>To process receipts you send (via web upload or WhatsApp) and create expense records.</li>
                  <li>To send transactional notifications (email or WhatsApp) related to your account and receipts.</li>
                  <li>To troubleshoot bugs, monitor performance, and improve the service.</li>
                  <li>To comply with legal obligations and enforce our Terms of Service.</li>
              </ul>
    </>
  ) },
  { id: 'legal-basis-for-processing-gdpr-dpa', title: 'Legal basis for processing (GDPR / DPA)', body: (
    <>
              <p>
                  Where the Kenya Data Protection Act 2019 or the EU/UK GDPR applies, we rely on the following
                  legal bases: performance of a contract with you (providing the service), your consent (WhatsApp
                  linking, marketing communications), and our legitimate interests (security, fraud prevention,
                  product improvement). You may withdraw consent at any time.
              </p>
    </>
  ) },
  { id: 'sharing-your-information', title: 'Sharing your information', body: (
    <>
              <p>We do not sell your personal information. We share it only with:</p>
              <ul>
                  <li><b>Meta Platforms Inc.</b> — for WhatsApp Cloud API messaging.</li>
                  <li><b>OCR.space</b> — for extracting text from uploaded receipts, when local OCR is unavailable.</li>
                  <li><b>Our hosting provider</b> (cPanel-based shared hosting operated by OKJTech) — to store data.</li>
                  <li><b>Email delivery provider</b> — the SMTP server we use to send transactional emails.</li>
                  <li><b>Law enforcement or regulators</b> — where required by a valid legal request.</li>
                  <li><b>Successors</b> — in the event of a merger, acquisition or sale of assets, subject to
                      the same protections in this policy.</li>
              </ul>
    </>
  ) },
  { id: 'data-retention', title: 'Data retention', body: (
    <>
              <p>
                  We keep your account data for as long as your account is active. Project data, expenses,
                  photos and documents are retained until you delete them or your account is closed. WhatsApp
                  webhook events are kept for up to 90 days for audit; verification codes expire after 10 minutes.
                  Server access logs are rotated on a rolling 14-day window. On account deletion, we remove your
                  personal data within 30 days, except where retention is required by law.
              </p>
    </>
  ) },
  { id: 'your-rights', title: 'Your rights', body: (
    <>
              <p>You have the right to:</p>
              <ul>
                  <li>Access the personal data we hold about you and receive a copy.</li>
                  <li>Correct any inaccurate information.</li>
                  <li>Delete your account and associated data (via your Profile page or by writing to us).</li>
                  <li>Object to or restrict certain processing, and withdraw consent.</li>
                  <li>Lodge a complaint with the Office of the Data Protection Commissioner (Kenya) or your
                      local supervisory authority.</li>
              </ul>
              <p className="mt-2">
                  To exercise these rights, contact us at <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
              </p>
    </>
  ) },
  { id: 'security', title: 'Security', body: (
    <>
              <p>
                  We apply industry-standard measures to protect your data, including HTTPS/TLS for all
                  traffic, bcrypt password hashing, HTTP-only secure session cookies, CSRF protection,
                  server-side validation, role-based access control and signed webhook verification for
                  WhatsApp. No system is 100% secure; if we become aware of a breach that affects your
                  personal data, we will notify you and the relevant supervisory authority as required by law.
              </p>
    </>
  ) },
  { id: 'cookies', title: 'Cookies', body: (
    <>
              <p>
                  We use a strictly-necessary session cookie to keep you signed in and a CSRF-protection
                  cookie to prevent cross-site request forgery. We do not use advertising or third-party
                  tracking cookies.
              </p>
    </>
  ) },
  { id: 'children', title: 'Children', body: (
    <>
              <p>
                  Najenga is not directed to children under 13, and we do not knowingly collect personal
                  information from children under 13. If you believe a child has provided us with data,
                  contact us and we will delete it.
              </p>
    </>
  ) },
  { id: 'international-transfers', title: 'International transfers', body: (
    <>
              <p>
                  Some of our sub-processors (notably Meta / WhatsApp and OCR.space) process data outside
                  Kenya, including in the United States. Where such transfers occur, we rely on appropriate
                  safeguards such as Standard Contractual Clauses.
              </p>
    </>
  ) },
  { id: 'changes-to-this-policy', title: 'Changes to this policy', body: (
    <>
              <p>
                  We may update this Privacy Policy from time to time. When we do, we will update the
                  &ldquo;Effective date&rdquo; above and, for material changes, notify you by email or an
                  in-app notice.
              </p>
    </>
  ) },
  { id: 'contact', title: 'Contact', body: (
    <>
              <p>
                  Questions about this policy or your data? Write to us at{' '}
                  <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
              </p>
    </>
  ) },
];
