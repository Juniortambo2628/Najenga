import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

export default function ContextMenu({ options, position, onClose }) {
    const menuRef = useRef(null);
    const [style, setStyle] = useState({ top: position.y, left: position.x });

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                onClose();
            }
        };

        const adjustPosition = () => {
            if (menuRef.current) {
                const rect = menuRef.current.getBoundingClientRect();
                const viewportWidth = window.innerWidth;
                const viewportHeight = window.innerHeight;

                let newTop = position.y;
                let newLeft = position.x;

                // Check right edge
                if (position.x + rect.width > viewportWidth) {
                    newLeft = viewportWidth - rect.width - 10;
                }

                // Check bottom edge
                if (position.y + rect.height > viewportHeight) {
                    newTop = position.y - rect.height;
                }

                setStyle({ top: newTop, left: newLeft });
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('scroll', onClose);
        window.addEventListener('resize', onClose);
        
        // Initial adjustment
        adjustPosition();

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('scroll', onClose);
            window.removeEventListener('resize', onClose);
        };
    }, [onClose, position]);

    return createPortal(
        <div 
            ref={menuRef}
            className="fixed z-50 bg-black border border-white/20 rounded-lg shadow-xl py-2 w-48 overflow-hidden backdrop-blur-md"
            style={style}
        >
            {options.map((option, index) => (
                <button
                    key={index}
                    onClick={(e) => {
                        e.stopPropagation();
                        option.action();
                        onClose();
                    }}
                    className={`w-full text-left px-4 py-2 text-sm flex items-center gap-3 transition
                        ${option.danger 
                            ? 'text-red-400 hover:bg-red-500/10' 
                            : 'text-gray-200 hover:bg-white/10'
                        }
                    `}
                >
                    {option.icon && <i className={`fas ${option.icon} w-5 text-center`}></i>}
                    {option.label}
                </button>
            ))}
        </div>,
        document.body
    );
}
