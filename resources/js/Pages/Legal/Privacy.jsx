import { Head, Link } from '@inertiajs/react';

export default function Privacy({ effectiveDate, contactEmail }) {
    return (
        <>
            <Head title="Privacy Policy" />
            <div className="min-h-screen bg-black text-gray-200">
                <header className="border-b border-white/10 bg-black/60 backdrop-blur sticky top-0 z-10">
                    <div className="max-w-3xl mx-auto px-5 py-4 flex items-center justify-between">
                        <Link href="/" className="flex items-center gap-2">
                            <img src="/Najenga-logos/Najenga-Logo-header-footer-logo-transparent.png" alt="Najenga" className="h-8 w-8" />
                            <span className="text-white font-semibold">Najenga</span>
                        </Link>
                        <nav className="flex items-center gap-4 text-sm text-gray-400">
                            <Link href="/privacy" className="text-white">Privacy</Link>
                            <Link href="/terms" className="hover:text-white">Terms</Link>
                            <Link href="/login" className="hover:text-white">Sign in</Link>
                        </nav>
                    </div>
                </header>

                <main className="max-w-3xl mx-auto px-5 py-10">
                    <h1 className="text-3xl font-bold text-white">Privacy Policy</h1>
                    <p className="text-sm text-gray-400 mt-2">Effective date: {effectiveDate}</p>

                    <Section title="1. Who we are">
                        <p>
                            Najenga (&ldquo;we&rdquo;, &ldquo;us&rdquo;) is a construction and project-management platform operated by
                            OKJTech, based in Nairobi, Kenya. This Privacy Policy explains what data we collect when you use
                            the Najenga application at <a className="text-red-400 hover:underline" href="https://najenga.okjtech.co.ke">najenga.okjtech.co.ke</a>,
                            how we use it, and the choices you have.
                        </p>
                    </Section>

                    <Section title="2. Information we collect">
                        <ul className="list-disc ml-6 space-y-2">
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
                    </Section>

                    <Section title="3. How we use your information">
                        <ul className="list-disc ml-6 space-y-2">
                            <li>To provide and operate the Najenga service (accounts, projects, expenses, documents, timelines).</li>
                            <li>To authenticate you, keep your session secure, and prevent unauthorised access.</li>
                            <li>To process receipts you send (via web upload or WhatsApp) and create expense records.</li>
                            <li>To send transactional notifications (email or WhatsApp) related to your account and receipts.</li>
                            <li>To troubleshoot bugs, monitor performance, and improve the service.</li>
                            <li>To comply with legal obligations and enforce our Terms of Service.</li>
                        </ul>
                    </Section>

                    <Section title="4. Legal basis for processing (GDPR / DPA)">
                        <p>
                            Where the Kenya Data Protection Act 2019 or the EU/UK GDPR applies, we rely on the following
                            legal bases: performance of a contract with you (providing the service), your consent (WhatsApp
                            linking, marketing communications), and our legitimate interests (security, fraud prevention,
                            product improvement). You may withdraw consent at any time.
                        </p>
                    </Section>

                    <Section title="5. Sharing your information">
                        <p>We do not sell your personal information. We share it only with:</p>
                        <ul className="list-disc ml-6 space-y-2 mt-2">
                            <li><b>Meta Platforms Inc.</b> — for WhatsApp Cloud API messaging.</li>
                            <li><b>OCR.space</b> — for extracting text from uploaded receipts, when local OCR is unavailable.</li>
                            <li><b>Our hosting provider</b> (cPanel-based shared hosting operated by OKJTech) — to store data.</li>
                            <li><b>Email delivery provider</b> — the SMTP server we use to send transactional emails.</li>
                            <li><b>Law enforcement or regulators</b> — where required by a valid legal request.</li>
                            <li><b>Successors</b> — in the event of a merger, acquisition or sale of assets, subject to
                                the same protections in this policy.</li>
                        </ul>
                    </Section>

                    <Section title="6. Data retention">
                        <p>
                            We keep your account data for as long as your account is active. Project data, expenses,
                            photos and documents are retained until you delete them or your account is closed. WhatsApp
                            webhook events are kept for up to 90 days for audit; verification codes expire after 10 minutes.
                            Server access logs are rotated on a rolling 14-day window. On account deletion, we remove your
                            personal data within 30 days, except where retention is required by law.
                        </p>
                    </Section>

                    <Section title="7. Your rights">
                        <p>You have the right to:</p>
                        <ul className="list-disc ml-6 space-y-2 mt-2">
                            <li>Access the personal data we hold about you and receive a copy.</li>
                            <li>Correct any inaccurate information.</li>
                            <li>Delete your account and associated data (via your Profile page or by writing to us).</li>
                            <li>Object to or restrict certain processing, and withdraw consent.</li>
                            <li>Lodge a complaint with the Office of the Data Protection Commissioner (Kenya) or your
                                local supervisory authority.</li>
                        </ul>
                        <p className="mt-2">
                            To exercise these rights, contact us at <a className="text-red-400 hover:underline" href={`mailto:${contactEmail}`}>{contactEmail}</a>.
                        </p>
                    </Section>

                    <Section title="8. Security">
                        <p>
                            We apply industry-standard measures to protect your data, including HTTPS/TLS for all
                            traffic, bcrypt password hashing, HTTP-only secure session cookies, CSRF protection,
                            server-side validation, role-based access control and signed webhook verification for
                            WhatsApp. No system is 100% secure; if we become aware of a breach that affects your
                            personal data, we will notify you and the relevant supervisory authority as required by law.
                        </p>
                    </Section>

                    <Section title="9. Cookies">
                        <p>
                            We use a strictly-necessary session cookie to keep you signed in and a CSRF-protection
                            cookie to prevent cross-site request forgery. We do not use advertising or third-party
                            tracking cookies.
                        </p>
                    </Section>

                    <Section title="10. Children">
                        <p>
                            Najenga is not directed to children under 13, and we do not knowingly collect personal
                            information from children under 13. If you believe a child has provided us with data,
                            contact us and we will delete it.
                        </p>
                    </Section>

                    <Section title="11. International transfers">
                        <p>
                            Some of our sub-processors (notably Meta / WhatsApp and OCR.space) process data outside
                            Kenya, including in the United States. Where such transfers occur, we rely on appropriate
                            safeguards such as Standard Contractual Clauses.
                        </p>
                    </Section>

                    <Section title="12. Changes to this policy">
                        <p>
                            We may update this Privacy Policy from time to time. When we do, we will update the
                            &ldquo;Effective date&rdquo; above and, for material changes, notify you by email or an
                            in-app notice.
                        </p>
                    </Section>

                    <Section title="13. Contact">
                        <p>
                            Questions about this policy or your data? Write to us at{' '}
                            <a className="text-red-400 hover:underline" href={`mailto:${contactEmail}`}>{contactEmail}</a>.
                        </p>
                    </Section>

                    <footer className="mt-16 pt-6 border-t border-white/10 text-xs text-gray-500 flex flex-wrap gap-4">
                        <Link href="/" className="hover:text-white">Home</Link>
                        <Link href="/privacy" className="hover:text-white">Privacy</Link>
                        <Link href="/terms" className="hover:text-white">Terms</Link>
                        <span className="ml-auto">&copy; {new Date().getFullYear()} OKJTech</span>
                    </footer>
                </main>
            </div>
        </>
    );
}

function Section({ title, children }) {
    return (
        <section className="mt-8">
            <h2 className="text-xl font-semibold text-white mb-3">{title}</h2>
            <div className="leading-relaxed text-gray-300 text-[15px] space-y-3">{children}</div>
        </section>
    );
}
