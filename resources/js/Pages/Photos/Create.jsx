import FileUploadForm from '@/Components/FileUploadForm';

export default function Create({ projects }) {
    return (
        <FileUploadForm
            title="Upload Photos"
            breadcrumbs={[
                { label: 'Photos', href: route('photos') },
                { label: 'Upload' },
            ]}
            accept="image/*"
            hint="Supports multiple image files"
            submitLabel="Upload Photos"
            storeRoute="photos.store"
            filesKey="photos"
            projects={projects}
        />
    );
}
