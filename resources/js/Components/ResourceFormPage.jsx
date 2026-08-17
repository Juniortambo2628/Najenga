import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import DashboardHero from '@/Components/DashboardHero';
import Card from '@/Components/Card';

export default function ResourceFormPage({ title, breadcrumbs, children }) {
    return (
        <AuthenticatedLayout>
            <Head title={title} />
            <div className="max-w-3xl mx-auto">
                <DashboardHero
                    title={title}
                    breadcrumbs={breadcrumbs}
                />
                <Card className="p-8">
                    {children}
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}
