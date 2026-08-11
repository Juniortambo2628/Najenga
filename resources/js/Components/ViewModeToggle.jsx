import React from 'react';

export default function ViewModeToggle({ modes = [], current, onChange }) {
    return (
        <div className="bg-black/50 border border-white/10 rounded-xl p-1 flex gap-1">
            {modes.map((mode) => (
                <button
                    key={mode.value}
                    onClick={() => onChange(mode.value)}
                    className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                        current === mode.value
                            ? 'bg-[#8B0000] text-white'
                            : 'text-gray-400 hover:text-white'
                    }`}
                >
                    <i className={`fas ${mode.icon}`}></i>
                </button>
            ))}
        </div>
    );
}
