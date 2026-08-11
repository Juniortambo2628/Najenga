import FileUploadForm from '@/Components/FileUploadForm';

export default function Create({ projects }) {
    return (
        <FileUploadForm
            title="Upload Documents"
            breadcrumbs={[
                { label: 'Documents', href: route('documents') },
                { label: 'Upload' },
            ]}
            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
            hint="PDF, Word, Excel and other file types"
            submitLabel="Upload Documents"
            storeRoute="documents.store"
            filesKey="documents"
            projects={projects}
        />
    );
}
