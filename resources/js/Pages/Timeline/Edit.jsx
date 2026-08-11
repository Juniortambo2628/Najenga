import ResourceForm from '@/Components/ResourceForm';
import { TIMELINE_FIELDS } from '@/Config/schemas/timeline';

export default function Edit({ timeline }) {
    return (
        <ResourceForm
            title={`Edit ${timeline.title}`}
            breadcrumbs={[
                { label: 'Timeline', href: route('timeline') },
                { label: timeline.title },
            ]}
            schema={TIMELINE_FIELDS}
            method="patch"
            action={route('timelines.update', timeline.id)}
            cancelHref={route('timeline')}
            initialData={timeline}
        />
    );
}
