import React from 'react';

export default function EmptyState({ icon = 'fa-folder', title, message, action }) {
    return (
        <div className="bg-black/50 border border-white/10 rounded-2xl p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/5 mb-4">
                <i className={`fas ${icon} text-2xl text-gray-400`}></i>
            </div>
            <h3 className="text-white text-lg font-semibold mb-2">{title}</h3>
            <p className="text-gray-400 text-sm mb-6 max-w-md mx-auto">{message}</p>
            {action && (
                <button
                    onClick={action.onClick}
                    className="px-5 py-2.5 bg-[#8B0000] hover:bg-[#a50000] text-white rounded-xl text-sm font-medium transition-colors"
                >
                    {action.label}
                </button>
            )}
        </div>
    );
}
