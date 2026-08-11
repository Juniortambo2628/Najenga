import { field, group } from '@/Config/fieldBuilder';
import { EXPENSE_CATEGORIES, PAYMENT_METHODS } from '@/Config/expenses';

export const EXPENSE_FIELDS = [
    field('title').text().label('Title').placeholder('Enter expense title').required(),
    group('Amount & Category',
        field('amount').number().label('Amount').step('0.01').placeholder('0.00').required(),
        field('category').select().label('Category').options(EXPENSE_CATEGORIES).required(),
    ),
    group('Project & Date',
        field('project_id').select().label('Project').placeholder('Select a project'),
        field('expense_date').date().label('Date').required(),
    ),
    field('payment_method').select().label('Payment Method').options(PAYMENT_METHODS).placeholder('Select payment method'),
    field('description').textarea().label('Description').rows(3).placeholder('Enter description'),
];
