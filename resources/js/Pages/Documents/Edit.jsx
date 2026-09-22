import ResourceFormPage from '@/Components/ResourceFormPage';
import FormActions from '@/Components/FormActions';
import TextArea from '@/Components/TextArea';
import SelectInput from '@/Components/SelectInput';
import { useForm, router } from '@inertiajs/react';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';

export default function Edit({ document: doc, projects, folders }) {
    const { data, setData, patch, processing, errors } = useForm({
        title: doc.title || '',
        description: doc.description || '',
        category: doc.document_type || '',
        document_date: doc.document_date || '',
        folder_id: doc.folder_id || '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        router.patch(route('documents.update', doc.id), data, {
            onSuccess: () => router.visit(route('documents')),
        });
    };

    return (
        <ResourceFormPage
            title="Edit Document"
            breadcrumbs={[
                { label: 'Documents', href: route('documents') },
                { label: 'Edit' },
            ]}
        >
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <InputLabel htmlFor="documents-edit-title" value="Title" />
                    <TextInput
                        id="documents-edit-title"
                        aria-invalid={!!errors.title}
                        aria-describedby={errors.title ? 'documents-edit-title-error' : undefined}
                        value={data.title}
                        onChange={(e) => setData('title', e.target.value)}
                        className="mt-1 block w-full"
                        placeholder="Enter document title"
                    />
                    <InputError id="documents-edit-title-error" message={errors.title} className="mt-2" />
                </div>

                <div>
                    <InputLabel htmlFor="documents-edit-description" value="Description" />
                    <TextArea
                        id="documents-edit-description"
                        aria-invalid={!!errors.description}
                        aria-describedby={errors.description ? 'documents-edit-description-error' : undefined}
                        value={data.description}
                        onChange={(e) => setData('description', e.target.value)}
                        rows={3}
                        placeholder="Enter description"
                    />
                    <InputError id="documents-edit-description-error" message={errors.description} className="mt-2" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <InputLabel htmlFor="documents-edit-category" value="Category" />
                        <SelectInput
                            id="documents-edit-category"
                            aria-invalid={!!errors.category}
                            aria-describedby={errors.category ? 'documents-edit-category-error' : undefined}
                            value={data.category}
                            onChange={(e) => setData('category', e.target.value)}
                        >
                            <option value="">Select category</option>
                            <option value="drawing">Drawing</option>
                            <option value="permit">Permit</option>
                            <option value="invoice">Invoice</option>
                            <option value="ticket">Ticket</option>
                            <option value="other">Other</option>
                        </SelectInput>
                        <InputError id="documents-edit-category-error" message={errors.category} className="mt-2" />
                    </div>
                    <div>
                        <InputLabel htmlFor="documents-edit-document-date" value="Document Date" />
                        <TextInput
                            id="documents-edit-document-date"
                            aria-invalid={!!errors.document_date}
                            aria-describedby={errors.document_date ? 'documents-edit-document-date-error' : undefined}
                            type="date"
                            value={data.document_date}
                            onChange={(e) => setData('document_date', e.target.value)}
                            className="mt-1 block w-full"
                        />
                        <InputError id="documents-edit-document-date-error" message={errors.document_date} className="mt-2" />
                    </div>
                </div>

                <div>
                    <InputLabel htmlFor="documents-edit-folder-id" value="Folder" />
                    <SelectInput
                        id="documents-edit-folder-id"
                        aria-invalid={!!errors.folder_id}
                        aria-describedby={errors.folder_id ? 'documents-edit-folder-id-error' : undefined}
                        value={data.folder_id}
                        onChange={(e) => setData('folder_id', e.target.value)}
                    >
                        <option value="">No folder (Root)</option>
                        {folders.map((folder) => (
                            <option key={folder.id} value={folder.id}>
                                {folder.name}
                            </option>
                        ))}
                    </SelectInput>
                    <InputError id="documents-edit-folder-id-error" message={errors.folder_id} className="mt-2" />
                </div>

                <FormActions
                    cancelHref={route('documents')}
                    submitLabel="Update Document"
                    processing={processing}
                    loadingText="Updating..."
                />
            </form>
        </ResourceFormPage>
    );
}
