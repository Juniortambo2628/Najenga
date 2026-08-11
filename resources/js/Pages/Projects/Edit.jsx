import ResourceForm from '@/Components/ResourceForm';
import { PROJECT_FIELDS } from '@/Config/schemas/project';

export default function Edit({ project }) {
    return (
        <ResourceForm
            title={`Edit ${project.name}`}
            breadcrumbs={[
                { label: 'Projects', href: route('projects') },
                { label: project.name, href: route('projects.show', project.id) },
                { label: 'Edit' },
            ]}
            schema={PROJECT_FIELDS}
            method="patch"
            action={route('projects.update', project.id)}
            cancelHref={route('projects.show', project.id)}
            initialData={project}
        />
    );
}
