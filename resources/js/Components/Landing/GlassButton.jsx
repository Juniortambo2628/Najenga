import { Link } from '@inertiajs/react';

export default function GlassButton({ href, children, variant = 'primary', icon, className = '' }) {
    const variants = {
        primary: 'bg-white text-[rgb(139,0,0)] hover:shadow-2xl',
        secondary: 'border-2 border-white text-white hover:bg-white/10',
        ghost: 'bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20',
        brand: 'bg-gradient-to-br from-[rgb(139,0,0)] to-[rgb(220,20,60)] text-white hover:shadow-lg',
    };

    const classes = `inline-flex items-center gap-2 px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 shadow-xl ${variants[variant]} ${className}`;

    if (href) {
        return (
            <Link href={href} className={classes}>
                {icon && <i className={`fas fa-${icon}`}></i>}
                {children}
            </Link>
        );
    }

    return (
        <button className={classes}>
            {icon && <i className={`fas fa-${icon}`}></i>}
            {children}
        </button>
    );
}
