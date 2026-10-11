import { Link } from '@inertiajs/react';

export default function Breadcrumb({ items = [] }) {
    if (items.length === 0) return null;

    return (
        <nav className="flex items-center gap-2 mb-3 text-sm">
            {items.map((item, index) => (
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
    );
}
