import { motion } from 'framer-motion';
import { Container, Eyebrow, Photo } from './ui';

/**
 * A full-bleed photo hero with a large light headline, after Naoa's.
 * `children` sit under the text (the calls to action); `after` overlaps the
 * hero's bottom edge (a panel of cards, the journeys' numbers).
 */
export default function PhotoHero({ image, position = 'center', eyebrow, title, text, after, children }) {
    return (
        <section className="relative">
            <div className={`relative isolate flex min-h-[100svh] flex-col justify-center overflow-hidden pt-32 text-white ${after ? 'pb-56 sm:pb-64' : 'pb-24'}`}>
                <Photo src={image} position={position} eager className="-z-20" />
                <div className="absolute inset-0 -z-10 bg-gradient-to-b from-[#140F0E]/75 via-[#140F0E]/45 to-[#140F0E]/70" />
                <Container>
                    <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="mx-auto max-w-5xl text-center">
                        {eyebrow && <Eyebrow light>{eyebrow}</Eyebrow>}
                        <h1 className="mt-5 font-display text-[2.75rem] font-extralight leading-[1.02] tracking-tight text-white sm:text-7xl lg:text-[6.25rem]">{title}</h1>
                        {text && <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-white/85 sm:text-lg">{text}</p>}
                        {children && <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">{children}</div>}
                    </motion.div>
                </Container>
            </div>
            {after && <Container className="relative z-10 -mt-44 sm:-mt-52">{after}</Container>}
        </section>
    );
}
