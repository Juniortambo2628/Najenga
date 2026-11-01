import { fa } from './icons';

/**
 * The sidebar, grouped. `roles` limits an item to those roles ('admin' is a
 * superadmin); no `roles`, everyone. `key` is the page's presence and
 * change-badge name (the first part of its path).
 */
export const NAV_SECTIONS = [
  {
    items: [
      { key: 'dashboard', path: '/dashboard', label: 'Dashboard', icon: fa('fa-tachometer-alt') },
      { key: 'overview', path: '/overview', label: 'Overview', icon: fa('fa-compass') },
    ],
  },
  {
    title: 'Spending',
    items: [
      { key: 'expenses', path: '/expenses', label: 'Expenses', icon: fa('fa-receipt') },
      { key: 'receipts', path: '/receipts', label: 'Receipts', icon: fa('fa-file-invoice-dollar') },
      { key: 'receipt-verification', path: '/receipt-verification', label: 'Receipt Verification', icon: fa('fa-check-circle') },
    ],
  },
  {
    title: 'Site records',
    items: [
      { key: 'photos', path: '/photos', label: 'Photos', icon: fa('fa-images') },
      { key: 'documents', path: '/documents', label: 'Documents', icon: fa('fa-file-alt') },
      { key: 'timeline', path: '/timeline', label: 'Timeline', icon: fa('fa-calendar-alt') },
    ],
  },
  {
    title: 'Communication',
    items: [
      { key: 'messages', path: '/messages', label: 'Messages', icon: fa('fa-comment-alt') },
      { key: 'whatsapp', path: '/whatsapp', label: 'WhatsApp', icon: fa('fa-whatsapp', { brand: true }) },
    ],
  },
  {
    title: 'Oversight',
    items: [
      { key: 'analytics', path: '/analytics', label: 'Analytics', icon: fa('fa-chart-bar'), roles: ['admin'] },
      { key: 'activity-logs', path: '/activity-logs', label: 'Activity Logs', icon: fa('fa-history') },
      { key: 'users', path: '/users', label: 'Users', icon: fa('fa-users-cog'), roles: ['admin'] },
    ],
  },
  {
    title: 'Account',
    items: [{ key: 'settings', path: '/settings', label: 'Settings', icon: fa('fa-gear') }],
  },
];

export const NAV_ITEMS = NAV_SECTIONS.flatMap((section) => section.items);

/** The sections someone sees: superadmins see the admin pages too. */
export function navFor(user) {
  const role = user?.is_superadmin ? 'admin' : user?.role;
  return NAV_SECTIONS
    .map((section) => ({ ...section, items: section.items.filter((item) => !item.roles || item.roles.includes(role)) }))
    .filter((section) => section.items.length > 0);
}

/** "expenses" -> "Expenses", from the sidebar's own names. */
export function pageLabel(page = '') {
  return NAV_ITEMS.find((item) => item.key === page)?.label ?? page.replace(/-/g, ' ').replace(/^\w/, (c) => c.toUpperCase());
}
