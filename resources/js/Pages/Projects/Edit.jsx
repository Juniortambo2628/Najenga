import ResourceForm from '@/Components/ResourceForm';
import { PROJECT_FIELDS } from '@/Config/schemas/project';

export default function Edit({ project }) {
    return (
        <ResourceForm
            title={`Edit ${project.name}`}
            breadcrumbs={[
                { label: 'Overview', href: route('overview') },
                { label: project.name, href: route('overview', { project: project.id }) },
                { label: 'Edit' },
            ]}
            schema={PROJECT_FIELDS}
            method="patch"
            action={route('projects.update', project.id)}
            cancelHref={route('overview')}
            initialData={project}
        />
    );
}
