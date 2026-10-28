export default function DetailRow({ label, value, mono = false }) {
    return (
        <div className="flex flex-col gap-1">
            <span className="text-[11px] font-bold text-gray-500 capitalize">{label}</span>
            <span className={`text-sm text-white ${mono ? 'font-mono' : ''}`}>{value || '-'}</span>
        </div>
    );
}
