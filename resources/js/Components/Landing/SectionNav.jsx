import { useEffect, useRef, useState } from 'react';
import { Container } from './ui';

/** Sections linked from a SectionNav need this much room above them when jumped to. */
export const SECTION_OFFSET = 'scroll-mt-32';

/** The id of the section being read: the last one whose top has passed a third of the screen. */
export function useScrollSpy(ids) {
    const [active, setActive] = useState(ids[0]);
    const key = ids.join('|');
    useEffect(() => {
        if (typeof window === 'undefined' || !('IntersectionObserver' in window)) return undefined;
        const visible = new Map();
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => visible.set(entry.target.id, entry.isIntersecting));
                const current = ids.filter((id) => visible.get(id)).at(0);
                if (current) {
                    setActive(current);
                    return;
                }
                // Back above the first section: it's the one coming up.
                const first = document.getElementById(ids[0]);
                if (first && first.getBoundingClientRect().top > window.innerHeight * 0.3) setActive(ids[0]);
            },
            { rootMargin: '-30% 0px -60% 0px' },
        );
        ids.forEach((id) => {
            const el = document.getElementById(id);
            if (el) observer.observe(el);
        });
        return () => observer.disconnect();
        // eslint-disable-next-line react-hooks/exhaustive-deps -- key summarises ids
    }, [key]);
    return active;
}

/**
 * The sticky bar of chips under the hero, one per section of the page; the
 * one being read is highlighted. Sections: [{ id, label }].
 */
export default function SectionNav({ sections, label = 'On this page' }) {
    const active = useScrollSpy(sections.map((s) => s.id));
    const bar = useRef(null);

    // Keep the current chip in view as the reader moves down the page.
    useEffect(() => {
        const nav = bar.current;
        const chip = nav?.querySelector('[aria-current]');
        if (!nav || !chip) return;
        nav.scrollTo?.({ left: chip.offsetLeft - nav.clientWidth / 2 + chip.clientWidth / 2, behavior: 'smooth' });
    }, [active]);

    return (
        <div className="sticky top-0 z-30 border-y border-[#E6DFD9]/70 bg-[#F4F1EE]/90 backdrop-blur-xl">
            <Container>
                <nav ref={bar} aria-label={label} className="-mx-4 flex gap-2 overflow-x-auto px-4 py-3 [scrollbar-width:none]">
                    {sections.map((section, i) => {
                        const current = active === section.id;
                        return (
                            <a
                                key={section.id}
                                href={`#${section.id}`}
                                aria-current={current ? 'location' : undefined}
                                className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition-colors ${current ? 'bg-[#1A1514] text-white' : 'bg-white text-[#5E5450] hover:text-[#1A1514]'}`}
                            >
                                <span className={`mr-1.5 tabular-nums ${current ? 'text-rose-300' : 'text-[#A8998F]'}`}>{String(i + 1).padStart(2, '0')}</span>
                                {section.label}
                            </a>
                        );
                    })}
                </nav>
            </Container>
        </div>
    );
}
