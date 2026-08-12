import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { useState, useCallback } from 'react';
import axios from 'axios';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import SelectInput from '@/Components/SelectInput';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import DashboardHero from '@/Components/DashboardHero';
import { EXPENSE_CATEGORIES } from '@/Config/expenses';

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

export default function ReceiptVerification() {
    const [files, setFiles] = useState([]);
    const [queue, setQueue] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(-1);
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState({});
    const [bulkMode, setBulkMode] = useState(false);

    const [formData, setFormData] = useState({ ...emptyForm });
    const [rawText, setRawText] = useState('');
    const [currentTempPath, setCurrentTempPath] = useState('');
    const [currentFileId, setCurrentFileId] = useState(null);

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

    const analyzeOne = useCallback(async (entry, idx) => {
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
                const ext = response.data.extracted;
                const populated = {
                    title: ext.merchant || ext.recipient || 'Unknown',
                    amount: ext.total || '',
                    expense_date: ext.date || new Date().toISOString().split('T')[0],
                    time: ext.time || '',
                    recipient: ext.recipient || '',
                    payment_method: ext.payment_method || 'mobile_money',
                    reference_number: ext.reference_number || '',
                    purpose: '',
                    category: 'Materials',
                };

                setQueue(prev => prev.map((e, i) => i === idx ? {
                    ...e,
                    status: 'ready',
                    result: { extracted: ext, temp_path: response.data.temp_path },
                    formData: populated,
                    rawText: response.data.text,
                } : e));

                setFormData(populated);
                setRawText(response.data.text);
                setCurrentTempPath(response.data.temp_path);
                setCurrentFileId(entry.id);

                // Check for matching expenses after OCR
                if (populated.reference_number) {
                    try {
                        const matchResponse = await axios.get('/receipts/match', {
                            ...getAxiosConfig(),
                            params: {
                                reference_number: populated.reference_number,
                                date: populated.expense_date,
                                time: populated.time,
                            }
                        });
                        if (matchResponse.data.matched) {
                            const matchedExpense = matchResponse.data.expense;
                            setQueue(prev => prev.map((e, i) => i === idx ? {
                                ...e,
                                matchedExpense: matchedExpense,
                            } : e));
                        }
                    } catch (err) {
                        // Silently fail - matching is optional
                    }
                }
            } else {
                setQueue(prev => prev.map((e, i) => i === idx ? {
                    ...e,
                    status: 'error',
                    result: null,
                } : e));
                setErrors({ analysis: response.data.message || 'OCR failed' });
            }
        } catch (error) {
            const msg = error.response?.data?.message || 'Failed to analyze receipt.';
            setQueue(prev => prev.map((e, i) => i === idx ? {
                ...e,
                status: 'error',
                result: null,
            } : e));
            setErrors({ analysis: msg });
        } finally {
            setProcessing(false);
        }
    }, []);

    const analyzeAll = async () => {
        setProcessing(true);
        setErrors({});

        const pending = queue.filter(e => e.status === 'pending');
        for (let i = 0; i < queue.length; i++) {
            if (queue[i].status === 'pending') {
                await analyzeOne(queue[i], i);
            }
        }
        setProcessing(false);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setProcessing(true);
        setErrors({});

        try {
            await axios.post('/receipts/store', {
                ...formData,
                temp_path: currentTempPath,
            }, getAxiosConfig());

            setQueue(prev => prev.map(entry =>
                entry.id === currentFileId ? { ...entry, status: 'saved' } : entry
            ));

            setFormData({ ...emptyForm });
            setRawText('');
            setCurrentTempPath('');
            setCurrentFileId(null);

            const nextPending = queue.findIndex((e, i) => e.status === 'pending' && e.id !== currentFileId);
            if (nextPending >= 0) {
                selectEntry(nextPending);
            }
        } catch (error) {
            const validationErrors = error.response?.data?.errors;
            if (validationErrors) {
                setErrors(validationErrors);
            } else {
                setErrors({ save: 'Failed to save expense.' });
            }
        } finally {
            setProcessing(false);
        }
    };

    const handleSaveAll = async () => {
        setProcessing(true);
        setErrors({});

        const readyEntries = queue.filter(e => e.status === 'ready');
        if (readyEntries.length === 0) {
            setErrors({ save: 'No receipts to save.' });
            setProcessing(false);
            return;
        }

        const expenses = readyEntries.map(e => ({
            ...e.formData,
            temp_path: e.result.temp_path,
            ocr_source: e.result.extracted ? 'local-tesseract' : 'unknown',
        }));

        try {
            const response = await axios.post('/receipts/store-bulk', { expenses }, getAxiosConfig());

            const savedIds = new Set((response.data.saved || []).map(s => s.index));
            setQueue(prev => prev.map((entry, i) => {
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
        } catch (error) {
            setErrors({ save: 'Bulk save failed.' });
        } finally {
            setProcessing(false);
        }
    };

    const selectEntry = (idx) => {
        const entry = queue[idx];
        if (!entry) return;
        setCurrentIndex(idx);
        setCurrentFileId(entry.id);
        if (entry.formData) setFormData(entry.formData);
        if (entry.rawText) setRawText(entry.rawText);
        if (entry.result?.temp_path) setCurrentTempPath(entry.result.temp_path);
    };

    const updateCurrentField = (field, value) => {
        const updated = { ...formData, [field]: value };
        setFormData(updated);
        setQueue(prev => prev.map((e, i) => i === currentIndex ? { ...e, formData: updated } : e));
    };

    const pendingCount = queue.filter(e => e.status === 'pending').length;
    const readyCount = queue.filter(e => e.status === 'ready').length;
    const savedCount = queue.filter(e => e.status === 'saved').length;

    return (
        <AuthenticatedLayout>
            <Head title="Receipt Verification" />

            <div className="max-w-7xl mx-auto">
                <DashboardHero
                    title="Receipt Verification"
                    subtitle="Upload and verify receipts with OCR"
                    breadcrumbs={[
                        { label: 'Home', href: '/home' },
                        { label: 'Dashboard', href: '/dashboard' },
                        { label: 'Receipt Verification' },
                    ]}
                />

                {queue.length > 0 && (
                    <div className="flex items-center gap-3 text-sm text-gray-400 mb-6">
                        <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded">{pendingCount} pending</span>
                        <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded">{readyCount} ready</span>
                        <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded">{savedCount} saved</span>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left: Upload + Queue */}
                    <div className="space-y-4">
                        {/* Upload Zone */}
                        <div className="bg-black/50 border border-white/10 rounded-2xl p-6 backdrop-blur-sm min-h-[200px] flex flex-col items-center justify-center relative overflow-hidden">
                            <div className="text-center text-gray-400">
                                <i className="fas fa-cloud-upload-alt text-5xl mb-3 text-gray-600"></i>
                                <p className="text-sm">Click or drag to upload receipts</p>
                                <p className="text-xs text-gray-600 mt-1">Supports JPG, PNG, PDF (max 100MB each)</p>
                            </div>
                            <input
                                type="file"
                                accept="image/*,.pdf"
                                multiple
                                onChange={handleFileChange}
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
                                            <><i className="fas fa-spinner fa-spin mr-1"></i> Analyzing...</>
                                        ) : (
                                            <><i className="fas fa-bolt mr-1"></i> Analyze All ({pendingCount})</>
                                        )}
                                    </button>
                                )}
                                {readyCount > 0 && (
                                    <button
                                        onClick={handleSaveAll}
                                        disabled={processing}
                                        className="flex-1 py-2 bg-green-600 text-white rounded-xl font-bold text-sm hover:bg-green-700 transition disabled:opacity-50"
                                    >
                                        <i className="fas fa-save mr-1"></i> Save All ({readyCount})
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
                                    <img src={entry.preview} alt="" className="w-10 h-10 rounded object-cover flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-white truncate text-xs">{entry.file.name}</p>
                                        <p className={`text-xs ${
                                            entry.status === 'saved' ? 'text-green-400' :
                                            entry.status === 'ready' ? 'text-blue-400' :
                                            entry.status === 'error' ? 'text-red-400' :
                                            'text-gray-500'
                                        }`}>
                                            {entry.status === 'pending' && 'Waiting...'}
                                            {entry.status === 'ready' && `Ready - ${entry.formData?.recipient || 'No recipient'}`}
                                            {entry.status === 'saved' && 'Saved'}
                                            {entry.status === 'error' && 'Failed'}
                                        </p>
                                    </div>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); removeFromFileQueue(entry.id); }}
                                        className="text-gray-500 hover:text-red-400 text-xs"
                                    >
                                        <i className="fas fa-times"></i>
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
                                        <img src={queue[currentIndex].preview} alt="Receipt Preview" className="w-full max-h-[400px] object-contain rounded-lg" />
                                    )}
                                </div>

                                {queue[currentIndex].status === 'pending' && (
                                    <button
                                        onClick={() => analyzeOne(queue[currentIndex], currentIndex)}
                                        disabled={processing}
                                        className="w-full py-3 bg-gradient-to-r from-[rgb(139,0,0)] to-[rgb(220,20,60)] text-white rounded-xl font-bold text-sm hover:opacity-90 transition disabled:opacity-50"
                                    >
                                        {processing ? (
                                            <><i className="fas fa-spinner fa-spin mr-2"></i> Analyzing...</>
                                        ) : (
                                            <><i className="fas fa-bolt mr-2"></i> Analyze This Receipt</>
                                        )}
                                    </button>
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
                                <div className="text-center text-gray-500">
                                    <i className="fas fa-image text-4xl mb-3"></i>
                                    <p>Select a receipt to preview</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right: Edit Form */}
                    <div className="bg-black/40 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
                        <h2 className="text-lg font-bold text-white mb-4 border-b border-white/10 pb-3">Extracted Details</h2>

                        {currentIndex < 0 || !queue[currentIndex] || queue[currentIndex].status === 'pending' ? (
                            <div className="text-center text-gray-500 py-8">
                                <i className="fas fa-list-alt text-3xl mb-2"></i>
                                <p className="text-sm">Upload and analyze a receipt to see details</p>
                            </div>
                        ) : queue[currentIndex].status === 'error' ? (
                            <div className="text-center text-red-400 py-8">
                                <i className="fas fa-exclamation-triangle text-3xl mb-2"></i>
                                <p className="text-sm">Failed to analyze this receipt</p>
                                {errors.analysis && <p className="text-xs mt-2">{errors.analysis}</p>}
                            </div>
                        ) : queue[currentIndex].status === 'saved' ? (
                            <div className="text-center text-green-400 py-8">
                                <i className="fas fa-check-circle text-3xl mb-2"></i>
                                <p className="text-sm">Expense saved successfully</p>
                            </div>
                        ) : (
                            <form onSubmit={handleSave} className="space-y-3">
                                {/* Recipient */}
                                <div>
                                    <InputLabel value="Recipient" />
                                    <TextInput
                                        value={formData.recipient}
                                        onChange={(e) => updateCurrentField('recipient', e.target.value)}
                                        placeholder="KISUMU CONCRETE PRODUCTS PLC"
                                        className="mt-1 block w-full"
                                    />
                                    <InputError message={errors.recipient} className="mt-1" />
                                </div>

                                {/* Purpose / Merchant */}
                                <div>
                                    <InputLabel value="Purpose / Merchant" />
                                    <TextInput
                                        value={formData.title}
                                        onChange={(e) => updateCurrentField('title', e.target.value)}
                                        placeholder="ACCURATE BRIGHTONE ENGINEERS, etc."
                                        className="mt-1 block w-full"
                                    />
                                    <InputError message={errors.title} className="mt-1" />
                                </div>

                                {/* Date + Time */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <InputLabel value="Date" />
                                        <TextInput
                                            type="date"
                                            value={formData.expense_date}
                                            onChange={(e) => updateCurrentField('expense_date', e.target.value)}
                                            className="mt-1 block w-full"
                                        />
                                        <InputError message={errors.expense_date} className="mt-1" />
                                    </div>
                                    <div>
                                        <InputLabel value="Time" />
                                        <TextInput
                                            type="text"
                                            value={formData.time}
                                            onChange={(e) => updateCurrentField('time', e.target.value)}
                                            placeholder="03:41 PM"
                                            className="mt-1 block w-full"
                                        />
                                        <InputError message={errors.time} className="mt-1" />
                                    </div>
                                </div>

                                {/* Amount + Reference */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <InputLabel value="Amount" />
                                        <TextInput
                                            type="number"
                                            step="0.01"
                                            value={formData.amount}
                                            onChange={(e) => updateCurrentField('amount', e.target.value)}
                                            placeholder="0.00"
                                            className="mt-1 block w-full"
                                        />
                                        <InputError message={errors.amount} className="mt-1" />
                                    </div>
                                    <div>
                                        <InputLabel value="Reference" />
                                        <TextInput
                                            value={formData.reference_number}
                                            onChange={(e) => updateCurrentField('reference_number', e.target.value)}
                                            placeholder="UGGSG3I38V"
                                            className="mt-1 block w-full"
                                        />
                                        <InputError message={errors.reference_number} className="mt-1" />
                                    </div>
                                </div>

                                {/* Payment Method + Category */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <InputLabel value="Payment Method" />
                                        <SelectInput
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
                                        <InputError message={errors.payment_method} className="mt-1" />
                                    </div>
                                    <div>
                                        <InputLabel value="Category" />
                                        <SelectInput
                                            value={formData.category}
                                            onChange={(e) => updateCurrentField('category', e.target.value)}
                                            className="mt-1 block w-full"
                                        >
                                            {CATEGORIES.map((cat) => (
                                                <option key={cat} value={cat}>{cat}</option>
                                            ))}
                                        </SelectInput>
                                        <InputError message={errors.category} className="mt-1" />
                                    </div>
                                </div>

                                {/* Matched Expense Indicator */}
                                {queue[currentIndex]?.matchedExpense && (
                                    <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-xl">
                                        <div className="flex items-center gap-2 text-green-400 text-sm font-medium">
                                            <i className="fas fa-link"></i>
                                            <span>Matched to existing expense</span>
                                        </div>
                                        <p className="text-xs text-gray-400 mt-1">
                                            {queue[currentIndex].matchedExpense.title} &mdash; KES {Number(queue[currentIndex].matchedExpense.amount).toLocaleString()} ({queue[currentIndex].matchedExpense.expense_date})
                                        </p>
                                    </div>
                                )}

                                {/* Purpose */}
                                <div>
                                    <InputLabel value="Purpose of Payment" />
                                    <TextInput
                                        value={formData.purpose}
                                        onChange={(e) => updateCurrentField('purpose', e.target.value)}
                                        placeholder="Construction materials, salary payment, etc."
                                        className="mt-1 block w-full"
                                    />
                                    <InputError message={errors.purpose} className="mt-1" />
                                </div>

                                <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
                                    <SecondaryButton
                                        type="button"
                                        onClick={() => { setCurrentIndex(-1); setCurrentFileId(null); }}
                                    >
                                        Cancel
                                    </SecondaryButton>
                                    <PrimaryButton type="submit" disabled={processing}>
                                        <i className="fas fa-check mr-1"></i>
                                        {processing ? 'Saving...' : 'Save Expense'}
                                    </PrimaryButton>
                                </div>

                                {errors.save && (
                                    <div className="p-2 bg-red-500/20 border border-red-500/30 rounded-xl text-red-400 text-xs">
                                        <i className="fas fa-exclamation-circle mr-1"></i>{errors.save}
                                    </div>
                                )}
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
