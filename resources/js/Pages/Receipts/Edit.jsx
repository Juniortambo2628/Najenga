import ResourceFormPage from '@/Components/ResourceFormPage';
import FormActions from '@/Components/FormActions';
import SelectInput from '@/Components/SelectInput';
import { useForm, router } from '@inertiajs/react';

export default function Edit({ receipt }) {
    const { data, setData, patch, processing } = useForm({
        verification_status: receipt.verification_status || 'pending',
        needs_verification: receipt.needs_verification || false,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        router.patch(route('receipts.update', receipt.id), data, {
            onSuccess: () => router.visit(route('receipts.index')),
        });
    };

    return (
        <ResourceFormPage
            title="Edit Receipt"
            breadcrumbs={[
                { label: 'Receipts', href: route('receipts.index') },
                { label: 'Edit' },
            ]}
        >
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Verification Status</label>
                    <SelectInput
                        value={data.verification_status}
                        onChange={(e) => setData('verification_status', e.target.value)}
                    >
                        <option value="pending">Pending</option>
                        <option value="verified">Verified</option>
                        <option value="rejected">Rejected</option>
                        <option value="auto_verified">Auto Verified</option>
                    </SelectInput>
                </div>

                <div className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        id="needs_verification"
                        checked={data.needs_verification}
                        onChange={(e) => setData('needs_verification', e.target.checked)}
                        className="rounded border-white/20 bg-white/5 text-[#8B0000] focus:ring-[#8B0000]"
                    />
                    <label htmlFor="needs_verification" className="text-sm text-gray-300">
                        Needs manual verification
                    </label>
                </div>

                <div className="border-t border-white/10 pt-4 mt-4">
                    <h3 className="text-sm font-medium text-gray-400 mb-2">Receipt Details</h3>
                    <dl className="grid grid-cols-2 gap-3 text-sm">
                        <dt className="text-gray-500">Expense:</dt>
                        <dd className="text-gray-300">{receipt.expense?.title ?? 'N/A'}</dd>
                        <dt className="text-gray-500">Amount:</dt>
                        <dd className="text-gray-300">KES {receipt.expense?.amount ?? '0.00'}</dd>
                        <dt className="text-gray-500">OCR Confidence:</dt>
                        <dd className="text-gray-300">{receipt.ocr_confidence ? `${receipt.ocr_confidence}%` : 'N/A'}</dd>
                        <dt className="text-gray-500">Extracted Merchant:</dt>
                        <dd className="text-gray-300">{receipt.extracted_merchant ?? 'N/A'}</dd>
                        <dt className="text-gray-500">Extracted Amount:</dt>
                        <dd className="text-gray-300">{receipt.extracted_amount ? `KES ${receipt.extracted_amount}` : 'N/A'}</dd>
                        <dt className="text-gray-500">Extracted Date:</dt>
                        <dd className="text-gray-300">{receipt.extracted_date ?? 'N/A'}</dd>
                    </dl>
                </div>

                <FormActions
                    cancelHref={route('receipts.index')}
                    submitLabel="Update Receipt"
                    processing={processing}
                    loadingText="Updating..."
                />
            </form>
        </ResourceFormPage>
    );
}
