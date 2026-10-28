import { Link } from '@inertiajs/react';
import { Container, Logo } from './ui';

/** The public pages' footer: what Najenga is, page links and the legal pages. */
export default function MarketingFooter({ auth }) {
    return (
        <footer className="bg-[#140F0E] text-white/60">
            <Container className="grid gap-10 py-14 md:grid-cols-12">
                <div className="md:col-span-5">
                    <Logo light className="h-12" />
                    <p className="mt-5 max-w-sm text-sm leading-relaxed">
                        “Najenga” is Kiswahili for “I’m building”. Construction project management for the people paying for, running and doing the work.
                    </p>
                </div>
                <nav aria-label="Footer" className="grid grid-cols-2 gap-8 text-sm sm:grid-cols-3 md:col-span-7">
                    <div className="space-y-3">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/40">Najenga</p>
                        <a href={`${route('home')}#journey`} className="block hover:text-white">How it works</a>
                        <a href={`${route('home')}#inside`} className="block hover:text-white">Inside Najenga</a>
                        <Link href={route('journey.homeowners')} className="block hover:text-white">For homeowners</Link>
                        <Link href={route('journey.contractors')} className="block hover:text-white">For contractors</Link>
                        <a href={`${route('home')}#faq`} className="block hover:text-white">Questions</a>
                    </div>
                    <div className="space-y-3">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/40">Your account</p>
                        {auth?.user ? (
                            <Link href={route('dashboard')} className="block hover:text-white">Dashboard</Link>
                        ) : (
                            <>
                                <Link href={route('register')} className="block hover:text-white">Get started</Link>
                                <Link href={route('login')} className="block hover:text-white">Sign in</Link>
                            </>
                        )}
                        <a href="mailto:najenga-info@okjtech.co.ke" className="block hover:text-white">Contact us</a>
                    </div>
                    <div className="space-y-3">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/40">Legal</p>
                        <Link href={route('privacy')} className="block hover:text-white">Privacy</Link>
                        <Link href={route('terms')} className="block hover:text-white">Terms</Link>
                    </div>
                </nav>
            </Container>
            <div className="border-t border-white/10">
                <Container className="py-6 text-xs text-white/40">© {new Date().getFullYear()} Najenga by OKJ Technologies.</Container>
            </div>
        </footer>
    );
}
