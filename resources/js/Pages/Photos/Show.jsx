import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import DetailPage, { DetailText } from '@/Components/DetailPage';
import FilePreview from '@/Components/FilePreview';
import formatDate from '@/Utils/formatDate';

/** One photo: the picture fills the page, its details sit in the side panel. */
export default function Show({ photo, can = {} }) {
    return (
        <AuthenticatedLayout>
            <DetailPage
                title={photo.title}
                subtitle={photo.project?.name || 'Photo'}
                parent={{ label: 'Photos', href: route('photos') }}
                badges={
                    photo.is_featured && (
                        <span className="rounded-full bg-yellow-500/10 px-2.5 py-0.5 text-xs font-medium text-yellow-400">
                            <i aria-hidden="true" className="fas fa-star mr-1" />
                            Featured
                        </span>
                    )
                }
                main={{ title: 'Photo', icon: 'fa-image' }}
                details={{
                    icon: 'fa-image',
                    subtitle: formatDate(photo.photo_date) || undefined,
                    rows: [
                        { label: 'Project', value: photo.project?.name },
                        { label: 'Category', value: photo.category },
                        { label: 'Location', value: photo.location },
                        { label: 'Taken', value: formatDate(photo.photo_date) },
                        { label: 'Added', value: formatDate(photo.created_at) },
                    ],
                    content: <DetailText title="Description">{photo.description}</DetailText>,
                }}
                actions={[
                    // Viewers of the project see the photo, not its Edit.
                    can.update && { id: 'edit', label: 'Edit Photo', icon: 'fa-pen', href: route('photos.edit', photo.id), variant: 'primary' },
                    photo.photo_url && { id: 'download', label: 'Download', icon: 'fa-download', href: photo.photo_url, download: true },
                    photo.project_id && { id: 'project', label: 'Open Project', icon: 'fa-folder', href: route('projects.show', photo.project_id) },
                ].filter(Boolean)}
            >
                <FilePreview url={photo.preview_url || photo.photo_url} mime="image/jpeg" name={photo.title} empty={{ icon: 'fa-image', title: 'No image', message: "This photo's file is missing." }} />
            </DetailPage>
        </AuthenticatedLayout>
    );
}
