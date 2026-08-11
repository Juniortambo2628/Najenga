import { field, group } from '@/Config/fieldBuilder';
import { CURRENCY_OPTIONS } from '@/Config/currencies';

const PROJECT_STATUSES = [
    { value: 'planning', label: 'Planning' },
    { value: 'active', label: 'Active' },
    { value: 'on_hold', label: 'On Hold' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
];

export const PROJECT_FIELDS = [
    field('name').text().label('Project Name').placeholder('Enter project name').required(),
    field('description').textarea().label('Description').rows(4).placeholder('Enter project description'),
    group('Status & Budget',
        field('status').select().label('Status').options(PROJECT_STATUSES),
        field('budget').number().label('Budget').step('1').placeholder('Enter budget').suffix('KES'),
    ),
    field('location').text().label('Location').placeholder('Enter project location'),
    group('Dates',
        field('start_date').date().label('Start Date'),
        field('end_date').date().label('End Date'),
    ),
];
