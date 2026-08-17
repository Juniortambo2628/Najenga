import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import DashboardHero from '@/Components/DashboardHero';
import StatusBadge from '@/Components/StatusBadge';

export default function Show({ timeline }) {
    return (
        <AuthenticatedLayout>
            <Head title={timeline.title} />
            <div className="max-w-4xl mx-auto">
                <DashboardHero
                    title={timeline.title}
                    subtitle="Milestone details"
                    breadcrumbs={[
                        { label: 'Home', href: '/home' },
                        { label: 'Dashboard', href: '/dashboard' },
                        { label: 'Timeline', href: '/timeline' },
                        { label: timeline.title },
                    ]}
                    actions={
                        <Link
                            href={route('timeline.edit', timeline.id)}
                            className="px-4 py-2 bg-white/5 border border-white/10 text-white rounded-xl hover:bg-white/10 transition"
                        >
                            <i className="fas fa-edit mr-2"></i>Edit
                        </Link>
                    }
                />

                <div className="bg-black/50 border border-white/10 rounded-2xl p-6">
                    <dl className="space-y-4 text-sm">
                        <div className="flex justify-between">
                            <dt className="text-gray-500">Project</dt>
                            <dd className="text-gray-300">{timeline.project?.name ?? 'N/A'}</dd>
                        </div>
                        <div className="flex justify-between">
                            <dt className="text-gray-500">Status</dt>
                            <dd><StatusBadge status={timeline.status} /></dd>
                        </div>
                        <div className="flex justify-between">
                            <dt className="text-gray-500">Start Date</dt>
                            <dd className="text-gray-300">{timeline.start_date}</dd>
                        </div>
                        <div className="flex justify-between">
                            <dt className="text-gray-500">End Date</dt>
                            <dd className="text-gray-300">{timeline.end_date ?? 'Ongoing'}</dd>
                        </div>
                        {timeline.description && (
                            <div>
                                <dt className="text-gray-500 mb-1">Description</dt>
                                <dd className="text-gray-300 whitespace-pre-wrap">{timeline.description}</dd>
                            </div>
                        )}
                    </dl>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
