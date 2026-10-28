import { useState } from 'react';
import { Container, SectionHeading } from './ui';
import { SECTION_OFFSET } from './SectionNav';

/** Questions and answers: a heading on the left, an accordion on the right. */
export default function FaqSection({ id = 'faq', items, title = 'Questions, answered', text }) {
    const [openIndex, setOpenIndex] = useState(0);
    return (
        <section id={id} className={`${SECTION_OFFSET} py-24`}>
            <Container className="grid gap-12 lg:grid-cols-12">
                <div className="lg:col-span-4">
                    <SectionHeading eyebrow="FAQ" title={title} text={text} align="left" className="lg:sticky lg:top-28" />
                </div>
                <div className="space-y-3 lg:col-span-8">
                    {items.map((item, i) => {
                        const open = openIndex === i;
                        return (
                            <div key={item.q} className={`rounded-3xl border transition-colors ${open ? 'border-transparent bg-white shadow-[0_20px_50px_-35px_rgba(26,21,20,0.5)]' : 'border-[#E6DFD9] bg-white/50'}`}>
                                <h3>
                                    <button
                                        type="button"
                                        onClick={() => setOpenIndex(open ? -1 : i)}
                                        aria-expanded={open}
                                        className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left font-medium text-[#1A1514] sm:px-8"
                                    >
                                        {item.q}
                                        <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full transition-all ${open ? 'rotate-45 bg-[#1A1514] text-white' : 'bg-[#F1ECE8] text-[#B3122E]'}`}>
                                            <i aria-hidden="true" className="fas fa-plus text-xs" />
                                        </span>
                                    </button>
                                </h3>
                                {open && <p className="px-6 pb-6 text-sm leading-relaxed text-[#5E5450] sm:px-8">{item.a}</p>}
                            </div>
                        );
                    })}
                </div>
            </Container>
        </section>
    );
}
