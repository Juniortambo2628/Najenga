import { useEffect, useState } from 'react';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import ResourceFormFields from '@/Components/ResourceFormFields';
import { expenseFields } from '@/Config/schemas/expense';

export default function ExpenseForm({
    expense = null,
    projects = [],
    onSubmit,
    onCancel,
}) {
    const [data, setData] = useState({
        title: '',
        amount: '',
        category: '',
        project_id: '',
        expense_date: '',
        description: '',
        payment_method: '',
    });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (expense) {
            setData({
                title: expense.title ?? '',
                amount: expense.amount ?? '',
                category: expense.category ?? '',
                project_id: expense.project_id ?? '',
                expense_date: expense.expense_date ?? '',
                description: expense.description ?? '',
                payment_method: expense.payment_method ?? '',
            });
        }
    }, [expense]);

    const validate = () => {
        const newErrors = {};
        if (!data.title.trim()) newErrors.title = 'Title is required.';
        if (!data.amount || isNaN(data.amount) || Number(data.amount) < 0)
            newErrors.amount = 'A valid amount (min 0) is required.';
        if (!data.category) newErrors.category = 'Category is required.';
        if (!data.expense_date) newErrors.expense_date = 'Date is required.';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validate()) {
            onSubmit({ ...data, amount: Number(data.amount) });
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <ResourceFormFields schema={expenseFields(projects)} data={data} setData={(field, value) => setData((prev) => ({ ...prev, [field]: value }))} errors={errors} />

            <div className="flex items-center justify-end gap-3 pt-2">
                {onCancel && (
                    <SecondaryButton type="button" onClick={onCancel}>
                        Cancel
                    </SecondaryButton>
                )}
                <PrimaryButton type="submit">
                    {expense ? 'Update Expense' : 'Create Expense'}
                </PrimaryButton>
            </div>
        </form>
    );
}
