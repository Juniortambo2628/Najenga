import { field, group } from '@/Config/fieldBuilder';

const MILESTONE_STATUSES = [
    { value: 'pending', label: 'Pending' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'on_hold', label: 'On Hold' },
];

export const TIMELINE_FIELDS = [
    field('title').text().label('Title').placeholder('Enter milestone title').required(),
    field('description').textarea().label('Description').rows(3).placeholder('Enter description'),
    field('project_id').select().label('Project').placeholder('Select a project'),
    group('Dates & Status',
        field('start_date').date().label('Start Date'),
        field('end_date').date().label('End Date'),
    ),
    field('status').select().label('Status').options(MILESTONE_STATUSES),
];
