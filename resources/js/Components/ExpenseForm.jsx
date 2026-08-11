import { useEffect, useState } from 'react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import SelectInput from '@/Components/SelectInput';
import { EXPENSE_CATEGORIES, PAYMENT_METHODS } from '@/Config/expenses';

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

    const handleChange = (field) => (e) => {
        setData((prev) => ({ ...prev, [field]: e.target.value }));
        setErrors((prev) => ({ ...prev, [field]: undefined }));
    };

    const validate = () => {
        const newErrors = {};
        if (!data.title.trim()) newErrors.title = 'Title is required.';
        if (!data.amount || isNaN(data.amount) || Number(data.amount) < 0)
            newErrors.amount = 'A valid amount (min 0) is required.';
        if (!data.category) newErrors.category = 'Category is required.';
        if (!data.project_id) newErrors.project_id = 'Project is required.';
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
            <div>
                <InputLabel htmlFor="title" value="Title" />
                <TextInput
                    id="title"
                    value={data.title}
                    onChange={handleChange('title')}
                />
                <InputError message={errors.title} />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <InputLabel htmlFor="amount" value="Amount" />
                    <TextInput
                        id="amount"
                        type="number"
                        min="0"
                        step="0.01"
                        value={data.amount}
                        onChange={handleChange('amount')}
                    />
                    <InputError message={errors.amount} />
                </div>
                <div>
                    <InputLabel htmlFor="expense_date" value="Date" />
                    <TextInput
                        id="expense_date"
                        type="date"
                        value={data.expense_date}
                        onChange={handleChange('expense_date')}
                    />
                    <InputError message={errors.expense_date} />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <InputLabel htmlFor="category" value="Category" />
                    <SelectInput
                        id="category"
                        value={data.category}
                        onChange={handleChange('category')}
                        placeholder="Select category"
                    >
                        {EXPENSE_CATEGORIES.map((cat) => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </SelectInput>
                    <InputError message={errors.category} />
                </div>
                <div>
                    <InputLabel htmlFor="project_id" value="Project" />
                    <SelectInput
                        id="project_id"
                        value={data.project_id}
                        onChange={handleChange('project_id')}
                        placeholder="Select project"
                    >
                        {projects.map((project) => (
                            <option key={project.id} value={project.id}>{project.name}</option>
                        ))}
                    </SelectInput>
                    <InputError message={errors.project_id} />
                </div>
            </div>

            <div>
                <InputLabel htmlFor="payment_method" value="Payment Method" />
                <SelectInput
                    id="payment_method"
                    value={data.payment_method}
                    onChange={handleChange('payment_method')}
                    placeholder="Select payment method"
                >
                    {PAYMENT_METHODS.map((method) => (
                        <option key={method.value} value={method.value}>{method.label}</option>
                    ))}
                </SelectInput>
                <InputError message={errors.payment_method} />
            </div>

            <div>
                <InputLabel htmlFor="description" value="Description" />
                <textarea
                    id="description"
                    value={data.description}
                    onChange={handleChange('description')}
                    rows={3}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 transition-all duration-200 focus:outline-none focus:border-[#8B0000] focus:ring-1 focus:ring-[#8B0000]/50 resize-none"
                />
                <InputError message={errors.description} />
            </div>

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
