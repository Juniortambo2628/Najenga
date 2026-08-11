import { useState, useEffect, useCallback, useMemo } from 'react';
import Modal from '@/Components/Modal';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import SelectInput from '@/Components/SelectInput';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import { EXPENSE_CATEGORIES, PAYMENT_METHODS, PAYMENT_LABELS } from '@/Config/expenses';
import { formatCurrency } from '@/Config/currencies';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import toast from 'react-hot-toast';

function DetailRow({ label, value, mono = false }) {
    return (
        <div className="flex flex-col gap-1">
            <span className="text-[11px] font-bold tracking-widest text-gray-500 uppercase">{label}</span>
            <span className={`text-sm text-white ${mono ? 'font-mono' : ''}`}>{value || '—'}</span>
        </div>
    );
}

function DetailsTab({ expense, editing, formData, setFormData, errors, setErrors, projects, onSave, onCancel, saving, onStartEdit }) {
    const handleChange = (field) => (e) => {
        setFormData((prev) => ({ ...prev, [field]: e.target.value }));
        setErrors((prev) => ({ ...prev, [field]: undefined }));
    };

    if (!editing) {
        return (
            <div className="space-y-6">
                <div className="flex justify-end">
                    <PrimaryButton onClick={onStartEdit} className="text-xs">
                        <i className="fas fa-edit mr-1"></i>Edit
                    </PrimaryButton>
                </div>
                <div className="grid grid-cols-2 gap-5">
                    <DetailRow label="Title" value={expense?.title} />
                    <DetailRow label="Recipient" value={expense?.recipient} />
                </div>
                <div className="grid grid-cols-3 gap-5">
                    <DetailRow label="Amount" value={expense ? formatCurrency(expense.amount) : '—'} mono />
                    <DetailRow label="Category" value={expense?.category} />
                    <DetailRow label="Payment Method" value={expense?.payment_method ? (PAYMENT_LABELS[expense.payment_method] || expense.payment_method) : null} />
                </div>
                <div className="grid grid-cols-3 gap-5">
                    <DetailRow label="Date" value={expense?.expense_date} mono />
                    <DetailRow label="Time" value={expense?.time} mono />
                    <DetailRow label="Reference" value={expense?.reference_number} mono />
                </div>
                <div className="grid grid-cols-2 gap-5">
                    <DetailRow label="Project" value={expense?.project_name} />
                    <DetailRow label="Purpose" value={expense?.purpose} />
                </div>
                {expense?.description && (
                    <div>
                        <span className="text-[11px] font-bold tracking-widest text-gray-500 uppercase">Description</span>
                        <p className="mt-1 text-sm text-gray-300 whitespace-pre-wrap">{expense.description}</p>
                    </div>
                )}
                <div className="grid grid-cols-2 gap-5 pt-2 border-t border-white/10">
                    <DetailRow label="Status" value={expense?.status} />
                    <DetailRow label="Created" value={expense?.created_at ? new Date(expense.created_at).toLocaleDateString() : null} />
                </div>
            </div>
        );
    }

    return (
        <form onSubmit={(e) => { e.preventDefault(); onSave(); }} className="space-y-4">
            <div>
                <InputLabel htmlFor="ed-title" value="Title" />
                <TextInput id="ed-title" value={formData.title} onChange={handleChange('title')} className="mt-1 block w-full" />
                <InputError message={errors.title} className="mt-1" />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <InputLabel htmlFor="ed-amount" value="Amount" />
                    <TextInput id="ed-amount" type="number" min="0" step="0.01" value={formData.amount} onChange={handleChange('amount')} className="mt-1 block w-full" />
                    <InputError message={errors.amount} className="mt-1" />
                </div>
                <div>
                    <InputLabel htmlFor="ed-expense_date" value="Date" />
                    <TextInput id="ed-expense_date" type="date" value={formData.expense_date} onChange={handleChange('expense_date')} className="mt-1 block w-full" />
                    <InputError message={errors.expense_date} className="mt-1" />
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <InputLabel htmlFor="ed-recipient" value="Recipient" />
                    <TextInput id="ed-recipient" value={formData.recipient} onChange={handleChange('recipient')} className="mt-1 block w-full" />
                </div>
                <div>
                    <InputLabel htmlFor="ed-time" value="Time" />
                    <TextInput id="ed-time" value={formData.time} onChange={handleChange('time')} className="mt-1 block w-full" placeholder="e.g. 10:30 AM" />
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <InputLabel htmlFor="ed-category" value="Category" />
                    <SelectInput id="ed-category" value={formData.category} onChange={handleChange('category')} className="mt-1 block w-full">
                        <option value="">Select category</option>
                        {EXPENSE_CATEGORIES.map((cat) => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </SelectInput>
                    <InputError message={errors.category} className="mt-1" />
                </div>
                <div>
                    <InputLabel htmlFor="ed-payment_method" value="Payment Method" />
                    <SelectInput id="ed-payment_method" value={formData.payment_method} onChange={handleChange('payment_method')} className="mt-1 block w-full">
                        <option value="">Select method</option>
                        {PAYMENT_METHODS.map((m) => (
                            <option key={m.value} value={m.value}>{m.label}</option>
                        ))}
                    </SelectInput>
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <InputLabel htmlFor="ed-reference_number" value="Reference Number" />
                    <TextInput id="ed-reference_number" value={formData.reference_number} onChange={handleChange('reference_number')} className="mt-1 block w-full" />
                </div>
                <div>
                    <InputLabel htmlFor="ed-project_id" value="Project" />
                    <SelectInput id="ed-project_id" value={formData.project_id} onChange={handleChange('project_id')} className="mt-1 block w-full">
                        <option value="">No project</option>
                        {projects.map((p) => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                    </SelectInput>
                </div>
            </div>
            <div>
                <InputLabel htmlFor="ed-purpose" value="Purpose" />
                <TextInput id="ed-purpose" value={formData.purpose} onChange={handleChange('purpose')} className="mt-1 block w-full" />
            </div>
            <div>
                <InputLabel htmlFor="ed-description" value="Description" />
                <textarea id="ed-description" value={formData.description} onChange={handleChange('description')} rows={3} className="mt-1 block w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#8B0000] focus:ring-1 focus:ring-[#8B0000]/50 resize-none" />
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <SecondaryButton type="button" onClick={onCancel}>Cancel</SecondaryButton>
                <PrimaryButton type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</PrimaryButton>
            </div>
        </form>
    );
}

function ReceiptTab({ expense, onReceiptUpdate }) {
    const [uploading, setUploading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState(expense?.receipt_url || null);

    useEffect(() => {
        setPreviewUrl(expense?.receipt_url || null);
    }, [expense?.receipt_url]);

    const onDrop = useCallback(async (acceptedFiles) => {
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
                if (onReceiptUpdate) onReceiptUpdate(res.data);
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Upload failed');
        }
        setUploading(false);
    }, [expense?.id, onReceiptUpdate]);

    const handleRemove = async () => {
        if (!confirm('Remove this receipt?')) return;
        try {
            await axios.delete(`/expenses/${expense.id}/receipt`);
            setPreviewUrl(null);
            toast.success('Receipt removed');
            if (onReceiptUpdate) onReceiptUpdate({ receipt_url: null });
        } catch {
            toast.error('Failed to remove receipt');
        }
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.webp'], 'application/pdf': ['.pdf'] },
        maxFiles: 1,
    });

    return (
        <div className="space-y-5">
            {previewUrl ? (
                <div className="space-y-4">
                    <div className="rounded-xl overflow-hidden border border-white/10 bg-black/50 flex items-center justify-center min-h-[300px]">
                        {previewUrl.endsWith('.pdf') ? (
                            <iframe src={previewUrl} className="w-full h-[400px]" title="Receipt" />
                        ) : (
                            <img src={previewUrl} alt="Receipt" className="max-w-full max-h-[400px] object-contain" />
                        )}
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">Current receipt attached to this expense</span>
                        <div className="flex gap-2">
                            <SecondaryButton onClick={handleRemove} className="text-xs">
                                <i className="fas fa-trash mr-1"></i>Remove
                            </SecondaryButton>
                            <PrimaryButton onClick={() => document.getElementById('receipt-replace-input')?.click()} className="text-xs" disabled={uploading}>
                                <i className="fas fa-exchange-alt mr-1"></i>Replace
                            </PrimaryButton>
                            <input id="receipt-replace-input" type="file" accept="image/*,.pdf" className="hidden" onChange={(e) => { if (e.target.files?.[0]) onDrop([e.target.files[0]]); e.target.value = ''; }} />
                        </div>
                    </div>
                </div>
            ) : (
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
            )}
        </div>
    );
}

function ActivityTab({ expense }) {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!expense?.id) return;
        setLoading(true);
        axios.get(`/api/activity-logs?subject_type=App\\Models\\Expense&subject_id=${expense.id}`)
            .then((res) => setLogs(res.data?.data || res.data || []))
            .catch(() => setLogs([]))
            .finally(() => setLoading(false));
    }, [expense?.id]);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-gray-400 text-sm">Loading activity...</div>
            </div>
        );
    }

    if (logs.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                <i className="fas fa-history text-3xl mb-3 text-gray-600"></i>
                <p className="text-sm">No activity recorded for this expense.</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {logs.map((log, i) => (
                <div key={log.id || i} className="flex gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5">
                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <i className="fas fa-pen text-[10px] text-gray-400"></i>
                    </div>
                    <div className="min-w-0">
                        <p className="text-sm text-gray-300">{log.description || log.event || 'Activity'}</p>
                        <p className="text-xs text-gray-500 mt-1">
                            {log.created_at ? new Date(log.created_at).toLocaleString() : ''}
                            {log.user?.name ? ` — ${log.user.name}` : ''}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default function ExpenseDetailModal({ show, onClose, expense, projects = [], onUpdate }) {
    const [activeTab, setActiveTab] = useState(0);
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({});
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (show) {
            setActiveTab(0);
            setEditing(false);
            setErrors({});
            if (expense) {
                setFormData({
                    title: expense.title || '',
                    amount: expense.amount || '',
                    category: expense.category || '',
                    project_id: expense.project_id || '',
                    expense_date: expense.expense_date || '',
                    description: expense.description || '',
                    payment_method: expense.payment_method || '',
                    recipient: expense.recipient || '',
                    time: expense.time || '',
                    reference_number: expense.reference_number || '',
                    purpose: expense.purpose || '',
                });
            }
        }
    }, [show, expense]);

    const handleSave = async () => {
        setSaving(true);
        setErrors({});
        try {
            await axios.patch(`/expenses/${expense.id}`, { ...formData, amount: Number(formData.amount) });
            toast.success('Expense updated');
            setEditing(false);
            if (onUpdate) onUpdate();
        } catch (err) {
            if (err.response?.status === 422) {
                setErrors(err.response.data.errors || {});
            } else {
                toast.error('Failed to update expense');
            }
        }
        setSaving(false);
    };

    const handleReceiptUpdate = () => {
        if (onUpdate) onUpdate();
    };

    const tabs = useMemo(() => [
        {
            label: 'Details',
            icon: 'fa-receipt',
            content: (
                <DetailsTab
                    expense={expense}
                    editing={editing}
                    formData={formData}
                    setFormData={setFormData}
                    errors={errors}
                    setErrors={setErrors}
                    projects={projects}
                    onSave={handleSave}
                    onCancel={() => { setEditing(false); setErrors({}); }}
                    saving={saving}
                    onStartEdit={() => setEditing(true)}
                />
            ),
        },
        {
            label: 'Receipt',
            icon: 'fa-file-image',
            content: <ReceiptTab expense={expense} onReceiptUpdate={handleReceiptUpdate} />,
        },
        {
            label: 'Activity',
            icon: 'fa-history',
            content: <ActivityTab expense={expense} />,
        },
    ], [expense, editing, formData, errors, projects, saving]);

    return (
        <Modal
            show={show}
            onClose={onClose}
            maxWidth="3xl"
            tabs={tabs}
            title={expense?.title || 'Expense'}
            subtitle={editing ? 'Edit Expense' : 'View Expense'}
        />
    );
}
