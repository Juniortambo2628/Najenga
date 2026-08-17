import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import DashboardHero from '@/Components/DashboardHero';
import { formatCurrency } from '@/Config/currencies';

function DetailRow({ label, value, mono = false }) {
    return (
        <div className="flex flex-col gap-1">
            <span className="text-[11px] font-bold tracking-widest text-gray-500 uppercase">{label}</span>
            <span className={`text-sm text-white ${mono ? 'font-mono' : ''}`}>{value || '—'}</span>
        </div>
    );
}

export default function Show({ receipt }) {
    const expense = receipt.expense;
    const statusColors = {
        pending: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
        verified: 'bg-green-500/10 text-green-400 border-green-500/20',
        auto_verified: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
        rejected: 'bg-red-500/10 text-red-400 border-red-500/20',
    };

    return (
        <AuthenticatedLayout>
            <Head title={receipt.original_name || 'Receipt'} />

            <div className="max-w-4xl mx-auto">
                <DashboardHero
                    title={receipt.original_name || `Receipt #${receipt.id}`}
                    subtitle={expense ? `Expense: ${expense.title}` : 'Receipt details'}
                    breadcrumbs={[
                        { label: 'Home', href: '/home' },
                        { label: 'Dashboard', href: '/dashboard' },
                        { label: 'Receipts', href: '/receipts' },
                        { label: receipt.original_name || `Receipt #${receipt.id}` },
                    ]}
                    actions={
                        <div className="flex gap-3">
                            <span className={`px-3 py-1.5 rounded-xl text-xs font-bold border ${statusColors[receipt.verification_status] || statusColors.pending}`}>
                                {receipt.verification_status?.replace('_', ' ').toUpperCase() || 'PENDING'}
                            </span>
                            <Link
                                href={route('receipts.edit', receipt.id)}
                                className="px-4 py-2 bg-gradient-to-r from-[rgb(139,0,0)] to-[rgb(220,20,60)] text-white rounded-xl font-semibold hover:opacity-90 transition inline-flex items-center text-sm"
                            >
                                <i className="fas fa-edit mr-2"></i> Edit
                            </Link>
                        </div>
                    }
                />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        <section className="bg-gradient-to-br from-[#1a0508]/80 via-[#120306]/80 to-[#0a0102]/80 backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6">
                            <h3 className="text-lg font-bold text-white mb-4">Receipt Image</h3>
                            {receipt.file_path ? (
                                <div className="rounded-xl overflow-hidden border border-white/10 bg-black/50 flex items-center justify-center min-h-[300px]">
                                    <img
                                        src={`/storage/${receipt.file_path}`}
                                        alt={receipt.original_name}
                                        className="max-w-full max-h-[500px] object-contain"
                                    />
                                </div>
                            ) : (
                                <div className="flex flex-col items-center gap-3 py-12 text-gray-500">
                                    <i className="fas fa-file-image text-3xl text-gray-600"></i>
                                    <p className="text-sm">No receipt image available</p>
                                </div>
                            )}
                        </section>
                    </div>

                    <div className="space-y-8">
                        <section className="bg-gradient-to-br from-[#1a0508]/80 via-[#120306]/80 to-[#0a0102]/80 backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6">
                            <h3 className="text-lg font-bold text-white mb-4">OCR Extracted Data</h3>
                            <div className="grid grid-cols-1 gap-5">
                                <DetailRow label="Merchant" value={receipt.extracted_merchant} />
                                <DetailRow label="Amount" value={receipt.extracted_amount ? formatCurrency(receipt.extracted_amount, expense?.currency) : null} mono />
                                <DetailRow label="Date" value={receipt.extracted_date} mono />
                                <DetailRow label="Receipt ID" value={receipt.extracted_receipt_id} mono />
                                <DetailRow label="OCR Provider" value={receipt.ocr_provider} />
                                <DetailRow label="Confidence" value={receipt.ocr_confidence ? `${(receipt.ocr_confidence * 100).toFixed(0)}%` : null} />
                            </div>
                        </section>

                        <section className="bg-gradient-to-br from-[#1a0508]/80 via-[#120306]/80 to-[#0a0102]/80 backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6">
                            <h3 className="text-lg font-bold text-white mb-4">File Info</h3>
                            <dl className="space-y-4 text-sm">
                                <div className="flex justify-between">
                                    <dt className="text-gray-500">Filename</dt>
                                    <dd className="text-gray-300 font-mono text-xs">{receipt.filename}</dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt className="text-gray-500">Type</dt>
                                    <dd className="text-gray-300">{receipt.mime_type}</dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt className="text-gray-500">Created</dt>
                                    <dd className="text-gray-300">{receipt.created_at ? new Date(receipt.created_at).toLocaleDateString() : '—'}</dd>
                                </div>
                            </dl>
                        </section>

                        <section className="bg-gradient-to-br from-[#1a0508]/80 via-[#120306]/80 to-[#0a0102]/80 backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6">
                            <h3 className="text-lg font-bold text-white mb-4">Actions</h3>
                            <div className="space-y-3">
                                <Link
                                    href={route('receipts.edit', receipt.id)}
                                    className="flex items-center gap-3 p-3 bg-white/5 rounded-xl hover:bg-white/10 transition text-sm text-gray-300"
                                >
                                    <i className="fas fa-edit text-[#DC143C]"></i> Edit Receipt
                                </Link>
                                {expense && (
                                    <Link
                                        href={route('expenses.show', expense.id)}
                                        className="flex items-center gap-3 p-3 bg-white/5 rounded-xl hover:bg-white/10 transition text-sm text-gray-300"
                                    >
                                        <i className="fas fa-receipt text-[#DC143C]"></i> View Expense
                                    </Link>
                                )}
                                <Link
                                    href={route('receipts.index')}
                                    className="flex items-center gap-3 p-3 bg-white/5 rounded-xl hover:bg-white/10 transition text-sm text-gray-300"
                                >
                                    <i className="fas fa-list text-[#DC143C]"></i> Back to Receipts
                                </Link>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
