import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import DashboardPage from '@/Components/DashboardPage';
import { rootBreadcrumbs } from '@/Config/navigation';
import DetailRow from '@/Components/DetailRow';

function formatFileSize(bytes) {
    if (!bytes) return '—';
    const units = ['B', 'KB', 'MB', 'GB'];
    let i = 0;
    let size = Number(bytes);
    while (size >= 1024 && i < units.length - 1) { size /= 1024; i++; }
    return `${size.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

export default function Show({ document }) {
    const isPdf = document.mime_type === 'application/pdf';
    const isImage = document.mime_type?.startsWith('image/');

    return (
        <AuthenticatedLayout>
            <Head title={document.title} />

            <DashboardPage
                className="max-w-4xl mx-auto"
                hero={{
                    title: document.title,
                    subtitle: document.project?.name || 'Document details',
                    breadcrumbs: [
                        ...rootBreadcrumbs(),
                        { label: 'Documents', href: route('documents') },
                        { label: document.title },
                    ],
                    actions: <Link
                            href={route('documents.edit', document.id)}
                            className="px-4 py-2 bg-gradient-to-r from-[rgb(139,0,0)] to-[rgb(220,20,60)] text-white rounded-xl font-semibold hover:opacity-90 transition inline-flex items-center text-sm"
                        >
                            <i aria-hidden="true" className="fas fa-edit mr-2"></i> Edit
                        </Link>,
                }}
            >
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        <section className="panel p-6">
                            <h3 className="text-lg font-bold text-white mb-4">Preview</h3>
                            {document.file_url ? (
                                <div className="rounded-xl overflow-hidden border border-white/10 bg-black/50 flex items-center justify-center min-h-[300px]">
                                    {isPdf ? (
                                        <iframe src={document.file_url} className="w-full h-[500px]" title={document.title} />
                                    ) : isImage ? (
                                        <img loading="lazy" decoding="async"  src={document.file_url} alt={document.title} className="max-w-full max-h-[500px] object-contain" />
                                    ) : (
                                        <div className="flex flex-col items-center gap-3 py-12">
                                            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
                                                <i aria-hidden="true" className="fas fa-file text-3xl text-white/40"></i>
                                            </div>
                                            <p className="text-gray-400 text-sm">Preview not available for this file type</p>
                                            <a href={document.file_url} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-white/5 border border-white/10 text-white rounded-xl hover:bg-white/10 transition text-sm">
                                                <i aria-hidden="true" className="fas fa-download mr-2"></i>Download
                                            </a>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center gap-3 py-12 text-gray-400">
                                    <i aria-hidden="true" className="fas fa-file text-3xl text-gray-400"></i>
                                    <p className="text-sm">No file attached</p>
                                </div>
                            )}
                        </section>

                        {document.description && (
                            <section className="panel p-6">
                                <h3 className="text-lg font-bold text-white mb-4">Description</h3>
                                <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{document.description}</p>
                            </section>
                        )}
                    </div>

                    <div className="space-y-8">
                        <section className="panel p-6">
                            <h3 className="text-lg font-bold text-white mb-4">Details</h3>
                            <div className="grid grid-cols-1 gap-5">
                                <DetailRow label="Category" value={document.category} />
                                <DetailRow label="File Name" value={document.original_name || document.filename} mono />
                                <DetailRow label="Type" value={document.mime_type} mono />
                                <DetailRow label="Size" value={formatFileSize(document.file_size)} />
                                <DetailRow label="Date" value={document.document_date} mono />
                            </div>
                        </section>

                        <section className="panel p-6">
                            <h3 className="text-lg font-bold text-white mb-4">Actions</h3>
                            <div className="space-y-3">
                                <Link
                                    href={route('documents.edit', document.id)}
                                    className="flex items-center gap-3 p-3 bg-white/5 rounded-xl hover:bg-white/10 transition text-sm text-gray-300"
                                >
                                    <i aria-hidden="true" className="fas fa-edit text-[#DC143C]"></i> Edit Document
                                </Link>
                                {document.file_url && (
                                    <a href={document.file_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 bg-white/5 rounded-xl hover:bg-white/10 transition text-sm text-gray-300">
                                        <i aria-hidden="true" className="fas fa-external-link-alt text-[#DC143C]"></i> Open in New Tab
                                    </a>
                                )}
                                <Link
                                    href={route('documents')}
                                    className="flex items-center gap-3 p-3 bg-white/5 rounded-xl hover:bg-white/10 transition text-sm text-gray-300"
                                >
                                    <i aria-hidden="true" className="fas fa-list text-[#DC143C]"></i> Back to Documents
                                </Link>
                            </div>
                        </section>
                    </div>
                </div>
            </DashboardPage>
        </AuthenticatedLayout>
    );
}
