import ResourceForm from '@/Components/ResourceForm';
import { USER_EDIT_FIELDS } from '@/Config/schemas/user';

export default function Edit({ user }) {
    return (
        <ResourceForm
            title="Edit User"
            breadcrumbs={[
                { label: 'Users', href: route('users.index') },
                { label: 'Edit' },
            ]}
            schema={USER_EDIT_FIELDS}
            method="patch"
            action={route('users.update', user.id)}
            cancelHref={route('users.index')}
            initialData={user}
        />
    );
}
