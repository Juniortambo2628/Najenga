import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { router } from '@inertiajs/react';
import { useState } from 'react';
import axios from 'axios';
import { useDropzone } from 'react-dropzone';
import DetailPage, { DetailText } from '@/Components/DetailPage';
import FilePreview from '@/Components/FilePreview';
import StatusBadge from '@/Components/StatusBadge';
import { formatCurrency, formatCurrencyCompact } from '@/Config/currencies';
import { PAYMENT_LABELS } from '@/Config/expenses';
import useAction from '@/Hooks/useAction';
import titleCase from '@/Utils/titleCase';
import formatDate, { shortDate, yearOf } from '@/Utils/formatDate';

const RECEIPT_STATUS = { pending: 'To check', verified: 'Verified', auto_verified: 'Auto-verified', rejected: 'Rejected' };

/** Drop or pick a receipt for an expense that has none. */
function ReceiptDrop({ onFile, uploading }) {
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop: (files) => files[0] && onFile(files[0]),
        accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.webp'], 'application/pdf': ['.pdf'] },
        maxFiles: 1,
    });

    return (
        <div
            {...getRootProps()}
            className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-10 text-center transition-colors fit:h-full ${isDragActive ? 'border-[#8B0000] bg-[#8B0000]/10' : 'border-white/20 hover:border-[#8B0000]/50 hover:bg-white/5'}`}
        >
            <input {...getInputProps()} aria-label="Receipt file" />
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/5">
                <i aria-hidden="true" className={`fas ${uploading ? 'fa-spinner fa-spin' : 'fa-cloud-upload-alt'} text-2xl text-white/40`} />
            </span>
            <p className="font-medium text-white">{uploading ? 'Uploading…' : isDragActive ? 'Drop the receipt here…' : 'Drag & drop a receipt, or click to choose one'}</p>
            <p className="text-xs text-gray-400">JPG, PNG, WebP or PDF, up to 10MB</p>
        </div>
    );
}

/**
 * One expense: its receipt fills the page (drop one in when it has none),
 * the figures are summary cards, and the details sit in the side panel.
 */
export default function Show({ expense, can = {} }) {
    const [receiptUrl, setReceiptUrl] = useState(expense.receipt_url || null);
    const title = titleCase(expense.title);
    const receipt = expense.receipt;
    const reload = () => router.reload({ only: ['expense'] });

    const upload = useAction(
        (file) => {
            const formData = new FormData();
            formData.append('receipt', file);
            return axios.post(`/expenses/${expense.id}/receipt`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        },
        {
            success: (res) => (res.data.success ? 'Receipt uploaded' : null),
            error: 'Upload failed',
            key: () => 'upload',
            onSuccess: (res) => {
                if (!res.data.success) return;
                setReceiptUrl(res.data.receipt_url);
                reload();
            },
        },
    );
    const remove = useAction(() => axios.delete(`/expenses/${expense.id}/receipt`), {
        confirm: 'Remove this receipt?',
        success: 'Receipt removed',
        error: 'Failed to remove receipt',
        onSuccess: () => {
            setReceiptUrl(null);
            reload();
        },
    });

    const date = [formatDate(expense.expense_date), expense.time].filter(Boolean).join(' · ');

    return (
        <AuthenticatedLayout>
            <DetailPage
                title={title}
                subtitle={expense.project?.name || 'Expense'}
                parent={{ label: 'Expenses', href: route('expenses') }}
                badges={expense.status && <StatusBadge status={expense.status} />}
                summary={[
                    { label: 'Amount', value: formatCurrencyCompact(expense.amount, expense.currency), icon: 'fa-coins', hint: formatCurrency(expense.amount, expense.currency) },
                    { label: 'Paid on', value: shortDate(expense.expense_date) || '—', icon: 'fa-calendar-day', hint: [yearOf(expense.expense_date), expense.time].filter(Boolean).join(' · ') || undefined },
                    { label: 'Paid by', value: expense.payment_method ? PAYMENT_LABELS[expense.payment_method] || titleCase(expense.payment_method) : '—', icon: 'fa-wallet', hint: expense.reference_number || undefined },
                    { label: 'Receipt', value: receiptUrl ? (receipt ? RECEIPT_STATUS[receipt.verification_status] || 'Attached' : 'Attached') : 'None', icon: 'fa-file-invoice', hint: receiptUrl ? undefined : 'Add one below' },
                ]}
                main={{
                    title: 'Receipt',
                    icon: 'fa-file-invoice',
                    actions: can.update && receiptUrl && (
                        <div className="flex shrink-0 gap-2">
                            <label className="cursor-pointer rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white transition hover:bg-white/10">
                                <i aria-hidden="true" className="fas fa-exchange-alt mr-1" />
                                Replace
                                <input
                                    type="file"
                                    accept="image/*,.pdf"
                                    className="hidden"
                                    onChange={(e) => {
                                        if (e.target.files?.[0]) upload.run(e.target.files[0]);
                                        e.target.value = '';
                                    }}
                                />
                            </label>
                            <button type="button" onClick={() => remove.run()} className="rounded-lg border border-red-500/20 px-3 py-1.5 text-xs text-red-400 transition hover:bg-red-500/10">
                                <i aria-hidden="true" className="fas fa-trash mr-1" />
                                Remove
                            </button>
                        </div>
                    ),
                }}
                details={{
                    icon: 'fa-receipt',
                    subtitle: date || undefined,
                    rows: [
                        { label: 'Paid to', value: titleCase(expense.recipient) },
                        { label: 'Category', value: expense.category },
                        { label: 'Reference', value: expense.reference_number, mono: true },
                        { label: 'Purpose', value: expense.purpose },
                        { label: 'Project', value: expense.project?.name },
                        { label: 'Added', value: formatDate(expense.created_at) },
                        { label: 'Last changed', value: formatDate(expense.updated_at) },
                    ],
                    content: <DetailText title="Description">{expense.description}</DetailText>,
                }}
                actions={[
                    can.update && { id: 'edit', label: 'Edit Expense', icon: 'fa-pen', href: route('expenses.edit', expense.id), variant: 'primary' },
                    receipt && { id: 'receipt', label: 'Check Receipt', icon: 'fa-file-invoice', href: route('receipts.show', receipt.id) },
                    receiptUrl && { id: 'download', label: 'Download Receipt', icon: 'fa-download', href: receiptUrl, download: true },
                    expense.project_id && { id: 'project', label: 'Open Project', icon: 'fa-folder', href: route('projects.show', expense.project_id) },
                ].filter(Boolean)}
            >
                {receiptUrl || !can.update ? (
                    <FilePreview url={receiptUrl} name={`Receipt for ${title}`} empty={{ icon: 'fa-file-invoice', title: 'No receipt', message: 'No receipt is attached to this expense.' }} />
                ) : (
                    <ReceiptDrop onFile={(file) => upload.run(file)} uploading={upload.pending} />
                )}
            </DetailPage>
        </AuthenticatedLayout>
    );
}
