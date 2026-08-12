import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import Breadcrumb from '@/Components/Breadcrumb';
import { formatCurrency } from '@/Config/currencies';
import { PAYMENT_LABELS } from '@/Config/expenses';
import { useState } from 'react';
import toast from 'react-hot-toast';
import axios from 'axios';
import { useDropzone } from 'react-dropzone';

function DetailRow({ label, value, mono = false }) {
    return (
        <div className="flex flex-col gap-1">
            <span className="text-[11px] font-bold tracking-widest text-gray-500 uppercase">{label}</span>
            <span className={`text-sm text-white ${mono ? 'font-mono' : ''}`}>{value || '—'}</span>
        </div>
    );
}

function ReceiptSection({ expense, onUpdate }) {
    const [uploading, setUploading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState(expense?.receipt_url || null);

    const onDrop = async (acceptedFiles) => {
        if (acceptedFiles.length === 0) return;
        const file = acceptedFiles[0];
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('receipt', file);
            const res = await axios.post(`/expenses/${expense.id}/receipt`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            if (res.data.success) {
                setPreviewUrl(res.data.receipt_url);
                toast.success('Receipt uploaded');
                if (onUpdate) onUpdate();
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Upload failed');
        }
        setUploading(false);
    };

    const handleRemove = async () => {
        if (!confirm('Remove this receipt?')) return;
        try {
            await axios.delete(`/expenses/${expense.id}/receipt`);
            setPreviewUrl(null);
            toast.success('Receipt removed');
            if (onUpdate) onUpdate();
        } catch {
            toast.error('Failed to remove receipt');
        }
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.webp'], 'application/pdf': ['.pdf'] },
        maxFiles: 1,
    });

    if (previewUrl) {
        return (
            <div className="space-y-4">
                <div className="rounded-xl overflow-hidden border border-white/10 bg-black/50 flex items-center justify-center min-h-[300px]">
                    {previewUrl.endsWith('.pdf') ? (
                        <iframe src={previewUrl} className="w-full h-[400px]" title="Receipt" />
                    ) : (
                        <img src={previewUrl} alt="Receipt" className="max-w-full max-h-[400px] object-contain" />
                    )}
                </div>
                <div className="flex justify-end gap-2">
                    <button onClick={handleRemove} className="px-4 py-2 text-xs text-red-400 border border-red-500/20 rounded-xl hover:bg-red-500/10 transition">
                        <i className="fas fa-trash mr-1"></i>Remove
                    </button>
                    <label className="px-4 py-2 text-xs text-white bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition cursor-pointer">
                        <i className="fas fa-exchange-alt mr-1"></i>Replace
                        <input type="file" accept="image/*,.pdf" className="hidden" onChange={(e) => { if (e.target.files?.[0]) onDrop([e.target.files[0]]); e.target.value = ''; }} />
                    </label>
                </div>
            </div>
        );
    }

    return (
        <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors duration-300 ${isDragActive ? 'border-[#8B0000] bg-[#8B0000]/10' : 'border-white/20 hover:border-[#8B0000]/50 hover:bg-white/5'}`}
        >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center gap-3">
                <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center">
                    <i className={`fas ${uploading ? 'fa-spinner fa-spin' : 'fa-cloud-upload-alt'} text-2xl text-white/40`}></i>
                </div>
                <p className="text-white font-medium">
                    {uploading ? 'Uploading...' : isDragActive ? 'Drop receipt here...' : 'Drag & drop a receipt, or click to select'}
                </p>
                <p className="text-gray-500 text-xs">JPG, PNG, WebP, or PDF — max 10MB</p>
            </div>
        </div>
    );
}

export default function Show({ expense }) {
    const [receiptUrl, setReceiptUrl] = useState(expense?.receipt_url || null);

    const statusColors = {
        paid: 'bg-green-500/10 text-green-400 border-green-500/20',
        pending: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
        draft: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
        rejected: 'bg-red-500/10 text-red-400 border-red-500/20',
    };

    return (
        <AuthenticatedLayout>
            <Head title={expense.title} />

            <div className="max-w-4xl mx-auto">
                <Breadcrumb items={[
                    { label: 'Expenses', href: route('expenses') },
                    { label: expense.title },
                ]} />

                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white">{expense.title}</h1>
                        {expense.project_name && expense.project_name !== 'N/A' && (
                            <p className="text-gray-400 mt-1 flex items-center gap-2">
                                <i className="fas fa-folder text-xs"></i> {expense.project_name}
                            </p>
                        )}
                    </div>
                    <div className="flex gap-3">
                        <span className={`px-3 py-1.5 rounded-xl text-xs font-bold border ${statusColors[expense.status] || statusColors.paid}`}>
                            {expense.status?.toUpperCase()}
                        </span>
                        <Link
                            href={route('expenses.edit', expense.id)}
                            className="px-4 py-2 bg-gradient-to-r from-[rgb(139,0,0)] to-[rgb(220,20,60)] text-white rounded-xl font-semibold hover:opacity-90 transition inline-flex items-center text-sm"
                        >
                            <i className="fas fa-edit mr-2"></i> Edit
                        </Link>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        <section className="bg-gradient-to-br from-[#1a0508]/80 via-[#120306]/80 to-[#0a0102]/80 backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6">
                            <h3 className="text-lg font-bold text-white mb-4">Details</h3>
                            <div className="grid grid-cols-2 gap-5">
                                <DetailRow label="Amount" value={formatCurrency(expense.amount, expense.currency)} mono />
                                <DetailRow label="Category" value={expense.category} />
                                <DetailRow label="Payment Method" value={expense.payment_method ? (PAYMENT_LABELS[expense.payment_method] || expense.payment_method) : null} />
                                <DetailRow label="Recipient" value={expense.recipient} />
                                <DetailRow label="Date" value={expense.expense_date} mono />
                                <DetailRow label="Time" value={expense.time} mono />
                                <DetailRow label="Reference" value={expense.reference_number} mono />
                                <DetailRow label="Purpose" value={expense.purpose} />
                            </div>
                            {expense.description && (
                                <div className="mt-5 pt-5 border-t border-white/10">
                                    <span className="text-[11px] font-bold tracking-widest text-gray-500 uppercase">Description</span>
                                    <p className="mt-2 text-sm text-gray-300 whitespace-pre-wrap">{expense.description}</p>
                                </div>
                            )}
                        </section>

                        <section className="bg-gradient-to-br from-[#1a0508]/80 via-[#120306]/80 to-[#0a0102]/80 backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6">
                            <h3 className="text-lg font-bold text-white mb-4">Receipt</h3>
                            <ReceiptSection expense={expense} onUpdate={() => router.reload({ only: ['expense'] })} />
                        </section>
                    </div>

                    <div className="space-y-8">
                        <section className="bg-gradient-to-br from-[#1a0508]/80 via-[#120306]/80 to-[#0a0102]/80 backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6">
                            <h3 className="text-lg font-bold text-white mb-4">Summary</h3>
                            <dl className="space-y-4 text-sm">
                                <div className="flex justify-between">
                                    <dt className="text-gray-500">Created</dt>
                                    <dd className="text-gray-300">{expense.created_at ? new Date(expense.created_at).toLocaleDateString() : '—'}</dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt className="text-gray-500">Updated</dt>
                                    <dd className="text-gray-300">{expense.updated_at ? new Date(expense.updated_at).toLocaleDateString() : '—'}</dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt className="text-gray-500">ID</dt>
                                    <dd className="text-gray-300 font-mono text-xs">#{expense.id}</dd>
                                </div>
                            </dl>
                        </section>

                        <section className="bg-gradient-to-br from-[#1a0508]/80 via-[#120306]/80 to-[#0a0102]/80 backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6">
                            <h3 className="text-lg font-bold text-white mb-4">Actions</h3>
                            <div className="space-y-3">
                                <Link
                                    href={route('expenses.edit', expense.id)}
                                    className="flex items-center gap-3 p-3 bg-white/5 rounded-xl hover:bg-white/10 transition text-sm text-gray-300"
                                >
                                    <i className="fas fa-edit text-[#DC143C]"></i> Edit Expense
                                </Link>
                                <Link
                                    href={route('expenses')}
                                    className="flex items-center gap-3 p-3 bg-white/5 rounded-xl hover:bg-white/10 transition text-sm text-gray-300"
                                >
                                    <i className="fas fa-list text-[#DC143C]"></i> Back to Expenses
                                </Link>
                                {expense.project_id && (
                                    <Link
                                        href={route('projects.show', expense.project_id)}
                                        className="flex items-center gap-3 p-3 bg-white/5 rounded-xl hover:bg-white/10 transition text-sm text-gray-300"
                                    >
                                        <i className="fas fa-folder text-[#DC143C]"></i> View Project
                                    </Link>
                                )}
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
