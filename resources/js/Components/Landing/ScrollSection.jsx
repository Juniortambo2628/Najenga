import { useRef } from 'react';
import { motion } from 'framer-motion';
import ScrollCard from './ScrollCard';

export default function ScrollSection({ id, title, description, buttonText, buttonHref, cards, className = '', reverse = false }) {
    const scrollRef = useRef(null);

    const scroll = (direction) => {
        if (!scrollRef.current) return;
        const amount = 380;
        scrollRef.current.scrollBy({
            left: direction === 'left' ? -amount : amount,
            behavior: 'smooth',
        });
    };

    return (
        <section id={id} className={`landing-section bg-black ${className}`}>
            <div className="w-full px-8 md:px-16 lg:px-24">
                <div className={`flex flex-col ${reverse ? 'md:flex-row-reverse' : 'md:flex-row'} gap-12 lg:gap-16 items-center`}>
                    {/* Text Content */}
                    <motion.div
                        className="w-full md:w-[35%] lg:w-[30%] flex-shrink-0"
                        initial={{ opacity: 0, x: reverse ? 40 : -40 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: '-100px' }}
                        transition={{ duration: 0.6, ease: 'easeOut' }}
                    >
                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6 uppercase">
                            {title}
                        </h2>
                        {description && (
                            <p className="text-lg text-gray-400 mb-8 leading-relaxed">
                                {description}
                            </p>
                        )}
                        {buttonText && (
                            <a
                                href={buttonHref || '#'}
                                className="landing-cta-primary"
                            >
                                {buttonText}
                            </a>
                        )}
                    </motion.div>

                    {/* Horizontally Scrollable Cards */}
                    <div className="w-full md:w-[65%] lg:w-[70%] relative">
                        {/* Scroll Arrows */}
                        <div className="hidden md:flex absolute -left-4 top-1/2 -translate-y-1/2 z-10">
                            <button
                                onClick={() => scroll('left')}
                                className="landing-scroll-arrow"
                                aria-label="Scroll left"
                            >
                                <i className="fas fa-chevron-left text-sm"></i>
                            </button>
                        </div>
                        <div className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 z-10">
                            <button
                                onClick={() => scroll('right')}
                                className="landing-scroll-arrow"
                                aria-label="Scroll right"
                            >
                                <i className="fas fa-chevron-right text-sm"></i>
                            </button>
                        </div>

                        <div
                            ref={scrollRef}
                            className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide"
                        >
                            {cards.map((card, idx) => (
                                <div key={idx} className="snap-start">
                                    <ScrollCard {...card} />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
