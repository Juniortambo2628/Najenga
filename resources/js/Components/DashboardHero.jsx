import { useEffect, useRef, useState } from 'react';
import { usePageHeading } from '@/Layouts/PageHeadingContext';
import Breadcrumb from '@/Components/Breadcrumb';

// Height of the sticky navbar: the hero counts as hidden once it is fully
// behind it.
const HEADER_OFFSET = 64;

/** Whether `ref` is visible below the sticky navbar (true where it can't tell). */
function useVisibleBelowHeader(ref) {
    const [visible, setVisible] = useState(true);
    useEffect(() => {
        const el = ref.current;
        if (!el || typeof IntersectionObserver === 'undefined') return undefined;
        const observer = new IntersectionObserver(
            ([entry]) => setVisible(entry.isIntersecting),
            { rootMargin: `-${HEADER_OFFSET}px 0px 0px 0px`, threshold: 0 },
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, [ref]);
    return visible;
}

export default function DashboardHero({ title, subtitle, breadcrumbs = [], actions = null }) {
    const { setHeading, reportHero } = usePageHeading();
    const heroRef = useRef(null);
    const visible = useVisibleBelowHeader(heroRef);
    const parent = breadcrumbs.length > 1 ? breadcrumbs[breadcrumbs.length - 2] : null;

    useEffect(() => {
        setHeading(title);
    }, [title, setHeading]);

    useEffect(() => {
        reportHero?.({ visible, parent: parent ? { label: parent.label, href: parent.href } : null });
    }, [visible, parent?.label, parent?.href, reportHero]);

    return (
        <div className="mb-6" ref={heroRef}>
            <Breadcrumb items={breadcrumbs} />

            {/* Title */}
            <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-white">{title}</h1>
                    {subtitle && <p className="text-gray-400 mt-1 text-sm md:text-base">{subtitle}</p>}
                </div>
                {actions && (
                    <div className="flex items-center gap-2 flex-wrap">{actions}</div>
                )}
            </div>
        </div>
    );
}
