/**
 * Single source of truth for sidebar navigation.
 *
 * Consumed by AuthenticatedLayout. `roles` restricts an item to those roles;
 * an item with no `roles` is shown to everyone.
 */
export const NAV_ITEMS = [
    { name: 'Dashboard', href: '/dashboard', icon: 'fa-tachometer-alt' },
    { name: 'Projects', href: '/projects', icon: 'fa-project-diagram' },
    { name: 'Expenses', href: '/expenses', icon: 'fa-receipt' },
    { name: 'Photos', href: '/photos', icon: 'fa-images' },
    { name: 'Documents', href: '/documents', icon: 'fa-file-alt' },
    { name: 'Timeline', href: '/timeline', icon: 'fa-calendar-alt' },
    { name: 'Receipt Verification', href: '/receipt-verification', icon: 'fa-check-circle' },
    { name: 'WhatsApp', href: '/whatsapp', icon: 'fa-whatsapp' },
    { name: 'Messages', href: '/messages', icon: 'fa-comment-alt' },
    { name: 'Analytics', href: '/analytics', icon: 'fa-chart-bar', roles: ['admin'] },
    { name: 'Users', href: '/users', icon: 'fa-users-cog', roles: ['admin'] },
    { name: 'Activity Logs', href: '/activity-logs', icon: 'fa-history' },
    { name: 'Profile', href: '/profile', icon: 'fa-user' },
];

export function navItemsFor(role) {
    return NAV_ITEMS.filter((item) => !item.roles || item.roles.includes(role));
}

/**
 * The breadcrumb prefix repeated on every page: the dashboard.
 *
 * Usage:
 *   breadcrumbs={[...rootBreadcrumbs(), { label: 'Documents', href: '/documents' }, { label: doc.title }]}
 */
export function rootBreadcrumbs() {
    return [{ label: 'Dashboard', href: '/dashboard' }];
}
