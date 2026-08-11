import { Link } from '@inertiajs/react';

export default function Breadcrumb({ items = [] }) {
    return (
        <div className="flex items-center gap-3 mb-6">
            {items.map((item, index) => (
                <span key={index} className="flex items-center gap-3">
                    {index > 0 && <span className="text-gray-600">/</span>}
                    {item.href ? (
                        <Link href={item.href} className="text-gray-400 hover:text-white transition">
                            {item.label}
                        </Link>
                    ) : (
                        <span className="text-gray-200">{item.label}</span>
                    )}
                </span>
            ))}
        </div>
    );
}
