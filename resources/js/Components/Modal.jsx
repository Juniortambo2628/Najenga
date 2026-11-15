import { useState, useEffect } from 'react';
import { Modal as KitModal } from '@okjt/ui';

// Najenga's width names, as the widths they have always been.
const WIDTHS = { sm: 'sm', md: 'md', lg: 'lg', xl: 'xl', '2xl': '2xl', '3xl': '4xl', '4xl': '5xl', '7xl': '7xl' };

function CloseButton({ onClick, className = '' }) {
    return (
        <button type="button" onClick={onClick} aria-label="Close" className={`rounded-lg p-2 text-gray-400 transition hover:bg-white/10 hover:text-white ${className}`}>
            <i aria-hidden="true" className="fas fa-times text-sm"></i>
        </button>
    );
}

/**
 * The kit's Modal (overlay, Escape, focus kept inside) in Najenga's dark
 * panel, with its own close button. With `tabs`, a two-column dialog: the
 * title and the tabs on the left, the open tab on the right.
 *
 * @param {boolean} show - Open (or `isOpen`)
 * @param {'sm'|'md'|'lg'|'xl'|'2xl'|'3xl'|'4xl'|'7xl'} [maxWidth]
 * @param {boolean} [closeable=true] - False: Escape, the backdrop and the close button do nothing
 * @param {Array} [tabs] - [{ label, icon, content }]
 * @param {string} [title], [subtitle] - Shown above the tabs; the title also names the dialog
 * @param {ReactNode} [footer] - Under a simple (tabless) dialog's content
 */
export default function Modal({ children, show, isOpen, maxWidth = '2xl', closeable = true, onClose = () => {}, tabs, title, subtitle, footer }) {
    const visible = show ?? isOpen ?? false;
    const [activeTab, setActiveTab] = useState(0);
    const close = () => {
        if (closeable) onClose();
    };

    // Reset tab when modal closes
    useEffect(() => {
        if (!visible) setActiveTab(0);
    }, [visible]);

    const hasTabs = tabs && tabs.length > 0;
    const panel = hasTabs
        ? 'bg-gradient-to-br from-[#1a0508]/95 via-[#120306]/95 to-[#0a0102]/95 backdrop-blur-xl border border-white/[0.06]'
        : 'bg-surface-overlay border border-white/[0.08]';

    return (
        <KitModal open={visible} onClose={onClose} closeable={closeable} maxWidth={WIDTHS[maxWidth] || '2xl'} label={title} showClose={false} className={`shadow-2xl ${panel}`}>
            {hasTabs ? (
                <div className="flex min-h-[520px] max-h-[88vh]">
                    {/* Left Column - Tabs */}
                    <div className="w-64 flex-shrink-0 border-r border-white/[0.06] flex flex-col overflow-y-auto custom-scrollbar">
                        {title && (
                            <div className="px-6 pt-7 pb-5">
                                {subtitle && <p className="text-[11px] font-bold text-[#DC143C] capitalize mb-1.5">{subtitle}</p>}
                                <h3 className="text-lg font-bold text-white leading-tight">{title}</h3>
                            </div>
                        )}
                        <nav className="flex-1 px-4 pb-5 space-y-1" aria-label={title ? `${title} sections` : 'Sections'}>
                            {tabs.map((tab, idx) => (
                                <button
                                    key={idx}
                                    type="button"
                                    onClick={() => setActiveTab(idx)}
                                    aria-current={activeTab === idx ? 'true' : undefined}
                                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                                        activeTab === idx ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                                    }`}
                                >
                                    {tab.icon && <i aria-hidden="true" className={`fas ${tab.icon} w-5 text-center text-xs`}></i>}
                                    {tab.label}
                                </button>
                            ))}
                        </nav>
                    </div>

                    {/* Right Column - Content */}
                    <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                        {closeable && (
                            <div className="flex justify-end p-5 pb-0 flex-shrink-0">
                                <CloseButton onClick={close} />
                            </div>
                        )}
                        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">{tabs[activeTab]?.content}</div>
                    </div>
                </div>
            ) : (
                /* Simple modal (no tabs) */
                <>
                    <div className="relative">
                        {closeable && <CloseButton onClick={close} className="absolute top-4 right-4 z-10" />}
                        {children}
                    </div>
                    {footer && <div className="border-t border-white/10">{footer}</div>}
                </>
            )}
        </KitModal>
    );
}
