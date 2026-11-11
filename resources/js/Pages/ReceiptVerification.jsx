import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Button from '@/Components/Button';
import { Head } from '@inertiajs/react';
import { useState, useRef } from 'react';
import axios from 'axios';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import SelectInput from '@/Components/SelectInput';
import DashboardPage from '@/Components/DashboardPage';
import { EXPENSE_CATEGORIES } from '@/Config/expenses';
import { rootBreadcrumbs } from '@/Config/navigation';
import useAction from '@/Hooks/useAction';
import useActiveProjectId from '@/Hooks/useActiveProjectId';

const CATEGORIES = EXPENSE_CATEGORIES;

const emptyForm = {
    title: '',
    amount: '',
    expense_date: '',
    time: '',
    recipient: '',
    payment_method: 'mobile_money',
    reference_number: '',
    purpose: '',
    category: 'Materials',
};

const mapExtractedToForm = (ext = {}, projectId = '') => ({
    title: ext.merchant || ext.recipient || 'Unknown',
    amount: ext.total || '',
    expense_date: ext.date || new Date().toISOString().split('T')[0],
    time: ext.time || '',
    recipient: ext.recipient || '',
    payment_method: ext.payment_method || 'mobile_money',
    reference_number: ext.reference_number || '',
    purpose: '',
    category: 'Materials',
    project_id: projectId,
});

/** One expense the reader found, as the form's fields. */
const mapExpenseToForm = (exp = {}, projectId = '') => ({
    title: exp.title || exp.recipient || 'Unknown',
    amount: exp.amount ?? '',
    expense_date: exp.expense_date || new Date().toISOString().split('T')[0],
    time: exp.time || '',
    recipient: exp.recipient || '',
    payment_method: exp.payment_method || 'mobile_money',
    reference_number: exp.reference_number || '',
    purpose: exp.purpose || '',
    category: exp.category || 'Materials',
    project_id: projectId,
});

const money = (amount, currency = 'KES') => (amount === null || amount === undefined || amount === ''
    ? '—'
    : `${currency} ${Number(amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);

const shortDate = (iso) => (iso ? new Date(`${iso}T00:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : null);

/** What an invoice or quotation is filed as under Documents. */
const documentForm = (doc, projectId) => {
    const what = doc.type === 'quote' ? 'Quotation' : 'Invoice';
    const due = doc.type === 'quote' ? (doc.valid_until && `valid until ${shortDate(doc.valid_until)}`) : (doc.due_date && `due ${shortDate(doc.due_date)}`);
    return {
        title: [what, doc.number, doc.issuer && `— ${doc.issuer}`].filter(Boolean).join(' '),
        description: [doc.total ? money(doc.total, doc.currency) : null, due, doc.bill_to && `for ${doc.bill_to}`].filter(Boolean).join(', '),
        document_date: doc.date || '',
        category: doc.type === 'quote' ? 'quote' : 'invoice',
        project_id: projectId,
    };
};

/**
 * A queue entry once its file is read: one entry per expense in it (they
 * share the file and preview), or one entry for an invoice / quotation to
 * file as a document.
 */
const expandEntry = (entry, result, projectId) => {
    const shared = { rawText: result.text || '', summary: result.summary || '', kind: result.kind };

    if (result.document) {
        return [{
            ...entry,
            ...shared,
            status: 'document',
            document: result.document,
            docForm: documentForm(result.document, projectId),
            result: { temp_path: result.document.temp_path },
        }];
    }

    const expenses = result.expenses || [];
    if (expenses.length === 0) {
        return [{ ...entry, ...shared, status: 'error', error: result.summary || 'No payment found in this file.' }];
    }

    return expenses.map((exp, i) => ({
        ...entry,
        ...shared,
        id: i === 0 ? entry.id : `${entry.id}-${i + 1}`,
        part: expenses.length > 1 ? { index: i + 1, total: expenses.length } : null,
        status: exp.duplicate_of ? 'duplicate' : 'ready',
        duplicateOf: exp.duplicate_of || null,
        needsCheck: !!exp.needs_check,
        formData: mapExpenseToForm(exp, projectId),
        result: { temp_path: exp.temp_path, extracted: exp },
    }));
};

