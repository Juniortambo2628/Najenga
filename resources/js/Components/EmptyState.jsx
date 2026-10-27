export default function EmptyState({ icon = 'fa-folder', title, message, action, compact = false }) {
    return (
        <div className={`rounded-2xl border text-center ${compact ? 'border-transparent bg-transparent px-3 py-8' : 'border-white/10 bg-black/50 p-12'}`}>
            <div className={`inline-flex items-center justify-center rounded-full bg-white/5 ${compact ? 'mb-3 h-12 w-12' : 'mb-4 h-16 w-16'}`}>
                <i aria-hidden="true" className={`fas ${icon} ${compact ? 'text-xl' : 'text-2xl'} text-gray-400`} />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-white">{title}</h3>
            <p className="mx-auto mb-6 max-w-md text-sm text-gray-400">{message}</p>
            {action && (
                <button
                    onClick={action.onClick}
                    className="rounded-xl bg-[#8B0000] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#a50000]"
                >
                    {action.label}
                </button>
            )}
        </div>
    );
}
