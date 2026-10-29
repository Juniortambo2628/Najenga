import ResourceForm from '@/Components/ResourceForm';
import { expenseFields } from '@/Config/schemas/expense';
import useActiveProjectId from '@/Hooks/useActiveProjectId';

export default function Create({ projects }) {
    const [activeProjectId] = useActiveProjectId();
    const defaultProjectId = projects?.some((project) => String(project.id) === String(activeProjectId))
        ? activeProjectId
        : (projects?.[0]?.id || '');
    return (
        <ResourceForm
            title="Add New Expense"
            breadcrumbs={[
                { label: 'Expenses', href: route('expenses') },
                { label: 'Create' },
            ]}
            schema={expenseFields(projects)}
            method="post"
            action={route('expenses.store')}
            cancelHref={route('expenses')}
            initialData={{
                expense_date: new Date().toISOString().split('T')[0],
                payment_method: 'cash',
                project_id: defaultProjectId,
            }}
            transform={(data) => ({
                ...data,
                project_id: data.project_id || null,
            })}
        />
    );
}
