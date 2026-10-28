import { Link } from '@inertiajs/react';

/**
 * The public pages' building blocks, after Naoa's marketing kit: a page-width
 * container, pill links, eyebrows, chips and the large light section headings.
 */

/** Page-width wrapper shared by every section. */
export function Container({ className = '', children }) {
    return <div className={`mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 ${className}`}>{children}</div>;
}

/** The Najenga wordmark. `light` for use over photos and dark panels. */
export function Logo({ light = false, className = 'h-10' }) {
    return (
        <Link href={route('home')} aria-label="Najenga home" className="inline-flex shrink-0">
            <img src={light ? '/Najenga-logos/Najenga-Logo-trimmed.webp' : '/Najenga-logos/Najenga-Logo-trimmed-dark.webp'} alt="" className={`w-auto ${className}`} />
        </Link>
    );
}

const PILL_VARIANTS = {
    dark: 'bg-[#1A1514] text-white hover:bg-[#3A2F2C] shadow-[0_10px_30px_-12px_rgba(26,21,20,0.6)]',
    brand: 'bg-gradient-to-r from-[#8B0000] to-[#DC143C] text-white hover:opacity-90 shadow-[0_10px_30px_-12px_rgba(139,0,0,0.7)]',
    light: 'bg-white text-[#1A1514] hover:bg-[#F1ECE8] shadow-[0_10px_30px_-12px_rgba(26,21,20,0.35)]',
    outline: 'border border-[#D8CEC7] text-[#3A2F2C] hover:border-[#B3122E] hover:text-[#1A1514]',
    glass: 'border border-white/40 bg-white/10 text-white backdrop-blur hover:bg-white/20',
};

const PILL_SIZES = { sm: 'px-4 py-2 text-xs', md: 'px-6 py-3 text-sm', lg: 'px-7 py-3.5 text-sm sm:text-base' };

/** The rounded call-to-action link. `href` starting with # scrolls the page. */
export function PillLink({ href, variant = 'dark', size = 'md', arrow = false, className = '', children, ...rest }) {
    const classes = `inline-flex items-center justify-center gap-2 rounded-full font-semibold uppercase tracking-[0.08em] transition ${PILL_SIZES[size]} ${PILL_VARIANTS[variant]} ${className}`;
    const body = (
        <>
            {children}
            {arrow && <i aria-hidden="true" className="fas fa-arrow-right text-[0.8em]" />}
        </>
    );
    return href.startsWith('#') ? (
        <a href={href} className={classes} {...rest}>
            {body}
        </a>
    ) : (
        <Link href={href} className={classes} {...rest}>
            {body}
        </Link>
    );
}

/** Small uppercase label above a heading. */
export function Eyebrow({ light = false, className = '', children }) {
    return <p className={`text-[11px] font-semibold uppercase tracking-[0.22em] ${light ? 'text-white/75' : 'text-[#B3122E]'} ${className}`}>{children}</p>;
}

/** Rounded tag chip, as on photo cards. */
export function Chip({ children }) {
    return <span className="inline-flex rounded-full bg-white px-3 py-1 text-[11px] font-semibold text-[#1A1514]">{children}</span>;
}

/** Eyebrow, a large light headline and an optional paragraph. */
export function SectionHeading({ eyebrow, title, text, align = 'center', light = false, as: Tag = 'h2', className = '' }) {
    const centered = align === 'center';
    return (
        <div className={`${centered ? 'mx-auto max-w-3xl text-center' : 'max-w-2xl'} ${className}`}>
            {eyebrow && <Eyebrow light={light}>{eyebrow}</Eyebrow>}
            <Tag className={`mt-3 font-display text-4xl font-light leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl ${light ? 'text-white' : 'text-[#1A1514]'}`}>{title}</Tag>
            {text && <p className={`mt-5 text-base leading-relaxed sm:text-lg ${centered ? 'mx-auto max-w-2xl' : ''} ${light ? 'text-white/80' : 'text-[#5E5450]'}`}>{text}</p>}
        </div>
    );
}

/** A photo filling its parent (which is `relative`), cropped to cover. */
export function Photo({ src, position = 'center', className = '', eager = false }) {
    return (
        <img
            src={src}
            alt=""
            loading={eager ? 'eager' : 'lazy'}
            decoding="async"
            style={{ objectPosition: position }}
            className={`absolute inset-0 h-full w-full object-cover ${className}`}
        />
    );
}

/** A large rounded card with a photo behind its words. A link when given `href`. */
export function ImageCard({ image, title, text, tags = [], href, position, className = 'min-h-[22rem]', titleClass = 'text-2xl sm:text-3xl', children }) {
    const classes = `group relative isolate flex flex-col justify-end overflow-hidden rounded-[1.75rem] p-6 text-white shadow-[0_30px_60px_-35px_rgba(26,21,20,0.7)] sm:p-8 ${className}`;
    const body = (
        <>
            <Photo src={image} position={position} className="-z-10 transition duration-700 group-hover:scale-[1.03]" />
            <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#140F0E]/90 via-[#140F0E]/30 to-transparent" />
            {href && (
                <span aria-hidden="true" className="absolute right-5 top-5 grid h-10 w-10 place-items-center rounded-full bg-white/15 backdrop-blur transition group-hover:bg-white group-hover:text-[#1A1514]">
                    <i className="fas fa-arrow-up-right-from-square text-xs" />
                </span>
            )}
            {tags.length > 0 && <div className="mb-3 flex flex-wrap gap-2">{tags.map((tag) => <Chip key={tag}>{tag}</Chip>)}</div>}
            {title && <h3 className={`font-display font-normal leading-tight tracking-tight text-white ${titleClass}`}>{title}</h3>}
            {text && <p className="mt-2 max-w-md text-sm leading-relaxed text-white/80">{text}</p>}
            {children}
        </>
    );
    if (!href) return <div className={classes}>{body}</div>;
    return href.startsWith('#') ? (
        <a href={href} className={classes}>
            {body}
        </a>
    ) : (
        <Link href={href} className={classes}>
            {body}
        </Link>
    );
}
