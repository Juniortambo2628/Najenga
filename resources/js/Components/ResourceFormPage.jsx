import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import DashboardPage from '@/Components/DashboardPage';
import { AdminCard as Card } from '@okjt/dashboard';

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
                <Card padding={false} className="p-8">
                    {children}
                </Card>
            </DashboardPage>
        </AuthenticatedLayout>
    );
}
