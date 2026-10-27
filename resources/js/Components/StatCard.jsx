export default function StatCard({ icon, label, value, trend }) {
    const trendIsPositive = trend > 0;
    const trendIsNegative = trend < 0;
    const trendColor = trendIsPositive ? 'text-emerald-300' : trendIsNegative ? 'text-rose-300' : 'text-white/50';
    const trendIcon = trendIsPositive ? 'fa-arrow-trend-up' : trendIsNegative ? 'fa-arrow-trend-down' : 'fa-minus';

    return (
        <div className="panel p-5 sm:p-6">
            <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                    <p className="mb-2 text-sm text-white/50">{label}</p>
                    <p className="truncate text-2xl font-semibold tracking-tight text-white sm:text-3xl">{value}</p>
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
        </div>
    );
}
