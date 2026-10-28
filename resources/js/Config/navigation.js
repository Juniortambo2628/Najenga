/**
 * Single source of truth for sidebar navigation.
 *
 * The sidebar is grouped: each section has an optional heading and its
 * items. Consumed by AuthenticatedLayout. `roles` restricts an item to those
 * roles; an item with no `roles` is shown to everyone.
 */
export const NAV_SECTIONS = [
    {
        items: [
            { name: 'Dashboard', href: route('dashboard'), icon: 'fa-tachometer-alt' },
            { name: 'Projects', href: route('projects'), icon: 'fa-project-diagram' },
        ],
    },
    {
        title: 'Spending',
        items: [
            { name: 'Expenses', href: route('expenses'), icon: 'fa-receipt' },
            { name: 'Receipts', href: route('receipts.index'), icon: 'fa-file-invoice-dollar' },
            { name: 'Receipt Verification', href: route('receipt.verification'), icon: 'fa-check-circle' },
        ],
    },
    {
        title: 'Site records',
        items: [
            { name: 'Photos', href: route('photos'), icon: 'fa-images' },
            { name: 'Documents', href: route('documents'), icon: 'fa-file-alt' },
            { name: 'Timeline', href: route('timeline'), icon: 'fa-calendar-alt' },
        ],
    },
    {
        title: 'Communication',
        items: [
            { name: 'Messages', href: route('messages'), icon: 'fa-comment-alt' },
            { name: 'WhatsApp', href: route('whatsapp'), icon: 'fa-whatsapp' },
        ],
    },
    {
        title: 'Oversight',
        items: [
            { name: 'Analytics', href: route('analytics'), icon: 'fa-chart-bar', roles: ['admin'] },
            { name: 'Activity Logs', href: route('activity.logs'), icon: 'fa-history' },
            { name: 'Users', href: route('users.index'), icon: 'fa-users-cog', roles: ['admin'] },
        ],
    },
    {
        title: 'Account',
        items: [{ name: 'Profile', href: route('profile.edit'), icon: 'fa-user' }],
    },
];

/** Every sidebar entry, ungrouped. */
export const NAV_ITEMS = NAV_SECTIONS.flatMap((section) => section.items);

const visibleTo = (role) => (item) => !item.roles || item.roles.includes(role);

export function navItemsFor(role) {
    return NAV_ITEMS.filter(visibleTo(role));
}

/** The sections a role sees, without the items (or sections) it can't use. */
export function navSectionsFor(role) {
    return NAV_SECTIONS.map((section) => ({ ...section, items: section.items.filter(visibleTo(role)) })).filter(
        (section) => section.items.length > 0,
    );
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
