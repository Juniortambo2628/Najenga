import ResourceForm from '@/Components/ResourceForm';
import { USER_CREATE_FIELDS } from '@/Config/schemas/user';

export default function Create() {
    return (
        <ResourceForm
            title="Create New User"
            breadcrumbs={[
                { label: 'Users', href: route('users.index') },
                { label: 'Create' },
            ]}
            schema={USER_CREATE_FIELDS}
            method="post"
            action={route('users.store')}
            cancelHref={route('users.index')}
            initialData={{ role: 'client' }}
        />
    );
}
