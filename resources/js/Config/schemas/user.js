import { field, group } from '@/Config/fieldBuilder';

const USER_ROLES = [
    { value: 'admin', label: 'Admin' },
    { value: 'client', label: 'Client' },
    { value: 'manager', label: 'Manager' },
];

const USER_STATUSES = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'suspended', label: 'Suspended' },
];

export const USER_CREATE_FIELDS = [
    group('Name',
        field('first_name').text().label('First Name').placeholder('Enter first name').required(),
        field('last_name').text().label('Last Name').placeholder('Enter last name').required(),
    ),
    field('email').email().label('Email').placeholder('Enter email address').required(),
    group('Access',
        field('role').select().label('Role').options(USER_ROLES),
        field('password').password().label('Password').placeholder('Enter password').required(),
    ),
];

export const USER_EDIT_FIELDS = [
    group('Name',
        field('first_name').text().label('First Name').placeholder('Enter first name').required(),
        field('last_name').text().label('Last Name').placeholder('Enter last name').required(),
    ),
    group('Access',
        field('role').select().label('Role').options(USER_ROLES),
        field('status').select().label('Status').options(USER_STATUSES),
    ),
];
