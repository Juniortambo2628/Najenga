import React from 'react';

/**
 * PageHeader Component
 * 
 * A standardized header for all pages following the construction-dark aesthetic.
 * 
 * @param {string} title - The page title
 * @param {string} subtitle - The page description/subtitle
 * @param {React.ReactNode} actions - Action buttons to be displayed on the right
 * @param {string} className - Additional CSS classes
 */
export default function PageHeader({ title, subtitle, actions, className = '' }) {
    return (
        <div className={`flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 ${className}`}>
            <div>
                <h1 className="text-3xl font-bold text-white">{title}</h1>
                {subtitle && <p className="text-gray-400 mt-1">{subtitle}</p>}
            </div>
            {actions && (
                <div className="flex flex-wrap gap-3">
                    {actions}
                </div>
            )}
        </div>
    );
}
