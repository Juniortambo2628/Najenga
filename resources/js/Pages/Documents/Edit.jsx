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
                    <InputLabel value="Title" />
                    <TextInput
                        value={data.title}
                        onChange={(e) => setData('title', e.target.value)}
                        className="mt-1 block w-full"
                        placeholder="Enter document title"
                    />
                    <InputError message={errors.title} className="mt-2" />
                </div>

                <div>
                    <InputLabel value="Description" />
                    <TextArea
                        value={data.description}
                        onChange={(e) => setData('description', e.target.value)}
                        rows={3}
                        placeholder="Enter description"
                    />
                    <InputError message={errors.description} className="mt-2" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <InputLabel value="Category" />
                        <SelectInput
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
                        <InputError message={errors.category} className="mt-2" />
                    </div>
                    <div>
                        <InputLabel value="Document Date" />
                        <TextInput
                            type="date"
                            value={data.document_date}
                            onChange={(e) => setData('document_date', e.target.value)}
                            className="mt-1 block w-full"
                        />
                        <InputError message={errors.document_date} className="mt-2" />
                    </div>
                </div>

                <div>
                    <InputLabel value="Folder" />
                    <SelectInput
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
                    <InputError message={errors.folder_id} className="mt-2" />
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
