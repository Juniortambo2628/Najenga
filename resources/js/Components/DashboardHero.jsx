import { Link } from '@inertiajs/react';
import { useEffect } from 'react';
import { usePageHeading } from '@/Layouts/PageHeadingContext';

export default function DashboardHero({ title, subtitle, breadcrumbs = [], actions = null }) {
    const { setHeading } = usePageHeading();

    useEffect(() => {
        setHeading(title);
    }, [title, setHeading]);

    return (
        <div className="mb-6">
            {/* Breadcrumbs */}
            {breadcrumbs.length > 0 && (
                <nav className="flex items-center gap-2 mb-3 text-sm">
                    {breadcrumbs.map((item, index) => (
                        <span key={index} className="flex items-center gap-2">
                            {index > 0 && <i className="fas fa-chevron-right text-gray-600 text-xs"></i>}
                            {item.href ? (
                                <Link href={item.href} className="text-gray-400 hover:text-white transition">
                                    {item.label}
                                </Link>
                            ) : (
                                <span className="text-gray-200">{item.label}</span>
                            )}
                        </span>
                    ))}
                </nav>
            )}
            
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
