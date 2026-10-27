import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import DashboardPage from '@/Components/DashboardPage';
import Card from '@/Components/Card';

export default function ResourceFormPage({ title, breadcrumbs, children }) {
    return (
        <AuthenticatedLayout>
            <Head title={title} />
            <DashboardPage
                className="max-w-3xl mx-auto"
                hero={{
                    title,
                    breadcrumbs,
                }}
            >
                <Card className="p-8">
                    {children}
                </Card>
            </DashboardPage>
        </AuthenticatedLayout>
    );
}
