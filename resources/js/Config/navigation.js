/**
 * Single source of truth for sidebar navigation.
 *
 * Consumed by AuthenticatedLayout. `roles` restricts an item to those roles;
 * an item with no `roles` is shown to everyone.
 */
export const NAV_ITEMS = [
    { name: 'Dashboard', href: route('dashboard'), icon: 'fa-tachometer-alt' },
    { name: 'Projects', href: route('projects'), icon: 'fa-project-diagram' },
    { name: 'Expenses', href: route('expenses'), icon: 'fa-receipt' },
    { name: 'Receipts', href: route('receipts.index'), icon: 'fa-file-invoice-dollar' },
    { name: 'Photos', href: route('photos'), icon: 'fa-images' },
    { name: 'Documents', href: route('documents'), icon: 'fa-file-alt' },
    { name: 'Timeline', href: route('timeline'), icon: 'fa-calendar-alt' },
    { name: 'Receipt Verification', href: route('receipt.verification'), icon: 'fa-check-circle' },
    { name: 'WhatsApp', href: route('whatsapp'), icon: 'fa-whatsapp' },
    { name: 'Messages', href: route('messages'), icon: 'fa-comment-alt' },
    { name: 'Analytics', href: route('analytics'), icon: 'fa-chart-bar', roles: ['admin'] },
    { name: 'Users', href: route('users.index'), icon: 'fa-users-cog', roles: ['admin'] },
    { name: 'Activity Logs', href: route('activity.logs'), icon: 'fa-history' },
    { name: 'Profile', href: route('profile.edit'), icon: 'fa-user' },
];

export function navItemsFor(role) {
    return NAV_ITEMS.filter((item) => !item.roles || item.roles.includes(role));
}

/**
 * The breadcrumb prefix repeated on every page: the dashboard.
 *
 * Usage:
 *   breadcrumbs={[...rootBreadcrumbs(), { label: 'Documents', href: route('documents') }, { label: doc.title }]}
 */
export function rootBreadcrumbs() {
    return [{ label: 'Dashboard', href: route('dashboard') }];
}
