import ResourceFormPage from '@/Components/ResourceFormPage';
import FormActions from '@/Components/FormActions';
import TextArea from '@/Components/TextArea';
import SelectInput from '@/Components/SelectInput';
import { useForm, router } from '@inertiajs/react';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';

export default function Edit({ photo, projects }) {
    const { data, setData, patch, processing, errors } = useForm({
        title: photo.title || '',
        location: photo.location || '',
        description: photo.description || '',
        project_id: photo.project_id || '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        router.patch(route('photos.update', photo.id), data, {
            onSuccess: () => router.visit(route('photos')),
        });
    };

    return (
        <ResourceFormPage
            title="Edit Photo"
            breadcrumbs={[
                { label: 'Photos', href: route('photos') },
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
                        placeholder="Enter photo title"
                    />
                    <InputError message={errors.title} className="mt-2" />
                </div>

                <div>
                    <InputLabel value="Location" />
                    <TextInput
                        value={data.location}
                        onChange={(e) => setData('location', e.target.value)}
                        className="mt-1 block w-full"
                        placeholder="Enter location"
                    />
                    <InputError message={errors.location} className="mt-2" />
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

                <div>
                    <InputLabel value="Project" />
                    <SelectInput
                        value={data.project_id}
                        onChange={(e) => setData('project_id', e.target.value)}
                    >
                        <option value="">Select a project</option>
                        {projects.map((project) => (
                            <option key={project.id} value={project.id}>
                                {project.name}
                            </option>
                        ))}
                    </SelectInput>
                    <InputError message={errors.project_id} className="mt-2" />
                </div>

                <FormActions
                    cancelHref={route('photos')}
                    submitLabel="Update Photo"
                    processing={processing}
                    loadingText="Updating..."
                />
            </form>
        </ResourceFormPage>
    );
}
