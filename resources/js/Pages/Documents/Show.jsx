import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import DetailPage, { DetailText } from '@/Components/DetailPage';
import FilePreview from '@/Components/FilePreview';
import formatDate from '@/Utils/formatDate';

export function formatFileSize(bytes) {
    if (!bytes) return null;
    const units = ['B', 'KB', 'MB', 'GB'];
    let i = 0;
    let size = Number(bytes);
    while (size >= 1024 && i < units.length - 1) { size /= 1024; i++; }
    return `${size.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

/** One document: the file fills the page (a PDF or image previews), its details sit in the side panel. */
export default function Show({ document, can = {} }) {
    const fileName = document.original_name || document.filename;

    return (
        <AuthenticatedLayout>
            <DetailPage
                title={document.title}
                subtitle={document.project?.name || 'Document'}
                parent={{ label: 'Documents', href: route('documents') }}
                main={{ title: fileName || document.title, icon: 'fa-file-lines' }}
                details={{
                    icon: 'fa-file-lines',
                    subtitle: document.category || undefined,
                    rows: [
                        { label: 'Project', value: document.project?.name },
                        { label: 'Category', value: document.category },
                        { label: 'Date', value: formatDate(document.document_date) },
                        { label: 'Added', value: formatDate(document.created_at) },
                        { label: 'File', value: fileName, mono: true },
                        { label: 'Type', value: document.mime_type, mono: true },
                        { label: 'Size', value: formatFileSize(document.file_size) },
                    ],
                    content: <DetailText title="Description">{document.description}</DetailText>,
                }}
                actions={[
                    // Viewers of the project see the document, not its Edit.
                    can.update && { id: 'edit', label: 'Edit Document', icon: 'fa-pen', href: route('documents.edit', document.id), variant: 'primary' },
                    document.file_url && { id: 'download', label: 'Download', icon: 'fa-download', href: document.file_url, download: true },
                    document.project_id && { id: 'project', label: 'Open Project', icon: 'fa-folder', href: route('projects.show', document.project_id) },
                ].filter(Boolean)}
            >
                <FilePreview url={document.file_url} mime={document.mime_type} name={document.title} empty={{ icon: 'fa-file', title: 'No file', message: 'No file is attached to this document.' }} />
            </DetailPage>
        </AuthenticatedLayout>
    );
}
