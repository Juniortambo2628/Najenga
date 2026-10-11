import { useEffect } from 'react';
import { usePageHeading } from '@/Layouts/PageHeadingContext';
import Breadcrumb from '@/Components/Breadcrumb';

export default function DashboardHero({ title, subtitle, breadcrumbs = [], actions = null }) {
    const { setHeading } = usePageHeading();

    useEffect(() => {
        setHeading(title);
    }, [title, setHeading]);

    return (
        <div className="mb-6">
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
