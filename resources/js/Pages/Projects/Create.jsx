import ResourceForm from '@/Components/ResourceForm';
import { PROJECT_FIELDS } from '@/Config/schemas/project';

export default function Create() {
    return (
        <ResourceForm
            title="Create New Project"
            breadcrumbs={[
                { label: 'Overview', href: route('overview') },
                { label: 'Create' },
            ]}
            schema={PROJECT_FIELDS}
            method="post"
            action={route('projects.store')}
            cancelHref={route('overview')}
            initialData={{ status: 'planning', currency: 'KES' }}
        />
    );
}
