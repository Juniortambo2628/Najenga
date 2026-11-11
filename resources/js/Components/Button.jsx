import { Link } from '@inertiajs/react';
import { Button as KitButton } from '@okjt/ui';

/*
 * Najenga's names for the kit's button variants. The kit calls its accent
 * button "secondary" and its plain one "primary"; Najenga's pages say
 * primary for the accent (the main action) and secondary for the plain one.
 */
const VARIANTS = {
    primary: { variant: 'secondary' },
    secondary: { variant: 'primary' },
    danger: { variant: 'danger' },
    ghost: { variant: 'primary', className: '!border-transparent !bg-transparent hover:!bg-white/5' },
};

/**
 * The kit's Button in Najenga's variant names. `as="link"` with `href`
 * renders the app's Link. Everything else (loading, icon, size, edit,
 * action) is the kit's.
 *
 * @param {'primary'|'secondary'|'danger'|'ghost'} [variant]
 */
export default function Button({ variant = 'primary', as, href, className = '', ...props }) {
    const kit = VARIANTS[variant] || VARIANTS.primary;
    const classes = [kit.className, className].filter(Boolean).join(' ');
    const linkProps = as === 'link' && href ? { as: Link, href } : {};

    return <KitButton {...props} {...linkProps} variant={kit.variant} className={classes} />;
}
