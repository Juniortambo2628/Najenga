import { Head, Link } from '@inertiajs/react';

export default function Terms({ effectiveDate, contactEmail }) {
    return (
        <>
            <Head title="Terms of Service" />
            <div className="min-h-screen bg-black text-gray-200">
                <header className="border-b border-white/10 bg-black/60 backdrop-blur sticky top-0 z-10">
                    <div className="max-w-3xl mx-auto px-5 py-4 flex items-center justify-between">
                        <Link href="/" className="flex items-center gap-2">
                            <img src="/Najenga-logos/Najenga-Logo-header-footer-logo-transparent.png" alt="Najenga" className="h-8 w-8" />
                            <span className="text-white font-semibold">Najenga</span>
                        </Link>
                        <nav className="flex items-center gap-4 text-sm text-gray-400">
                            <Link href="/privacy" className="hover:text-white">Privacy</Link>
                            <Link href="/terms" className="text-white">Terms</Link>
                            <Link href="/login" className="hover:text-white">Sign in</Link>
                        </nav>
                    </div>
                </header>

                <main className="max-w-3xl mx-auto px-5 py-10">
                    <h1 className="text-3xl font-bold text-white">Terms of Service</h1>
                    <p className="text-sm text-gray-400 mt-2">Effective date: {effectiveDate}</p>

                    <Section title="1. Acceptance">
                        <p>By creating an account or using Najenga, you agree to these Terms and to our{' '}
                            <Link href="/privacy" className="text-red-400 hover:underline">Privacy Policy</Link>.
                            If you do not agree, do not use the service.
                        </p>
                    </Section>

                    <Section title="2. The service">
                        <p>Najenga is a construction project-management platform: projects, expenses, receipts,
                            documents, photos, timelines, analytics, and messaging integrations (email, WhatsApp).
                            We may add, change or remove features at any time.
                        </p>
                    </Section>

                    <Section title="3. Your account">
                        <p>You are responsible for keeping your credentials secure and for all activity under your
                            account. Notify us immediately of any unauthorised access.
                        </p>
                    </Section>

                    <Section title="4. Acceptable use">
                        <ul className="list-disc ml-6 space-y-2">
                            <li>Do not upload content you do not have the rights to.</li>
                            <li>Do not use the service to harass, defraud, spam or violate any law.</li>
                            <li>Do not attempt to reverse-engineer or attack the service.</li>
                        </ul>
                    </Section>

                    <Section title="5. Your content">
                        <p>You retain ownership of the content you upload. You grant us a limited license to store,
                            process and display that content solely to provide the service to you and your
                            authorised collaborators.
                        </p>
                    </Section>

                    <Section title="6. WhatsApp Business messaging">
                        <p>Messages you exchange with Najenga through WhatsApp are subject to WhatsApp&apos;s own terms.
                            You consent to receive service-related messages when you link your number.
                        </p>
                    </Section>

                    <Section title="7. Fees">
                        <p>Where paid plans apply, fees and billing terms will be presented at the point of purchase.</p>
                    </Section>

                    <Section title="8. Termination">
                        <p>You may delete your account at any time from your Profile page. We may suspend or terminate
                            an account that violates these Terms or that we reasonably suspect of causing harm.
                        </p>
                    </Section>

                    <Section title="9. Disclaimer">
                        <p>The service is provided &ldquo;as is&rdquo; without warranties of any kind. We do not guarantee
                            uninterrupted or error-free operation.
                        </p>
                    </Section>

                    <Section title="10. Limitation of liability">
                        <p>To the maximum extent permitted by law, our aggregate liability for any claim arising out of
                            or relating to the service is limited to the fees you paid us in the twelve months preceding
                            the event giving rise to the claim, or KES 10,000, whichever is higher.
                        </p>
                    </Section>

                    <Section title="11. Governing law">
                        <p>These Terms are governed by the laws of Kenya. Any dispute will be subject to the exclusive
                            jurisdiction of the courts of Nairobi, Kenya.
                        </p>
                    </Section>

                    <Section title="12. Contact">
                        <p>Questions? Write to us at{' '}
                            <a className="text-red-400 hover:underline" href={`mailto:${contactEmail}`}>{contactEmail}</a>.
                        </p>
                    </Section>

                    <footer className="mt-16 pt-6 border-t border-white/10 text-xs text-gray-400 flex flex-wrap gap-4">
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
