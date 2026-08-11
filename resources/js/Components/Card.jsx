import React from 'react';

const variants = {
    default: 'bg-black/50 border border-white/10 rounded-2xl p-6 backdrop-blur-sm',
    glass: 'bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-lg',
    elevated: 'bg-gray-900/50 border border-white/10 rounded-2xl p-6',
    flat: 'bg-black/50 border border-white/10 rounded-2xl p-6',
};

export default function Card({ children, className = '', variant = 'default', noPadding = false }) {
    const base = variants[variant] || variants.default;
    const padding = noPadding ? 'p-0' : '';

    return (
        <div className={`${base} ${padding} ${className}`}>
            {children}
        </div>
    );
}
