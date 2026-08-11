import Modal from '@/Components/Modal';

export default function PreviewModal({ isOpen, onClose, title, children, footer }) {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            maxWidth="7xl"
            closeable={true}
            title={title}
            footer={footer}
        >
            <div className="flex flex-col h-[85vh]">
                {title && (
                    <div className="flex justify-between items-center p-4 border-b border-white/10 bg-black/20">
                        <h3 className="text-xl font-semibold text-white">{title}</h3>
                    </div>
                )}
                <div className="flex-1 overflow-hidden bg-black/40 flex flex-col">
                    {children}
                </div>
            </div>
        </Modal>
    );
}
