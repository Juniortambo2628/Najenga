import ResourceForm from '@/Components/ResourceForm';
import { PROJECT_FIELDS } from '@/Config/schemas/project';

export default function Create() {
    return (
        <ResourceForm
            title="Create New Project"
            breadcrumbs={[
                { label: 'Projects', href: route('projects') },
                { label: 'Create' },
            ]}
            schema={PROJECT_FIELDS}
            method="post"
            action={route('projects.store')}
            cancelHref={route('projects')}
            initialData={{ status: 'planning', currency: 'KES' }}
        />
    );
}
