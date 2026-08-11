import React from 'react';
import ViewModeToggle from './ViewModeToggle';

export default function SearchFilterBar({
    searchValue = '',
    onSearchChange,
    filters = [],
    viewMode,
    onViewModeChange,
    viewModeOptions = [],
}) {
    return (
        <div className="bg-black/50 border border-white/10 rounded-2xl p-4 mb-6 backdrop-blur-sm">
            <div className="flex flex-wrap items-center gap-4">
                <div className="relative flex-1 min-w-[240px]">
                    <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
                    <input
                        type="text"
                        value={searchValue}
                        onChange={(e) => onSearchChange(e.target.value)}
                        placeholder="Search..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-[#8B0000]/50 focus:ring-1 focus:ring-[#8B0000]/30 transition-colors"
                    />
                </div>

                {filters.map((filter) => (
                    <select
                        key={filter.name}
                        value={filter.value}
                        onChange={(e) => filter.onChange(e.target.value)}
                        className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#8B0000]/50 focus:ring-1 focus:ring-[#8B0000]/30 transition-colors cursor-pointer appearance-none"
                        style={{
                            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239CA3AF'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
                            backgroundRepeat: 'no-repeat',
                            backgroundPosition: 'right 0.75rem center',
                            backgroundSize: '1rem',
                            paddingRight: '2.5rem',
                        }}
                    >
                        <option value="" className="bg-gray-900 text-white">{filter.label}</option>
                        {filter.options.map((opt) => (
                            <option key={opt.value} value={opt.value} className="bg-gray-900 text-white">
                                {opt.label}
                            </option>
                        ))}
                    </select>
                ))}

                {viewModeOptions.length > 0 && (
                    <ViewModeToggle
                        modes={viewModeOptions}
                        current={viewMode}
                        onChange={onViewModeChange}
                    />
                )}
            </div>
        </div>
    );
}
