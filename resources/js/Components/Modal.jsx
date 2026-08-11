import {
    Dialog,
    DialogPanel,
    Transition,
    TransitionChild,
} from '@headlessui/react';
import { useState, useEffect } from 'react';

export default function Modal({
    children,
    show,
    isOpen,
    maxWidth = '2xl',
    closeable = true,
    onClose = () => {},
    tabs,
    title,
    subtitle,
    footer,
}) {
    const visible = show ?? isOpen ?? false;
    const [activeTab, setActiveTab] = useState(0);
    const close = () => {
        if (closeable) {
            onClose();
        }
    };

    // Reset tab when modal closes
    useEffect(() => {
        if (!visible) setActiveTab(0);
    }, [visible]);

    const maxWidthClass = {
        sm: 'sm:max-w-sm',
        md: 'sm:max-w-md',
        lg: 'sm:max-w-lg',
        xl: 'sm:max-w-xl',
        '2xl': 'sm:max-w-2xl',
        '3xl': 'sm:max-w-4xl',
        '4xl': 'sm:max-w-5xl',
        '7xl': 'sm:max-w-7xl',
    }[maxWidth];

    const hasTabs = tabs && tabs.length > 0;

    return (
        <Transition show={visible} leave="duration-200">
            <Dialog
                as="div"
                id="modal"
                className="fixed inset-0 z-50 flex transform items-center overflow-y-auto px-4 py-6 transition-all sm:px-0"
                onClose={close}
            >
                <TransitionChild
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
                </TransitionChild>

                <TransitionChild
                    enter="ease-out duration-300"
                    enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                    enterTo="opacity-100 translate-y-0 sm:scale-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                    leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                >
                    <DialogPanel
                        className={`mb-6 transform overflow-hidden rounded-2xl shadow-2xl transition-all sm:mx-auto sm:w-full ${maxWidthClass} ${
                            hasTabs
                                ? 'bg-gradient-to-br from-[#1a0508]/95 via-[#120306]/95 to-[#0a0102]/95 backdrop-blur-xl border border-white/[0.06]'
                                : 'bg-gray-900 border border-white/10'
                        }`}
                    >
                        {hasTabs ? (
                            <div className="flex min-h-[520px] max-h-[90vh]">
                                {/* Left Column - Tabs */}
                                <div className="w-64 flex-shrink-0 border-r border-white/[0.06] flex flex-col overflow-y-auto custom-scrollbar">
                                    {title && (
                                        <div className="px-6 pt-7 pb-5">
                                            {subtitle && (
                                                <p className="text-[11px] font-bold tracking-widest text-[#DC143C] uppercase mb-1.5">{subtitle}</p>
                                            )}
                                            <h3 className="text-lg font-bold text-white leading-tight">{title}</h3>
                                        </div>
                                    )}
                                    <nav className="flex-1 px-4 pb-5 space-y-1">
                                        {tabs.map((tab, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => setActiveTab(idx)}
                                                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                                                    activeTab === idx
                                                        ? 'bg-white/10 text-white'
                                                        : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                                                }`}
                                            >
                                                {tab.icon && <i className={`fas ${tab.icon} w-5 text-center text-xs`}></i>}
                                                {tab.label}
                                            </button>
                                        ))}
                                    </nav>
                                </div>

                                {/* Right Column - Content */}
                                <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                                    {/* Close button */}
                                    {closeable && (
                                        <div className="flex justify-end p-5 pb-0 flex-shrink-0">
                                            <button
                                                onClick={close}
                                                className="p-2 rounded-lg text-gray-500 hover:text-white hover:bg-white/10 transition"
                                            >
                                                <i className="fas fa-times text-sm"></i>
                                            </button>
                                        </div>
                                    )}
                                    {/* Tab Content */}
                                    <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                                        {tabs[activeTab]?.content}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            /* Simple modal (no tabs) */
                            <>
                                <div className="relative">
                                    {closeable && (
                                        <button
                                            onClick={close}
                                            className="absolute top-4 right-4 z-10 p-2 rounded-lg text-gray-500 hover:text-white hover:bg-white/10 transition"
                                        >
                                            <i className="fas fa-times text-sm"></i>
                                        </button>
                                    )}
                                    {children}
                                </div>
                                {footer && (
                                    <div className="border-t border-white/10">
                                        {footer}
                                    </div>
                                )}
                            </>
                        )}
                    </DialogPanel>
                </TransitionChild>
            </Dialog>
        </Transition>
    );
}
