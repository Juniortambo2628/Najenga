export default function PhotoCard({ photo, selected, onToggle, onContextMenu, onPreview }) {
    return (
        <div
            className={`relative aspect-square rounded-xl overflow-hidden bg-gray-800 group cursor-pointer transition-all duration-200 ${
                selected ? 'ring-2 ring-[#DC143C] ring-offset-2 ring-offset-black' : 'hover:ring-1 hover:ring-white/20'
            }`}
            onClick={(e) => onToggle(e.metaKey || e.ctrlKey)}
            onContextMenu={onContextMenu}
            onDoubleClick={onPreview}
        >
            <img
                src={photo.thumb_url || `/storage/${photo.file_path}`}
                alt={photo.title}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
            />

            {/* Selection indicator */}
            <div className={`absolute top-2 left-2 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                selected
                    ? 'bg-[#DC143C] border-[#DC143C]'
                    : 'border-white/40 bg-black/30 opacity-0 group-hover:opacity-100'
            }`}>
                {selected && <i className="fas fa-check text-white text-[10px]"></i>}
            </div>

            {/* Hover overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <div className="absolute bottom-0 left-0 right-0 p-3">
                    <p className="text-white text-sm font-medium truncate">{photo.title}</p>
                    {photo.project_name && (
                        <p className="text-gray-300 text-xs truncate">{photo.project_name}</p>
                    )}
                </div>
            </div>

            {/* Preview button */}
            <button
                onClick={(e) => { e.stopPropagation(); onPreview(); }}
                className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/50 backdrop-blur-sm text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
            >
                <i className="fas fa-expand text-xs"></i>
            </button>
        </div>
    );
}
