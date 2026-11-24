export default function DetailRow({ label, value, mono = false }) {
    return (
        <div className="flex flex-col gap-1 min-w-0">
            <span className="text-[11px] font-bold text-gray-500 capitalize">{label}</span>
            <span className={`text-sm text-white break-words ${mono ? 'font-mono' : ''}`}>{value || '-'}</span>
        </div>
    );
}
