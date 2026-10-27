/**
 * One summary figure. With `onClick` the card is a button (e.g. it applies a
 * filter) and `active` marks it pressed (its filter is applied).
 */
export default function StatCard({ icon, label, value, trend, hint, onClick, active = false }) {
    const trendIsPositive = trend > 0;
    const trendIsNegative = trend < 0;
    const trendColor = trendIsPositive ? 'text-emerald-300' : trendIsNegative ? 'text-rose-300' : 'text-white/50';
    const trendIcon = trendIsPositive ? 'fa-arrow-trend-up' : trendIsNegative ? 'fa-arrow-trend-down' : 'fa-minus';

    const Tag = onClick ? 'button' : 'div';
    const interactive = onClick ? 'w-full text-left transition hover:border-rose-300/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400/60' : '';
    const pressed = active ? 'border-rose-400/50 ring-1 ring-rose-400/40' : '';

    return (
        <Tag
            type={onClick ? 'button' : undefined}
            onClick={onClick}
            aria-pressed={onClick ? active : undefined}
            className={`panel block p-5 sm:p-6 ${interactive} ${pressed}`}
        >
            <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                    <p className="mb-2 text-sm text-white/50">{label}</p>
                    <p className="truncate text-2xl font-semibold tracking-tight text-white sm:text-3xl">{value}</p>
                    {hint && <p className="mt-1 truncate text-xs text-white/40" title={hint}>{hint}</p>}
                    {trend !== undefined && trend !== null && (
                        <div className="mt-3 flex items-center gap-1.5">
                            <i aria-hidden="true" className={`fas ${trendIcon} ${trendColor} text-[10px]`} />
                            <span className={`text-xs font-medium ${trendColor}`}>{Math.abs(trend)}%</span>
                            <span className="text-xs text-white/35">vs. last month</span>
                        </div>
                    )}
                </div>
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-rose-200/10 bg-rose-950/50">
                    <i aria-hidden="true" className={`fas ${icon} text-base text-rose-200`} />
                </div>
            </div>
        </Tag>
    );
}
