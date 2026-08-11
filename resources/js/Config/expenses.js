export const EXPENSE_CATEGORIES = [
    'Materials',
    'Labor',
    'Equipment',
    'Transport',
    'Utilities',
    'Permits',
    'General',
    'Other',
];

export const PAYMENT_METHODS = [
    { value: 'mobile_money', label: 'M-Pesa' },
    { value: 'cash', label: 'Cash' },
    { value: 'bank_transfer', label: 'Bank Transfer' },
    { value: 'card', label: 'Credit Card' },
    { value: 'pesalink', label: 'Pesalink' },
    { value: 'check', label: 'Cheque' },
    { value: 'other', label: 'Other' },
];

export const PAYMENT_METHOD_VALUES = PAYMENT_METHODS.map(m => m.value);

export const PAYMENT_LABELS = Object.fromEntries(
    PAYMENT_METHODS.map(m => [m.value, m.label])
);
