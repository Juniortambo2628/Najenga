import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import Breadcrumb from '@/Components/Breadcrumb';
import Card from '@/Components/Card';

export default function ResourceFormPage({ title, breadcrumbs, children }) {
    return (
        <AuthenticatedLayout>
            <Head title={title} />
            <div className="max-w-3xl mx-auto">
                <Breadcrumb items={breadcrumbs} />
                <h1 className="text-3xl font-bold text-white mb-8">{title}</h1>
                <Card className="p-8">
                    {children}
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}
