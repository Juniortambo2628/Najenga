import ResourceForm from '@/Components/ResourceForm';
import { EXPENSE_FIELDS } from '@/Config/schemas/expense';

export default function Create({ projects }) {
    return (
        <ResourceForm
            title="Add New Expense"
            breadcrumbs={[
                { label: 'Expenses', href: route('expenses') },
                { label: 'Create' },
            ]}
            schema={EXPENSE_FIELDS}
            method="post"
            action={route('expenses.store')}
            cancelHref={route('expenses')}
            initialData={{
                expense_date: new Date().toISOString().split('T')[0],
                payment_method: 'cash',
                project_id: projects?.[0]?.id || '',
            }}
            transform={(data) => ({
                ...data,
                project_id: data.project_id || null,
            })}
        />
    );
}
