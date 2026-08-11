import { Link } from '@inertiajs/react';

const variants = {
    primary:
        'inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[rgb(139,0,0)] to-[rgb(220,20,60)] px-5 py-2.5 text-sm font-semibold text-white transition-all hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[#8B0000] focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed',
    secondary:
        'inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-semibold text-gray-300 transition-all hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/20 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed',
    danger:
        'inline-flex items-center gap-2 rounded-xl bg-red-600/90 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed',
    ghost:
        'inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-gray-400 transition-all hover:text-white hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-white/20 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed',
};

export default function Button({
    variant = 'primary',
    as = 'button',
    href,
    type = 'button',
    className = '',
    disabled,
    children,
    ...props
}) {
    const classes = `${variants[variant] || variants.primary} ${className}`.trim();

    if (as === 'link' && href) {
        return (
            <Link href={href} className={classes} {...props}>
                {children}
            </Link>
        );
    }

    return (
        <button
            type={type}
            className={classes}
            disabled={disabled}
            {...props}
        >
            {children}
        </button>
    );
}
