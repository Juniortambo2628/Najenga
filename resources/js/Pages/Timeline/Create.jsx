import ResourceForm from '@/Components/ResourceForm';
import { TIMELINE_FIELDS } from '@/Config/schemas/timeline';

export default function Create({ projects }) {
    return (
        <ResourceForm
            title="Add Milestone"
            breadcrumbs={[
                { label: 'Timeline', href: route('timeline') },
                { label: 'Create' },
            ]}
            schema={TIMELINE_FIELDS}
            method="post"
            action={route('timelines.store')}
            cancelHref={route('timeline')}
            initialData={{ status: 'pending' }}
        />
    );
}
