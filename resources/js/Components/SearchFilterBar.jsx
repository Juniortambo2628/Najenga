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
        <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-[240px]">
                <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
                <input
                    type="text"
                    value={searchValue}
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder="Search..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-2.5 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-[#8B0000]/50 focus:ring-1 focus:ring-[#8B0000]/30 transition-colors"
                />
            </div>

            {filters.map((filter) => (
                <select
                    key={filter.name}
                    value={filter.value}
                    onChange={(e) => filter.onChange(e.target.value)}
                    className="select-chevron bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#8B0000]/50 focus:ring-1 focus:ring-[#8B0000]/30 transition-colors cursor-pointer appearance-none"
                >
                    <option value="">{filter.label}</option>
                    {filter.options.map((opt) => (
                        <option key={opt.value} value={opt.value}>
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
    );
}