export default function ReceiptVerification({ projects = [] }) {
    const [activeProjectId] = useActiveProjectId();
    const defaultProjectId = projects.some((project) => String(project.id) === String(activeProjectId)) ? activeProjectId : '';
    const [files, setFiles] = useState([]);
    const [queue, setQueue] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(-1);
    const [analyzing, setProcessing] = useState(false);
    const [errors, setErrors] = useState({});
    const [bulkMode, setBulkMode] = useState(false);

    const [formData, setFormData] = useState({ ...emptyForm, project_id: defaultProjectId });
    const [updateMatched, setUpdateMatched] = useState(false);
    const [rawText, setRawText] = useState('');
    const [currentTempPath, setCurrentTempPath] = useState('');
    const [currentFileId, setCurrentFileId] = useState(null);
    // The latest queue, for reading it straight after a change.
    const queueRef = useRef(queue);
    queueRef.current = queue;

    const getAxiosConfig = (extraHeaders = {}) => {
        const token = document.head.querySelector('meta[name="csrf-token"]')?.content;
        return {
            headers: {
                'X-Requested-With': 'XMLHttpRequest',
                'X-CSRF-TOKEN': token,
                ...extraHeaders
            },
            withCredentials: true
        };
    };

    const handleFileChange = (e) => {
        const selected = Array.from(e.target.files || []);
        if (selected.length === 0) return;

        const newEntries = selected.map((f, i) => ({
            id: Date.now() + i,
            file: f,
            preview: URL.createObjectURL(f),
            status: 'pending',
            result: null,
            formData: { ...emptyForm },
            rawText: '',
            tempPath: '',
        }));

        setQueue(prev => [...prev, ...newEntries]);
        setBulkMode(selected.length > 1);
        setErrors({});
    };

    const removeFromFileQueue = (id) => {
        setQueue(prev => prev.filter(e => e.id !== id));
    };

    /** Is a payment like this one already an expense? Marks the entry if so. */
    const checkMatch = async (entry) => {
        const form = entry.formData;
        if (!form?.reference_number) return;
        try {
            const matchResponse = await axios.get('/receipts/match', {
                ...getAxiosConfig(),
                params: { reference_number: form.reference_number, date: form.expense_date, time: form.time },
            });
            if (matchResponse.data.matched) {
                setQueue(prev => prev.map(e => e.id === entry.id ? { ...e, matchedExpense: matchResponse.data.expense } : e));
            }
        } catch (err) {
            // Silently fail - matching is optional
        }
    };

    /** Put a read file's entries in place of its pending entry; returns them. */
    const applyResult = (entryId, result) => {
        const current = queueRef.current;
        const entry = current.find(e => e.id === entryId);
        if (!entry) return { next: current, added: [] };
        const added = expandEntry(entry, result, defaultProjectId);
        const next = current.flatMap(e => e.id === entryId ? added : [e]);
        queueRef.current = next;
        setQueue(next);
        return { next, added };
    };

    const markFailed = (entryId, message) => {
        const next = queueRef.current.map(e => e.id === entryId ? { ...e, status: 'error', result: null, error: message } : e);
        queueRef.current = next;
        setQueue(next);
    };

    /** Show this entry (from a queue that may not be rendered yet). */
    const showEntry = (list, entryId) => {
        const idx = list.findIndex(e => e.id === entryId);
        const entry = list[idx];
        if (!entry) return;
        setCurrentIndex(idx);
        setCurrentFileId(entry.id);
        setUpdateMatched(!!entry.updateMatched);
        setRawText(entry.rawText || '');
        setCurrentTempPath(entry.result?.temp_path || '');
        if (entry.formData) setFormData(entry.formData);
    };

    const analyzeOne = async (entry, idx) => {
        setCurrentIndex(idx);
        setProcessing(true);
        setErrors({});

        const data = new FormData();
        data.append('receipt', entry.file);

        try {
            const response = await axios.post('/receipts/analyze', data, getAxiosConfig({
                'Content-Type': 'multipart/form-data'
            }));

            if (response.data.success) {
                const { next, added } = applyResult(entry.id, response.data);
                showEntry(next, added[0]?.id);
                for (const item of added) {
                    if (item.status === 'ready') await checkMatch(item);
                }
            } else {
                markFailed(entry.id, response.data.message);
                setErrors({ analysis: response.data.message || 'OCR failed' });
            }
        } catch (error) {
            const msg = error.response?.data?.message || 'Failed to analyze receipt.';
            markFailed(entry.id, msg);
            setErrors({ analysis: msg });
        } finally {
            setProcessing(false);
        }
    };

    const analyzeAll = async () => {
        setProcessing(true);
        setErrors({});

        const pending = queueRef.current.filter((entry) => entry.status === 'pending');

        if (pending.length === 0) {
            setProcessing(false);
            return;
        }

        const data = new FormData();
        pending.forEach((entry) => data.append('receipts[]', entry.file));

        try {
            const response = await axios.post('/receipts/analyze-bulk', data, getAxiosConfig({
                'Content-Type': 'multipart/form-data',
            }));

            const byIndex = new Map((response.data.results || []).map((r) => [r.index, r]));
            const toMatch = [];
            let failed = 0;
            let firstShown = null;
            let latest = queueRef.current;

            pending.forEach((entry, position) => {
                const result = byIndex.get(position);

                if (!result || !result.success) {
                    failed += 1;
                    markFailed(entry.id, result?.message);
                    latest = queueRef.current;
                    return;
                }

                const { next, added } = applyResult(entry.id, result);
                latest = next;
                if (firstShown === null && added[0]) firstShown = added[0].id;
                toMatch.push(...added.filter(item => item.status === 'ready'));
            });

            if (firstShown !== null) showEntry(latest, firstShown);

            for (const item of toMatch) await checkMatch(item);

            if (failed > 0) {
                setErrors({ analysis: `${failed} receipt${failed > 1 ? 's' : ''} failed OCR.` });
            } else if (firstShown === null) {
                setErrors({ analysis: 'OCR failed.' });
            }
        } catch (error) {
            const msg = error.response?.data?.message || 'Failed to analyze receipts.';
            pending.forEach((entry) => markFailed(entry.id, msg));
            setErrors({ analysis: msg });
        } finally {
            setProcessing(false);
        }
    };

    /** An invoice or quotation: under Documents, not an expense. */
    const fileDocument = useAction((entry) => axios.post('/receipts/file-document', {
        ...entry.docForm,
        project_id: entry.docForm.project_id || null,
        temp_path: entry.result.temp_path,
        original_name: entry.file?.name,
    }, getAxiosConfig()), {
        error: false,
        key: () => 'file-document',
        onSuccess: (response, entry) => {
            setQueue(prev => prev.map(e => e.id === entry.id ? { ...e, status: 'filed' } : e));
        },
        onError: (error) => setErrors(error.response?.data?.errors
            ? Object.fromEntries(Object.entries(error.response.data.errors).map(([k, v]) => [`doc_${k}`, Array.isArray(v) ? v[0] : v]))
            : { doc_save: error.response?.data?.message || 'Could not file the document.' }),
    });

    const updateDocField = (field, value) => {
        setQueue(prev => prev.map((e, i) => i === currentIndex ? { ...e, docForm: { ...e.docForm, [field]: value } } : e));
    };

    /** Someone knows better: this invoice was paid, so record it as an expense. */
    const recordDocumentAsExpense = (entry) => {
        const doc = entry.document;
        const form = mapExpenseToForm({
            title: doc.issuer || (doc.type === 'quote' ? 'Quotation' : 'Invoice'),
            amount: doc.total,
            expense_date: doc.date,
            recipient: doc.issuer,
            payment_method: 'other',
            reference_number: doc.number,
            purpose: (doc.items || []).map(item => item.description).join(', '),
            category: 'Materials',
        }, entry.docForm?.project_id || defaultProjectId);
        setQueue(prev => prev.map((e, i) => i === currentIndex ? { ...e, status: 'ready', formData: form } : e));
        setFormData(form);
        setCurrentTempPath(entry.result.temp_path);
    };

    /** A payment already in this batch: save it anyway. */
    const keepDuplicate = (entry) => {
        setQueue(prev => prev.map((e, i) => i === currentIndex ? { ...e, status: 'ready', duplicateOf: null } : e));
        setFormData(entry.formData);
    };

    // Saving shows its errors inline (beside the form), not as toasts.
    const save = useAction((data) => axios.post('/receipts/store', data, getAxiosConfig()), {
        error: false,
        key: () => 'save',
        onSuccess: () => {
            setQueue(prev => prev.map(entry =>
                entry.id === currentFileId ? { ...entry, status: 'saved' } : entry
            ));

            setFormData({ ...emptyForm, project_id: defaultProjectId });
            setUpdateMatched(false);
            setRawText('');
            setCurrentTempPath('');
            setCurrentFileId(null);

            const nextPending = queue.findIndex((e) => e.status === 'pending' && e.id !== currentFileId);
            if (nextPending >= 0) {
                selectEntry(nextPending);
            }
        },
        onError: (error) => setErrors(error.response?.data?.errors || { save: 'Failed to save expense.' }),
    });

    const handleSave = (e) => {
        e.preventDefault();
        setErrors({});
        save.run({ ...formData, project_id: formData.project_id || null, update_matched: updateMatched, temp_path: currentTempPath });
    };

    const saveAll = useAction((expenses) => axios.post('/receipts/store-bulk', { expenses }, getAxiosConfig()), {
        error: false,
        key: () => 'save-all',
        onSuccess: (response, expenses, readyEntries) => {
            const savedIds = new Set((response.data.saved || []).map(s => s.index));
            setQueue(prev => prev.map((entry) => {
                if (entry.status === 'ready') {
                    const readyIdx = readyEntries.findIndex(r => r.id === entry.id);
                    if (savedIds.has(readyIdx)) {
                        return { ...entry, status: 'saved' };
                    }
                }
                return entry;
            }));

            if (response.data.errors?.length > 0) {
                setErrors({ save: `${response.data.count} saved, ${response.data.errors.length} failed.` });
            }
        },
        onError: () => setErrors({ save: 'Bulk save failed.' }),
    });

    const handleSaveAll = () => {
        setErrors({});

        const readyEntries = queue.filter(e => e.status === 'ready');
        if (readyEntries.length === 0) {
            setErrors({ save: 'No receipts to save.' });
            return;
        }

        const expenses = readyEntries.map(e => ({
            ...e.formData,
            temp_path: e.result.temp_path,
            ocr_source: e.result.extracted ? 'local-tesseract' : 'unknown',
            update_matched: !!e.updateMatched,
        }));

        saveAll.run(expenses, readyEntries);
    };

    const selectEntry = (idx) => showEntry(queue, queue[idx]?.id);

    const updateCurrentField = (field, value) => {
        const updated = { ...formData, [field]: value };
        setFormData(updated);
        setQueue(prev => prev.map((e, i) => i === currentIndex ? { ...e, formData: updated } : e));
    };

    const pendingCount = queue.filter(e => e.status === 'pending').length;
    const documentCount = queue.filter(e => e.status === 'document').length;
    const readyCount = queue.filter(e => e.status === 'ready').length;
    const savedCount = queue.filter(e => e.status === 'saved').length;

    const processing = analyzing || save.pending || saveAll.pending || fileDocument.pending;
    const current = currentIndex >= 0 ? queue[currentIndex] : null;

    return (
        <AuthenticatedLayout>
            <Head title="Receipt Verification" />

            <DashboardPage
                className="max-w-7xl mx-auto"
                hero={{
                    title: 'Receipt Verification',
                    subtitle: 'Upload and verify receipts with OCR',
                    breadcrumbs: [
                        ...rootBreadcrumbs(),
                        { label: 'Receipt Verification' },
                    ],
                }}
            >
                {queue.length > 0 && (
                    <div className="flex items-center gap-3 text-sm text-gray-400 mb-6">
                        <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded">{pendingCount} pending</span>
                        <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded">{readyCount} ready</span>
                        <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded">{savedCount} saved</span>
                        {documentCount > 0 && <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded">{documentCount} to file as documents</span>}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left: Upload + Queue */}
                    <div className="space-y-4">
                        {/* Upload Zone */}
                        <div className="bg-black/50 border border-white/10 rounded-2xl p-6 backdrop-blur-sm min-h-[200px] flex flex-col items-center justify-center relative overflow-hidden focus-within:ring-2 focus-within:ring-rose-400">
                            <div className="text-center text-gray-400">
                                <i aria-hidden="true" className="fas fa-cloud-upload-alt text-5xl mb-3 text-gray-400"></i>
                                <p className="text-sm">Click or drag to upload receipts</p>
                                <p className="text-xs text-gray-400 mt-1">Supports JPG, PNG, PDF (max 100MB each)</p>
                            </div>
                            <input
                                type="file"
                                accept="image/*,.pdf"
                                multiple
                                onChange={handleFileChange}
                                aria-label="Upload receipts"
                                className="absolute inset-0 opacity-0 cursor-pointer"
                            />
                        </div>

                        {/* Bulk Actions */}
                        {queue.length > 0 && (
                            <div className="flex gap-2">
                                {pendingCount > 0 && (
                                    <button
                                        onClick={analyzeAll}
                                        disabled={processing}
                                        className="flex-1 py-2 bg-gradient-to-r from-[rgb(139,0,0)] to-[rgb(220,20,60)] text-white rounded-xl font-bold text-sm hover:opacity-90 transition disabled:opacity-50"
                                    >
                                        {processing ? (
                                            <><i aria-hidden="true" className="fas fa-spinner fa-spin mr-1"></i> Analyzing...</>
                                        ) : (
                                            <><i aria-hidden="true" className="fas fa-bolt mr-1"></i> Analyze All ({pendingCount})</>
                                        )}
                                    </button>
                                )}
                                {readyCount > 0 && (
                                    <button
                                        onClick={handleSaveAll}
                                        disabled={processing}
                                        className="flex-1 py-2 bg-green-600 text-white rounded-xl font-bold text-sm hover:bg-green-700 transition disabled:opacity-50"
                                    >
                                        <i aria-hidden="true" className="fas fa-save mr-1"></i> Save All ({readyCount})
                                    </button>
                                )}
                            </div>
                        )}

                        {/* File Queue */}
                        <div className="space-y-2 max-h-[400px] overflow-y-auto">
                            {queue.map((entry, idx) => (
                                <div
                                    key={entry.id}
                                    onClick={() => entry.status !== 'pending' && selectEntry(idx)}
                                    className={`p-3 rounded-xl border cursor-pointer transition text-sm flex items-center gap-3 ${
                                        currentIndex === idx
                                            ? 'bg-white/10 border-white/20'
                                            : 'bg-black/30 border-white/5 hover:bg-white/5'
                                    }`}
                                >
                                    {entry.file?.type === 'application/pdf' ? (
                                        <span aria-hidden="true" className="w-10 h-10 rounded bg-white/5 flex items-center justify-center flex-shrink-0">
                                            <i className="fas fa-file-pdf text-gray-400"></i>
                                        </span>
                                    ) : (
                                        <img loading="lazy" decoding="async" src={entry.preview} alt="" className="w-10 h-10 rounded object-cover flex-shrink-0" />
                                    )}
                                    <button
                                        type="button"
                                        disabled={entry.status === 'pending'}
                                        aria-current={currentIndex === idx ? 'true' : undefined}
                                        className="flex-1 min-w-0 text-left disabled:cursor-default"
                                    >
                                        <span className="block text-white truncate text-xs">{entry.file.name}</span>
                                        <span className={`block text-xs ${
                                            entry.status === 'saved' || entry.status === 'filed' ? 'text-green-400' :
                                            entry.status === 'ready' ? 'text-blue-400' :
                                            entry.status === 'document' ? 'text-yellow-400' :
                                            entry.status === 'error' ? 'text-red-400' :
                                            'text-gray-400'
                                        }`}>
                                            {entry.part && `Payment ${entry.part.index} of ${entry.part.total} · `}
                                            {entry.status === 'pending' && 'Waiting...'}
                                            {entry.status === 'ready' && `Ready - ${entry.formData?.title || entry.formData?.recipient || 'No recipient'}${entry.formData?.amount ? ` · ${money(entry.formData.amount)}` : ''}`}
                                            {entry.status === 'duplicate' && `Already in this batch (${entry.duplicateOf})`}
                                            {entry.status === 'document' && `${entry.document?.type === 'quote' ? 'Quotation' : 'Invoice'} - file as a document`}
                                            {entry.status === 'saved' && 'Saved'}
                                            {entry.status === 'filed' && 'Filed under Documents'}
                                            {entry.status === 'error' && 'Failed'}
                                        </span>
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); removeFromFileQueue(entry.id); }}
                                        aria-label={`Remove ${entry.file?.name || 'file'} from queue`}
                                        className="text-gray-400 hover:text-red-400 text-xs"
                                    >
                                        <i aria-hidden="true" className="fas fa-times"></i>
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Center: Preview */}
                    <div className="space-y-4">
                        {currentIndex >= 0 && queue[currentIndex] ? (
                            <>
                                <div className="bg-black/50 border border-white/10 rounded-2xl p-4 backdrop-blur-sm">
                                    {queue[currentIndex].file?.type === 'application/pdf' ? (
                                        <iframe src={queue[currentIndex].preview} className="w-full h-[400px] rounded-lg" title="Receipt PDF" />
                                    ) : (
                                        <img loading="lazy" decoding="async"  src={queue[currentIndex].preview} alt="Receipt Preview" className="w-full max-h-[400px] object-contain rounded-lg" />
                                    )}
                                </div>

                                {queue[currentIndex].status === 'pending' && (
                                    <button
                                        onClick={() => analyzeOne(queue[currentIndex], currentIndex)}
                                        disabled={processing}
                                        className="w-full py-3 bg-gradient-to-r from-[rgb(139,0,0)] to-[rgb(220,20,60)] text-white rounded-xl font-bold text-sm hover:opacity-90 transition disabled:opacity-50"
                                    >
                                        {processing ? (
                                            <><i aria-hidden="true" className="fas fa-spinner fa-spin mr-2"></i> Analyzing...</>
                                        ) : (
                                            <><i aria-hidden="true" className="fas fa-bolt mr-2"></i> Analyze This Receipt</>
                                        )}
                                    </button>
                                )}

                                {queue[currentIndex].summary && (
                                    <p className="text-xs text-gray-400" role="status">
                                        <i aria-hidden="true" className="fas fa-receipt mr-1"></i>{queue[currentIndex].summary}
                                    </p>
                                )}

                                {rawText && (
                                    <details className="text-gray-400 text-xs cursor-pointer">
                                        <summary>View Raw OCR Text</summary>
                                        <pre className="bg-black p-3 rounded mt-2 overflow-auto max-h-32 whitespace-pre-wrap">{rawText}</pre>
                                    </details>
                                )}
                            </>
                        ) : (
                            <div className="bg-black/50 border border-white/10 rounded-2xl p-8 backdrop-blur-sm flex items-center justify-center min-h-[400px]">
                                <div className="text-center text-gray-400">
                                    <i aria-hidden="true" className="fas fa-image text-4xl mb-3"></i>
                                    <p>Select a receipt to preview</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right: Edit Form */}
                    <div className="bg-black/40 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
                        <h2 className="text-lg font-bold text-white mb-4 border-b border-white/10 pb-3">Extracted Details</h2>

                        {currentIndex < 0 || !queue[currentIndex] || queue[currentIndex].status === 'pending' ? (
                            <div className="text-center text-gray-400 py-8">
                                <i aria-hidden="true" className="fas fa-list-alt text-3xl mb-2"></i>
                                <p className="text-sm">Upload and analyze a receipt to see details</p>
                            </div>
                        ) : queue[currentIndex].status === 'error' ? (
                            <div className="text-center text-red-400 py-8">
                                <i aria-hidden="true" className="fas fa-exclamation-triangle text-3xl mb-2"></i>
                                <p className="text-sm">Failed to analyze this receipt</p>
                                {(queue[currentIndex].error || errors.analysis) && <p className="text-xs mt-2">{queue[currentIndex].error || errors.analysis}</p>}
                            </div>
                        ) : queue[currentIndex].status === 'saved' ? (
                            <div className="text-center text-green-400 py-8">
                                <i aria-hidden="true" className="fas fa-check-circle text-3xl mb-2"></i>
                                <p className="text-sm">Expense saved successfully</p>
                            </div>
                        ) : queue[currentIndex].status === 'filed' ? (
                            <div className="text-center text-green-400 py-8">
                                <i aria-hidden="true" className="fas fa-check-circle text-3xl mb-2"></i>
                                <p className="text-sm">Filed under Documents</p>
                            </div>
                        ) : queue[currentIndex].status === 'duplicate' ? (
                            <div className="space-y-3">
                                <div className="p-3 bg-amber-400/10 border border-amber-400/30 rounded-xl">
                                    <div className="flex items-center gap-2 text-amber-300 text-sm font-medium">
                                        <i aria-hidden="true" className="fas fa-clone"></i>
                                        <span>Already in this batch</span>
                                    </div>
                                    <p className="text-xs text-gray-400 mt-1">
                                        {current.formData?.reference_number} ({money(current.formData?.amount)}) is also in {current.duplicateOf}, so it won't be saved twice.
                                    </p>
                                </div>
                                <div className="flex justify-end pt-3 border-t border-white/10">
                                    <Button variant="secondary" type="button" onClick={() => keepDuplicate(current)}>
                                        Save it as well
                                    </Button>
                                </div>
                            </div>
                        ) : queue[currentIndex].status === 'document' ? (
                            <div className="space-y-3">
                                <div className="p-3 bg-amber-400/10 border border-amber-400/30 rounded-xl">
                                    <div className="flex items-center gap-2 text-amber-300 text-sm font-medium">
                                        <i aria-hidden="true" className={`fas ${current.document.type === 'quote' ? 'fa-file-signature' : 'fa-file-invoice-dollar'}`}></i>
                                        <span>This is {current.document.type === 'quote' ? 'a quotation' : 'an invoice'}, not a receipt</span>
                                    </div>
                                    <p className="text-xs text-gray-400 mt-1">
                                        {current.document.type === 'quote'
                                            ? 'A quotation is a price, not a payment: it goes under Documents.'
                                            : 'An invoice asks for payment: it goes under Documents. The payment that settles it is the expense.'}
                                    </p>
                                </div>

                                <dl className="grid grid-cols-2 gap-x-3 gap-y-2 text-sm">
                                    {[
                                        ['From', current.document.issuer],
                                        ['Number', current.document.number],
                                        ['Total', current.document.total ? money(current.document.total, current.document.currency) : null],
                                        ['Paid', current.document.paid !== null && current.document.paid !== undefined ? money(current.document.paid, current.document.currency) : null],
                                        ['Date', shortDate(current.document.date)],
                                        [current.document.type === 'quote' ? 'Valid until' : 'Due', shortDate(current.document.type === 'quote' ? current.document.valid_until : current.document.due_date)],
                                    ].filter(([, value]) => value).map(([label, value]) => (
                                        <div key={label}>
                                            <dt className="text-xs text-gray-400">{label}</dt>
                                            <dd className="text-white break-words">{value}</dd>
                                        </div>
                                    ))}
                                </dl>

                                {current.document.items?.length > 0 && (
                                    <ul className="text-xs text-gray-400 space-y-1 border-t border-white/10 pt-2">
                                        {current.document.items.map((item, i) => (
                                            <li key={i} className="flex justify-between gap-2">
                                                <span className="truncate">{item.quantity ? `${item.quantity} × ` : ''}{item.description}</span>
                                                <span className="text-gray-300">{money(item.total, current.document.currency)}</span>
                                            </li>
                                        ))}
                                    </ul>
                                )}

                                <div>
                                    <InputLabel htmlFor="receiptverification-doc-title" value="Document title" />
                                    <TextInput
                                        id="receiptverification-doc-title"
                                        aria-invalid={!!errors.doc_title}
                                        aria-describedby={errors.doc_title ? 'receiptverification-doc-title-error' : undefined}
                                        value={current.docForm.title}
                                        onChange={(e) => updateDocField('title', e.target.value)}
                                        className="mt-1 block w-full"
                                    />
                                    <InputError id="receiptverification-doc-title-error" message={errors.doc_title} className="mt-1" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="receiptverification-doc-project" value="Project" />
                                    <SelectInput
                                        id="receiptverification-doc-project"
                                        aria-invalid={!!errors.doc_project_id}
                                        aria-describedby={errors.doc_project_id ? 'receiptverification-doc-project-error' : undefined}
                                        value={current.docForm.project_id || ''}
                                        onChange={(e) => updateDocField('project_id', e.target.value)}
                                        className="mt-1 block w-full"
                                    >
                                        <option value="">Choose a project</option>
                                        {projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}
                                    </SelectInput>
                                    <InputError id="receiptverification-doc-project-error" message={errors.doc_project_id} className="mt-1" />
                                </div>

                                <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
                                    <Button variant="secondary" type="button" onClick={() => recordDocumentAsExpense(current)}>
                                        It's paid: record as expense
                                    </Button>
                                    <Button type="button" disabled={processing} onClick={() => { setErrors({}); fileDocument.run(current); }}>
                                        <i aria-hidden="true" className="fas fa-folder-plus mr-1"></i>
                                        {fileDocument.pending ? 'Filing...' : 'File under Documents'}
                                    </Button>
                                </div>

                                {errors.doc_save && (
                                    <div className="p-2 bg-red-500/20 border border-red-500/30 rounded-xl text-red-400 text-xs">
                                        <i aria-hidden="true" className="fas fa-exclamation-circle mr-1"></i>{errors.doc_save}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <form onSubmit={handleSave} className="space-y-3">
                                {current?.needsCheck && (
                                    <div className="p-3 bg-amber-400/10 border border-amber-400/30 rounded-xl">
                                        <div className="flex items-center gap-2 text-amber-300 text-sm font-medium">
                                            <i aria-hidden="true" className="fas fa-eye"></i>
                                            <span>Check these details</span>
                                        </div>
                                        <p className="text-xs text-gray-400 mt-1">Part of this payment was hard to read (the reference or the date): compare it with the image before saving.</p>
                                    </div>
                                )}

                                {/* Recipient */}
                                <div>
                                    <InputLabel htmlFor="receiptverification-recipient" value="Recipient" />
                                    <TextInput
                                        id="receiptverification-recipient"
                                        aria-invalid={!!errors.recipient}
                                        aria-describedby={errors.recipient ? 'receiptverification-recipient-error' : undefined}
                                        value={formData.recipient}
                                        onChange={(e) => updateCurrentField('recipient', e.target.value)}
                                        placeholder="KISUMU CONCRETE PRODUCTS PLC"
                                        className="mt-1 block w-full"
                                    />
                                    <InputError id="receiptverification-recipient-error" message={errors.recipient} className="mt-1" />
                                </div>

                                {/* Purpose / Merchant */}
                                <div>
                                    <InputLabel htmlFor="receiptverification-title" value="Purpose / Merchant" />
                                    <TextInput
                                        id="receiptverification-title"
                                        aria-invalid={!!errors.title}
                                        aria-describedby={errors.title ? 'receiptverification-title-error' : undefined}
                                        value={formData.title}
                                        onChange={(e) => updateCurrentField('title', e.target.value)}
                                        placeholder="ACCURATE BRIGHTONE ENGINEERS, etc."
                                        className="mt-1 block w-full"
                                    />
                                    <InputError id="receiptverification-title-error" message={errors.title} className="mt-1" />
                                </div>

                                {/* Date + Time */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <InputLabel htmlFor="receiptverification-expense-date" value="Date" />
                                        <TextInput
                                            id="receiptverification-expense-date"
                                            aria-invalid={!!errors.expense_date}
                                            aria-describedby={errors.expense_date ? 'receiptverification-expense-date-error' : undefined}
                                            type="date"
                                            value={formData.expense_date}
                                            onChange={(e) => updateCurrentField('expense_date', e.target.value)}
                                            className="mt-1 block w-full"
                                        />
                                        <InputError id="receiptverification-expense-date-error" message={errors.expense_date} className="mt-1" />
                                    </div>
                                    <div>
                                        <InputLabel htmlFor="receiptverification-time" value="Time" />
                                        <TextInput
                                            id="receiptverification-time"
                                            aria-invalid={!!errors.time}
                                            aria-describedby={errors.time ? 'receiptverification-time-error' : undefined}
                                            type="text"
                                            value={formData.time}
                                            onChange={(e) => updateCurrentField('time', e.target.value)}
                                            placeholder="03:41 PM"
                                            className="mt-1 block w-full"
                                        />
                                        <InputError id="receiptverification-time-error" message={errors.time} className="mt-1" />
                                    </div>
                                </div>

                                {/* Amount + Reference */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <InputLabel htmlFor="receiptverification-amount" value="Amount" />
                                        <TextInput
                                            id="receiptverification-amount"
                                            aria-invalid={!!errors.amount}
                                            aria-describedby={errors.amount ? 'receiptverification-amount-error' : undefined}
                                            type="number"
                                            step="0.01"
                                            value={formData.amount}
                                            onChange={(e) => updateCurrentField('amount', e.target.value)}
                                            placeholder="0.00"
                                            className="mt-1 block w-full"
                                        />
                                        <InputError id="receiptverification-amount-error" message={errors.amount} className="mt-1" />
                                    </div>
                                    <div>
                                        <InputLabel htmlFor="receiptverification-reference-number" value="Reference" />
                                        <TextInput
                                            id="receiptverification-reference-number"
                                            aria-invalid={!!errors.reference_number}
                                            aria-describedby={errors.reference_number ? 'receiptverification-reference-number-error' : undefined}
                                            value={formData.reference_number}
                                            onChange={(e) => updateCurrentField('reference_number', e.target.value)}
                                            placeholder="UGGSG3I38V"
                                            className="mt-1 block w-full"
                                        />
                                        <InputError id="receiptverification-reference-number-error" message={errors.reference_number} className="mt-1" />
                                    </div>
                                </div>

                                {/* Payment Method + Category */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <InputLabel htmlFor="receiptverification-payment-method" value="Payment Method" />
                                        <SelectInput
                                            id="receiptverification-payment-method"
                                            aria-invalid={!!errors.payment_method}
                                            aria-describedby={errors.payment_method ? 'receiptverification-payment-method-error' : undefined}
                                            value={formData.payment_method}
                                            onChange={(e) => updateCurrentField('payment_method', e.target.value)}
                                            className="mt-1 block w-full"
                                        >
                                            <option value="mobile_money">Mobile Money</option>
                                            <option value="cash">Cash</option>
                                            <option value="bank_transfer">Bank Transfer</option>
                                            <option value="card">Card</option>
                                            <option value="check">Cheque</option>
                                            <option value="other">Other</option>
                                        </SelectInput>
                                        <InputError id="receiptverification-payment-method-error" message={errors.payment_method} className="mt-1" />
                                    </div>
                                    <div>
                                        <InputLabel htmlFor="receiptverification-category" value="Category" />
                                        <SelectInput
                                            id="receiptverification-category"
                                            aria-invalid={!!errors.category}
                                            aria-describedby={errors.category ? 'receiptverification-category-error' : undefined}
                                            value={formData.category}
                                            onChange={(e) => updateCurrentField('category', e.target.value)}
                                            className="mt-1 block w-full"
                                        >
                                            {CATEGORIES.map((cat) => (
                                                <option key={cat} value={cat}>{cat}</option>
                                            ))}
                                        </SelectInput>
                                        <InputError id="receiptverification-category-error" message={errors.category} className="mt-1" />
                                    </div>
                                </div>

                                {/* Matched Expense Indicator */}
                                {queue[currentIndex]?.matchedExpense && (
                                    <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-xl">
                                        <div className="flex items-center gap-2 text-green-400 text-sm font-medium">
                                            <i aria-hidden="true" className="fas fa-link"></i>
                                            <span>Matched to existing expense</span>
                                        </div>
                                        <p className="text-xs text-gray-400 mt-1">
                                            {queue[currentIndex].matchedExpense.title} &mdash; KES {Number(queue[currentIndex].matchedExpense.amount).toLocaleString()} ({queue[currentIndex].matchedExpense.expense_date})
                                        </p>
                                    </div>
                                )}

                                {/* Purpose */}
                                <div>
                                    <InputLabel htmlFor="receiptverification-purpose" value="Purpose of Payment" />
                                    <TextInput
                                        id="receiptverification-purpose"
                                        aria-invalid={!!errors.purpose}
                                        aria-describedby={errors.purpose ? 'receiptverification-purpose-error' : undefined}
                                        value={formData.purpose}
                                        onChange={(e) => updateCurrentField('purpose', e.target.value)}
                                        placeholder="Construction materials, salary payment, etc."
                                        className="mt-1 block w-full"
                                    />
                                    <InputError id="receiptverification-purpose-error" message={errors.purpose} className="mt-1" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="receiptverification-project" value="Project" />
                                    <SelectInput
                                        id="receiptverification-project"
                                        value={formData.project_id || ''}
                                        onChange={(e) => updateCurrentField('project_id', e.target.value)}
                                        className="mt-1 block w-full"
                                    >
                                        <option value="">No project</option>
                                        {projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}
                                    </SelectInput>
                                </div>

                                {queue[currentIndex]?.matchedExpense && (
                                    <label className="flex items-start gap-2 rounded-xl border border-amber-400/30 bg-amber-400/10 p-3 text-sm text-gray-200">
                                        <input type="checkbox" checked={updateMatched} onChange={(e) => {
                                            const checked = e.target.checked;
                                            setUpdateMatched(checked);
                                            setQueue((prev) => prev.map((entry, index) => index === currentIndex ? { ...entry, updateMatched: checked } : entry));
                                        }} className="mt-1" />
                                        <span>Update the matched expense with these receipt details</span>
                                    </label>
                                )}

                                <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
                                    <Button variant="secondary"
                                        type="button"
                                        onClick={() => { setCurrentIndex(-1); setCurrentFileId(null); }}
                                    >
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={processing}>
                                        <i aria-hidden="true" className="fas fa-check mr-1"></i>
                                        {processing ? 'Saving...' : 'Save Expense'}
                                    </Button>
                                </div>

                                {errors.save && (
                                    <div className="p-2 bg-red-500/20 border border-red-500/30 rounded-xl text-red-400 text-xs">
                                        <i aria-hidden="true" className="fas fa-exclamation-circle mr-1"></i>{errors.save}
                                    </div>
                                )}
                            </form>
                        )}
                    </div>
                </div>
            </DashboardPage>
        </AuthenticatedLayout>
    );
}
