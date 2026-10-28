import { Link } from '@inertiajs/react';
import { useState } from 'react';
import { Container, Logo, PillLink } from './ui';

const LINKS = [
    { href: '#journey', label: 'How it works' },
    { href: '#inside', label: 'Inside Najenga' },
    { href: '#who', label: 'Who it’s for' },
    { href: '#faq', label: 'Questions' },
];

/** The top bar over the hero photo: logo, page links, sign in and get started. */
export default function MarketingNav({ auth }) {
    const [open, setOpen] = useState(false);
    const signedIn = !!auth?.user;
    return (
        <header className="absolute inset-x-0 top-0 z-40 text-white">
            <Container className="flex h-20 items-center justify-between gap-6">
                <Logo light className="h-11 sm:h-12" />
                <nav aria-label="Main" className="hidden items-center gap-8 lg:flex">
                    {LINKS.map((link) => (
                        <a key={link.href} href={link.href} className="text-sm text-white/80 transition hover:text-white">
                            {link.label}
                        </a>
                    ))}
                </nav>
                <div className="flex items-center gap-2">
                    {signedIn ? (
                        <PillLink href={route('dashboard')} variant="light" size="sm">
                            Dashboard
                        </PillLink>
                    ) : (
                        <>
                            <Link href={route('login')} className="hidden px-3 py-2 text-sm font-medium text-white/85 transition hover:text-white sm:inline">
                                Sign in
                            </Link>
                            <PillLink href={route('register')} variant="light" size="sm">
                                Get started
                            </PillLink>
                        </>
                    )}
                    <button
                        type="button"
                        onClick={() => setOpen(!open)}
                        aria-expanded={open}
                        aria-label={open ? 'Close menu' : 'Open menu'}
                        className="grid h-10 w-10 place-items-center rounded-full border border-white/30 bg-white/10 backdrop-blur lg:hidden"
                    >
                        <i aria-hidden="true" className={`fas ${open ? 'fa-xmark' : 'fa-bars'}`} />
                    </button>
                </div>
            </Container>
            {open && (
                <Container>
                    <nav aria-label="Main" className="rounded-3xl bg-white p-3 text-[#1A1514] shadow-2xl lg:hidden">
                        {LINKS.map((link) => (
                            <a key={link.href} href={link.href} onClick={() => setOpen(false)} className="block rounded-2xl px-4 py-3 font-medium hover:bg-[#F4F1EE]">
                                {link.label}
                            </a>
                        ))}
                        {!signedIn && (
                            <Link href={route('login')} className="block rounded-2xl px-4 py-3 font-medium hover:bg-[#F4F1EE]">
                                Sign in
                            </Link>
                        )}
                    </nav>
                </Container>
            )}
        </header>
    );
}
