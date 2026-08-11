import ResourceForm from '@/Components/ResourceForm';
import { EXPENSE_FIELDS } from '@/Config/schemas/expense';

export default function Edit({ expense, projects }) {
    return (
        <ResourceForm
            title={`Edit ${expense.title}`}
            breadcrumbs={[
                { label: 'Expenses', href: route('expenses') },
                { label: expense.title },
            ]}
            schema={EXPENSE_FIELDS}
            method="patch"
            action={route('expenses.update', expense.id)}
            cancelHref={route('expenses')}
            initialData={expense}
            transform={(data) => ({
                ...data,
                project_id: data.project_id || null,
            })}
        />
    );
}
