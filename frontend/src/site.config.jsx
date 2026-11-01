import { Clock3, FileText, Lock, ShieldCheck, UserLock } from 'lucide-react';
import { useAccount } from './account';
import { FEATURE_GROUPS } from './content/marketing';
import { CONTACT_EMAIL, LAST_UPDATED } from './content/legal';

/**
 * Najenga's public pages on the OKJT kit (@okjt/site): the words, links and
 * pictures its layout and sections show. Colours and fonts: okjt.config.js.
 * Photos are their paths under public/ (the key is the path).
 */
const PLACES = Object.fromEntries(FEATURE_GROUPS.map((group) => [`group-${group.id}`, group.image]));

export const site = {
  brand: {
    name: 'Najenga',
    logo: { light: '/Najenga-logos/Najenga-Logo-trimmed.webp', dark: '/Najenga-logos/Najenga-Logo-trimmed-dark.webp' },
  },

  nav: [
    { to: '/#journey', label: 'How it works' },
    { to: '/#inside', label: 'Inside Najenga' },
    { to: '/for-homeowners', label: 'For homeowners' },
    { to: '/for-contractors', label: 'For contractors' },
    { to: '/#faq', label: 'Questions' },
  ],

  useAccount,
  accountLinks: {
    signIn: { to: '/login', label: 'Sign in' },
    signUp: { to: '/register', label: 'Get started' },
    home: { to: '/dashboard', label: 'Dashboard' },
  },

  usePhotos: () => ({ url: (key) => key, alt: () => '' }),
  usePlaces: () => (place) => PLACES[place] ?? null,
  media: {
    expenses: { src: '/marketing/expenses.webp', alt: 'Expenses in Najenga', url: 'najenga.okjtech.co.ke/expenses' },
    overview: { src: '/marketing/overview.webp', alt: 'A project’s overview in Najenga', url: 'najenga.okjtech.co.ke/dashboard' },
    analytics: { src: '/marketing/analytics.webp', alt: 'Analytics in Najenga', url: 'najenga.okjtech.co.ke/analytics' },
    timeline: { src: '/marketing/timeline.webp', alt: 'A project’s timeline in Najenga', url: 'najenga.okjtech.co.ke/timeline' },
    'settings-projects': { src: '/marketing/settings-projects.webp', alt: 'Your projects and roles in Najenga', url: 'najenga.okjtech.co.ke/settings' },
  },

  footer: {
    about: '“Najenga” is Kiswahili for “I’m building”. Construction project management for the people paying for, running and doing the work.',
    columns: [
      { title: 'Najenga', links: [
        { to: '/#journey', label: 'How it works' },
        { to: '/#inside', label: 'Inside Najenga' },
        { to: '/for-homeowners', label: 'For homeowners' },
        { to: '/for-contractors', label: 'For contractors' },
        { to: '/#faq', label: 'Questions' },
      ] },
      { title: 'Your account', links: [
        { to: '/dashboard', label: 'Dashboard', signedIn: true },
        { to: '/register', label: 'Get started', signedIn: false },
        { to: '/login', label: 'Sign in', signedIn: false },
        { to: `mailto:${CONTACT_EMAIL}`, label: 'Contact us' },
      ] },
      { title: 'Legal', links: [{ to: '/privacy', label: 'Privacy' }, { to: '/terms', label: 'Terms' }] },
    ],
    promises: [
      { icon: UserLock, text: 'Only the people you invite' },
      { icon: ShieldCheck, text: 'Passkeys and two-step sign-in' },
      { icon: Clock3, text: 'Every change kept, and restorable' },
    ],
    watermark: 'najenga.',
    copyright: 'Najenga by OKJ Technologies',
    madeBy: { label: 'Built by', name: 'OKJ Technologies', href: 'https://okjtech.co.ke', logo: '/favicon-32.png' },
  },

  legal: {
    documents: [{ to: '/privacy', label: 'Privacy policy', icon: Lock }, { to: '/terms', label: 'Terms of service', icon: FileText }],
    contact: `Questions about these documents: ${CONTACT_EMAIL}.`,
    lastUpdated: LAST_UPDATED,
    seeAlso: [],
  },

  seo: {
    origin: 'https://najenga.okjtech.co.ke',
    siteName: 'Najenga',
    locale: 'en_KE',
    defaultTitle: 'Najenga | Construction project management',
    defaultDescription: 'What was spent and on what, how the site is coming along, the plans and permits, and who is doing what — for every construction project.',
    pages: {
      '/': { title: 'Najenga | Construction project management', description: 'Construction project management: every shilling, the site week by week, the paperwork and the people, in one calm place.' },
      '/for-homeowners': { title: 'For homeowners | Najenga', description: 'Follow your build from anywhere, and know where every shilling went.' },
      '/for-contractors': { title: 'For contractors | Najenga', description: 'Every site, crew and client under one sign-in.' },
      '/privacy': { title: 'Privacy Policy | Najenga', description: 'How Najenga handles your account and project data.' },
      '/terms': { title: 'Terms of Service | Najenga', description: 'The terms for using Najenga.' },
    },
    resolve: () => undefined,
  },
};
