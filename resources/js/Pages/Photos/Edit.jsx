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
                    <InputLabel htmlFor="photos-edit-title" value="Title" />
                    <TextInput
                        id="photos-edit-title"
                        aria-invalid={!!errors.title}
                        aria-describedby={errors.title ? 'photos-edit-title-error' : undefined}
                        value={data.title}
                        onChange={(e) => setData('title', e.target.value)}
                        className="mt-1 block w-full"
                        placeholder="Enter photo title"
                    />
                    <InputError id="photos-edit-title-error" message={errors.title} className="mt-2" />
                </div>

                <div>
                    <InputLabel htmlFor="photos-edit-location" value="Location" />
                    <TextInput
                        id="photos-edit-location"
                        aria-invalid={!!errors.location}
                        aria-describedby={errors.location ? 'photos-edit-location-error' : undefined}
                        value={data.location}
                        onChange={(e) => setData('location', e.target.value)}
                        className="mt-1 block w-full"
                        placeholder="Enter location"
                    />
                    <InputError id="photos-edit-location-error" message={errors.location} className="mt-2" />
                </div>

                <div>
                    <InputLabel htmlFor="photos-edit-description" value="Description" />
                    <TextArea
                        id="photos-edit-description"
                        aria-invalid={!!errors.description}
                        aria-describedby={errors.description ? 'photos-edit-description-error' : undefined}
                        value={data.description}
                        onChange={(e) => setData('description', e.target.value)}
                        rows={3}
                        placeholder="Enter description"
                    />
                    <InputError id="photos-edit-description-error" message={errors.description} className="mt-2" />
                </div>

                <div>
                    <InputLabel htmlFor="photos-edit-project-id" value="Project" />
                    <SelectInput
                        id="photos-edit-project-id"
                        aria-invalid={!!errors.project_id}
                        aria-describedby={errors.project_id ? 'photos-edit-project-id-error' : undefined}
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
                    <InputError id="photos-edit-project-id-error" message={errors.project_id} className="mt-2" />
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
