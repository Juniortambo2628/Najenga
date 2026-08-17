import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import DashboardHero from '@/Components/DashboardHero';
import StatusBadge from '@/Components/StatusBadge';

export default function Show({ user }) {
    return (
        <AuthenticatedLayout>
            <Head title={`${user.first_name} ${user.last_name}`} />
            <div className="max-w-4xl mx-auto">
                <DashboardHero
                    title={`${user.first_name} ${user.last_name}`}
                    subtitle="User profile"
                    breadcrumbs={[
                        { label: 'Home', href: '/home' },
                        { label: 'Dashboard', href: '/dashboard' },
                        { label: 'Users', href: '/users' },
                        { label: `${user.first_name} ${user.last_name}` },
                    ]}
                    actions={
                        <Link
                            href={route('users.edit', user.id)}
                            className="px-4 py-2 bg-white/5 border border-white/10 text-white rounded-xl hover:bg-white/10 transition"
                        >
                            <i className="fas fa-edit mr-2"></i>Edit
                        </Link>
                    }
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-black/50 border border-white/10 rounded-2xl p-6">
                        <h2 className="text-lg font-semibold text-white mb-4">Profile Information</h2>
                        <dl className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <dt className="text-gray-500">Email</dt>
                                <dd className="text-gray-300">{user.email}</dd>
                            </div>
                            <div className="flex justify-between">
                                <dt className="text-gray-500">Username</dt>
                                <dd className="text-gray-300">{user.username}</dd>
                            </div>
                            <div className="flex justify-between">
                                <dt className="text-gray-500">Phone</dt>
                                <dd className="text-gray-300">{user.phone ?? 'N/A'}</dd>
                            </div>
                            <div className="flex justify-between">
                                <dt className="text-gray-500">Role</dt>
                                <dd><StatusBadge status={user.role} /></dd>
                            </div>
                            <div className="flex justify-between">
                                <dt className="text-gray-500">Status</dt>
                                <dd><StatusBadge status={user.status} /></dd>
                            </div>
                        </dl>
                    </div>

                    <div className="bg-black/50 border border-white/10 rounded-2xl p-6">
                        <h2 className="text-lg font-semibold text-white mb-4">Activity Summary</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="text-center p-4 bg-white/5 rounded-xl">
                                <div className="text-2xl font-bold text-white">{user.projects_count ?? 0}</div>
                                <div className="text-sm text-gray-400">Projects</div>
                            </div>
                            <div className="text-center p-4 bg-white/5 rounded-xl">
                                <div className="text-2xl font-bold text-white">{user.expenses_count ?? 0}</div>
                                <div className="text-sm text-gray-400">Expenses</div>
                            </div>
                            <div className="text-center p-4 bg-white/5 rounded-xl">
                                <div className="text-2xl font-bold text-white">{user.photos_count ?? 0}</div>
                                <div className="text-sm text-gray-400">Photos</div>
                            </div>
                            <div className="text-center p-4 bg-white/5 rounded-xl">
                                <div className="text-2xl font-bold text-white">{user.documents_count ?? 0}</div>
                                <div className="text-sm text-gray-400">Documents</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
