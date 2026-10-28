/**
 * The public pages' shared content: where the photos live, and the five
 * feature areas (the landing page's explorer, the journeys' toolkits). Kept
 * here so the same feature is never described two ways.
 */

export const BG = '/Najenga-backgrounds';

/** The "Inside Najenga" explorer. */
export const FEATURE_GROUPS = [
    {
        id: 'money',
        eyebrow: 'Money',
        title: 'Every shilling, accounted for',
        summary: 'Record costs as they happen — in a form, in a spreadsheet view, or by sending the receipt on WhatsApp. Najenga reads the receipt, you confirm it, and each cost lands in its project and category.',
        points: ['Receipts read for you, then checked by a person', 'M-Pesa codes, bank references and cash in one list', 'Totals by category, and receipts still missing'],
        stats: [['8', 'currencies'], ['3', 'ways to record a cost'], ['1', 'list of every payment']],
        image: `${BG}/pexels-curtis-adams-1694007-7027840.webp`,
        screen: '/marketing/expenses.webp',
    },
    {
        id: 'site',
        eyebrow: 'Site',
        title: 'The site, week by week',
        summary: 'Upload photos from site or send them on WhatsApp. Najenga dates each one from the camera, flags the ones it had to guess, and keeps them with their project.',
        points: ['Dates read from the photo itself', 'Pin notes and drawings on a photo', 'Milestones and progress on one timeline'],
        stats: [['Day', 'to year timeline views'], ['Pins', 'drawn on photos'], ['Zip', 'download a batch']],
        image: `${BG}/pexels-d-goug-211350543-38210397.webp`,
    },
    {
        id: 'files',
        eyebrow: 'Files',
        title: 'Plans and paperwork, where you left them',
        summary: 'Drawings, permits, contracts and quotes in folders for each project. Preview them in the browser, talk about them in comments, and find any of them from the search bar.',
        points: ['Folders for each project', 'PDFs and images open in the browser', 'Comments beside every document'],
        stats: [['Folders', 'inside folders'], ['PDF', 'preview in place'], ['⌘K', 'search everything']],
        image: `${BG}/pexels-expect-best-79873-323776.webp`,
    },
    {
        id: 'team',
        eyebrow: 'Team',
        title: 'The right say for everyone',
        summary: 'Invite people by email and choose what they can do: run the project, change records, or only look. See who else is working on the same page, and undo a mistake from the version history.',
        points: ['Owner, manager, editor and viewer roles', 'Who’s online, and what changed since you looked', 'Every change kept, and restorable'],
        stats: [['4', 'roles'], ['7', 'days to accept an invite'], ['1', 'click to restore']],
        image: `${BG}/pexels-40037226-7667625.webp`,
    },
    {
        id: 'insight',
        eyebrow: 'Insight',
        title: 'Know where the project stands',
        summary: 'Each project’s overview shows its budget used, latest work and team. Analytics and activity logs show the rest, and a weekly email sums up what came in on WhatsApp.',
        points: ['Budget used, at a glance', 'Spending by category and over time', 'A weekly summary in your inbox'],
        stats: [['%', 'of budget used'], ['Weekly', 'WhatsApp summary'], ['CSV', 'export any list']],
        image: `${BG}/pexels-ninobur-16787444.webp`,
        screen: '/marketing/overview.webp',
    },
];

/** One feature area by id. */
export const featureGroup = (id) => FEATURE_GROUPS.find((group) => group.id === id);
