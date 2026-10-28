import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import DetailPage from '@/Components/DetailPage';
import StatusBadge, { formatStatus } from '@/Components/StatusBadge';
import formatDate from '@/Utils/formatDate';

/** One person: what they've added as summary cards, their profile beneath. */
export default function Show({ user, can = {} }) {
    const name = [user.first_name, user.last_name].filter(Boolean).join(' ') || user.name || user.email;

    return (
        <AuthenticatedLayout>
            <DetailPage
                title={name}
                subtitle={user.email}
                parent={{ label: 'Users', href: route('users.index') }}
                badges={
                    <div className="flex gap-2">
                        {user.role && <StatusBadge status={user.role} />}
                        {user.status && <StatusBadge status={user.status} />}
                    </div>
                }
                summary={[
                    { label: 'Projects', value: user.projects_count ?? 0, icon: 'fa-folder' },
                    { label: 'Expenses', value: user.expenses_count ?? 0, icon: 'fa-receipt' },
                    { label: 'Photos', value: user.photos_count ?? 0, icon: 'fa-image' },
                    { label: 'Documents', value: user.documents_count ?? 0, icon: 'fa-file-lines' },
                ]}
                details={{
                    title: 'Profile',
                    icon: 'fa-id-card',
                    rows: [
                        { label: 'Email', value: user.email },
                        { label: 'Username', value: user.username },
                        { label: 'Phone', value: user.phone, mono: true },
                        { label: 'Role', value: user.role && formatStatus(user.role) },
                        { label: 'Status', value: user.status && formatStatus(user.status) },
                        { label: 'Joined', value: formatDate(user.created_at) },
                    ],
                }}
                actions={[can.update && { id: 'edit', label: 'Edit User', icon: 'fa-pen', href: route('users.edit', user.id), variant: 'primary' }].filter(Boolean)}
            />
        </AuthenticatedLayout>
    );
}
