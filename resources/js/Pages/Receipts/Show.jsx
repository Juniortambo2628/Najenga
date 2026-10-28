import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import DetailPage, { DetailRows } from '@/Components/DetailPage';
import FilePreview from '@/Components/FilePreview';
import StatusBadge from '@/Components/StatusBadge';
import { formatCurrency, formatCurrencyCompact } from '@/Config/currencies';
import useAction, { visit } from '@/Hooks/useAction';
import useVisibleActions from '@/Hooks/useVisibleActions';
import titleCase from '@/Utils/titleCase';
import formatDate from '@/Utils/formatDate';

const STATUS_LABELS = {
    pending: 'Waiting for a check',
    verified: 'Verified',
    auto_verified: 'Auto-verified',
    rejected: 'Rejected',
};

const sameAmount = (a, b) => a != null && b != null && Math.abs(Number(a) - Number(b)) < 0.01;
const sameRef = (a, b) => !!a && !!b && a.trim().toUpperCase() === b.trim().toUpperCase();

/**
 * How the receipt compares with its expense, for the summary cards: what was
 * read off the receipt, and whether it agrees with what the expense says.
 */
export function receiptChecks(receipt, expense) {
    const currency = expense?.currency;
    const read = receipt.extracted_amount;
    const ref = receipt.extracted_receipt_id;

    let amountHint = 'Nothing read yet';
    if (read != null) amountHint = !expense || sameAmount(read, expense.amount) ? formatCurrency(read, currency) : `${formatCurrency(read, currency)}, expense says ${formatCurrencyCompact(expense.amount, currency)}`;

    let refValue = '—';
    let refHint = 'Nothing read yet';
    if (ref && expense?.reference_number) {
        refValue = sameRef(ref, expense.reference_number) ? 'Matches' : 'Differs';
        refHint = refValue === 'Matches' ? ref : `${ref}, expense says ${expense.reference_number}`;
    } else if (ref) {
        refValue = ref;
        refHint = 'The expense has none';
    }

    const confidence = receipt.ocr_confidence != null ? Number(receipt.ocr_confidence) : null;

    return [
        { label: 'Expense amount', value: expense ? formatCurrencyCompact(expense.amount, currency) : '—', icon: 'fa-receipt', hint: expense ? formatCurrency(expense.amount, currency) : 'No expense' },
        { label: 'Read off the receipt', value: read != null ? formatCurrencyCompact(read, currency) : '—', icon: 'fa-wand-magic-sparkles', hint: amountHint },
        { label: 'Reference', value: refValue, icon: 'fa-hashtag', hint: refHint },
        { label: 'Read with', value: confidence != null ? `${Math.round(confidence * (confidence <= 1 ? 100 : 1))}%` : '—', icon: 'fa-gauge', hint: receipt.ocr_provider || 'Not read yet' },
    ];
}

/**
 * One receipt: the file fills the page, what was read off it sits in the side
 * panel, and the summary cards say whether it agrees with its expense.
 * Checking it (verify, reject, read it again) is done from the toolbar.
 */
export default function Show({ receipt, fileUrl }) {
    const expense = receipt.expense;
    const status = receipt.verification_status || 'pending';
    const name = receipt.original_name || receipt.filename || `Receipt #${receipt.id}`;
    const { visible } = useVisibleActions();

    const setStatus = useAction((value) => visit('patch', route('receipts.update', receipt.id), { verification_status: value }), {
        error: "Couldn't update the receipt",
        key: () => 'status',
    });
    const readAgain = useAction(() => visit('post', route('receipts.read-again', receipt.id)), {
        error: "Couldn't read the receipt",
        key: () => 'read',
    });

    const busy = setStatus.pending || readAgain.pending;

    return (
        <AuthenticatedLayout>
            <DetailPage
                title={expense ? titleCase(expense.title) : name}
                subtitle={name}
                parent={{ label: 'Receipts', href: route('receipts.index') }}
                badges={<StatusBadge status={status} />}
                summary={receiptChecks(receipt, expense)}
                main={{ title: name, icon: 'fa-file-invoice' }}
                details={{
                    title: 'What we read',
                    icon: 'fa-wand-magic-sparkles',
                    subtitle: STATUS_LABELS[status] || titleCase(status),
                    rows: [
                        { label: 'Paid to', value: receipt.extracted_merchant },
                        { label: 'Amount', value: receipt.extracted_amount != null ? formatCurrency(receipt.extracted_amount, expense?.currency) : null, mono: true },
                        { label: 'Date', value: formatDate(receipt.extracted_date) },
                        { label: 'Reference', value: receipt.extracted_receipt_id, mono: true },
                    ],
                    content: (
                        <>
                            {receipt.extracted_text && (
                                <details className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-sm">
                                    <summary className="cursor-pointer text-gray-300">Text on the receipt</summary>
                                    <p className="mt-2 whitespace-pre-wrap text-xs leading-relaxed text-gray-400">{receipt.extracted_text}</p>
                                </details>
                            )}
                            <DetailRows
                                className="grid grid-cols-1 gap-4 border-t border-white/10 pt-5"
                                rows={[
                                    expense && { label: 'Expense', value: [titleCase(expense.title), formatDate(expense.expense_date)].filter(Boolean).join(' · ') },
                                    expense?.project && { label: 'Project', value: expense.project.name },
                                    { label: 'File', value: receipt.filename, mono: true },
                                    { label: 'Added', value: formatDate(receipt.created_at) },
                                ]}
                            />
                        </>
                    ),
                }}
                actions={[
                    ...visible([
                        status !== 'verified' && { id: 'verify', label: 'Mark Verified', icon: 'fa-circle-check', variant: 'primary', disabled: busy, onClick: () => setStatus.run('verified') },
                        status !== 'rejected' && { id: 'reject', label: 'Reject', icon: 'fa-circle-xmark', variant: 'danger', disabled: busy, onClick: () => setStatus.run('rejected') },
                        status !== 'pending' && { id: 'pending', label: 'Back to Waiting', icon: 'fa-hourglass-half', disabled: busy, onClick: () => setStatus.run('pending') },
                        { id: 'read', label: readAgain.pending ? 'Reading…' : 'Read Again', icon: 'fa-rotate', disabled: busy, onClick: () => readAgain.run() },
                    ].filter(Boolean)),
                    expense && { id: 'expense', label: 'Open Expense', icon: 'fa-receipt', href: route('expenses.show', expense.id), readOnly: true },
                    fileUrl && { id: 'download', label: 'Download', icon: 'fa-download', href: fileUrl, download: true, readOnly: true },
                ].filter(Boolean)}
            >
                <FilePreview url={fileUrl} mime={receipt.mime_type} name={name} empty={{ icon: 'fa-file-image', title: 'No file', message: "This receipt's file is no longer on its expense." }} />
            </DetailPage>
        </AuthenticatedLayout>
    );
}
