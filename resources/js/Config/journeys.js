import { BG } from '@/Config/marketing';

/**
 * The two step-by-step journeys through Najenga, after Naoa's: someone
 * building their own home, and a contractor running several sites. Rendered
 * by Pages/Journey.jsx. Every step describes something Najenga does today.
 *
 * A chapter's `media` is a screen from the app ({ screen }) or a photo
 * from site ({ photo }).
 */

export const HOMEOWNER_JOURNEY = {
    id: 'homeowners',
    eyebrow: 'For homeowners',
    title: 'From the first bag of cement to the keys in your hand',
    text: 'Follow Achieng, building a three-bedroom house in Kisumu while she works in Nairobi, through a year of building with Najenga: what she did, what her contractor and family did, and how she kept every shilling in sight from 350 kilometres away.',
    photo: `${BG}/pexels-artbovich-7031607.webp`,
    photoPosition: 'center 55%',
    glance: [
        ['1 project', 'with its budget, team and records'],
        ['1 number', 'on WhatsApp for receipts and photos'],
        ['4 roles', 'so everyone gets the right say'],
        ['0', 'receipts lost in a drawer'],
    ],
    chapters: [
        {
            id: 'set-up',
            when: 'Day one',
            title: 'Set up your build',
            intro: 'Achieng creates an account and her first project. Nothing else is needed to begin.',
            media: { screen: '/marketing/overview.webp' },
            steps: [
                { title: 'Name it and give it a budget', text: 'Her project gets a name, its location in Kisumu, start and end dates, and the budget her bank approved, in Kenyan shillings.' },
                { title: 'A tour of the place', text: 'A short guided tour shows her around: the project switcher, the version history and where her notifications land.' },
                { title: 'The overview', text: 'Her project’s overview shows the budget used, the latest expenses, photos and documents, and who’s on the team — empty for now, filling up from here.' },
            ],
            details: [
                'Pick a default currency in Settings; new expenses start in it.',
                'Sign in with a passkey, add two-factor sign-in, and get an email when a new device signs in.',
                'Change the name, dates or budget any time from the project’s Edit page.',
            ],
            tip: 'Set the budget to what you can really spend: the overview’s bar turns red when spending passes it.',
        },
        {
            id: 'team',
            when: 'Before ground-breaking',
            title: 'Bring in the people building it',
            intro: 'Her contractor, the site foreman and her brother, who visits the site on weekends, all need to see the build — but not all the same way.',
            media: { screen: '/marketing/settings-projects.webp' },
            steps: [
                { title: 'Invite by email', text: 'From the Share button she invites her contractor as a manager, the foreman as an editor and her brother as a viewer. Each gets an email with a link.' },
                { title: 'The right say for each', text: 'Managers run the project and invite others; editors add and change records; viewers only look. Nobody sees any project they weren’t invited to.' },
                { title: 'See who’s around', text: 'Avatars at the top show who else is in Najenga, and a badge on the sidebar shows what changed since she last looked.' },
            ],
            details: [
                'Invitations expire after 7 days; resend or cancel them from the Share panel.',
                'Change someone’s role, or remove them, at any time.',
                'Your projects and your role in each are listed in Settings → Your projects.',
            ],
            tip: 'Make the person who pays the fundis an editor: they can log what they pay as it happens.',
        },
        {
            id: 'money',
            when: 'Every week',
            title: 'Pay for the work, keep every receipt',
            intro: 'Cement, sand, ballast, labour, transport: a build is hundreds of small payments. Achieng wants each one written down, with proof.',
            media: { screen: '/marketing/expenses.webp' },
            steps: [
                { title: 'Log a payment in seconds', text: 'Amount, what it was for, who was paid and how — M-Pesa, bank or cash — with the reference code, under its category.' },
                { title: 'Forward the receipt on WhatsApp', text: 'Her foreman photographs a hardware receipt and sends it to Najenga’s number. Najenga reads it and files a draft expense for someone to check.' },
                { title: 'Many at once', text: 'At month’s end the spreadsheet view takes a whole batch of payments in one go.' },
                { title: 'Spot what’s missing', text: 'The Spending panel shows totals by category and every expense still missing a receipt.' },
            ],
            details: [
                'Receipt Verification reads a receipt’s amount, merchant and date for you to confirm.',
                'Names that arrive in capitals from M-Pesa are shown in title case.',
                'Export any list of expenses to CSV for the bank or your accountant.',
            ],
            tip: 'Link your WhatsApp number in Settings → WhatsApp so what you send is filed under your name.',
        },
        {
            id: 'progress',
            when: 'As the walls go up',
            title: 'Watch it go up from anywhere',
            intro: 'Achieng can only visit once a month. Photos are how she sees her house.',
            media: { photo: `${BG}/pexels-d-goug-211350543-38210397.webp` },
            steps: [
                { title: 'Photos from site', text: 'The foreman uploads photos, or sends them on WhatsApp. Each one is dated from the camera, so they line up in the order they were taken.' },
                { title: 'Point at the problem', text: 'She pins a note on a photo — “this lintel looks low” — and her contractor answers in the comments beside it.' },
                { title: 'Milestones on one timeline', text: 'Foundation, walling, roofing, finishes: each milestone sits on the timeline with the expenses, photos and documents from the same weeks.' },
            ],
            details: [
                'Photos whose date had to be guessed are gathered under “Worth checking”.',
                'Group the photo timeline by day, week, month or year.',
                'Download a batch of photos as one zip.',
            ],
            tip: 'Ask for a photo from the same corner every week: side by side on the timeline, they show the progress best.',
        },
        {
            id: 'paperwork',
            when: 'All along',
            title: 'Keep the paperwork together',
            intro: 'The approved drawings, the county permit, the contract, the quotes: all of it in one place, with the project it belongs to.',
            media: { photo: `${BG}/pexels-expect-best-79873-323776.webp` },
            steps: [
                { title: 'Folders for each project', text: 'Plans, Permits, Contracts, Quotes — folders inside folders, as deep as she likes.' },
                { title: 'Open it in the browser', text: 'PDFs and images open in place, so nobody needs to download a drawing to check a measurement.' },
                { title: 'Find anything', text: 'The search at the top finds documents, expenses and photos across every project.' },
            ],
            details: [
                'Comments sit beside each document.',
                'Move a document between folders, or download several at once.',
            ],
            tip: null,
        },
        {
            id: 'handover',
            when: 'Keys in hand',
            title: 'Know exactly what it cost',
            intro: 'When the house is done, Achieng has the whole story: every payment, every photo and every change, with who made it.',
            media: { screen: '/marketing/analytics.webp' },
            steps: [
                { title: 'The final figures', text: 'The overview shows spending against the budget; Analytics breaks it down by category, month and who was paid.' },
                { title: 'Who did what', text: 'The version history and activity log show every change to every record, with field-by-field detail.' },
                { title: 'Undo a mistake', text: 'An expense deleted by accident comes back with one click from the version history.' },
            ],
            details: ['Every list exports to CSV.', 'The weekly WhatsApp summary email lands in your inbox until you turn it off.'],
            tip: 'Keep the project after handover: the records are useful for warranties, valuations and the next build.',
        },
    ],
    faqs: [
        { q: 'I live far from my site. Is Najenga for me?', a: 'Yes — it’s built for exactly that. Your foreman or contractor sends receipts and photos as work happens, and you see them the same day, with dates and amounts.' },
        { q: 'My contractor isn’t good with computers.', a: 'They don’t have to be. Sending receipts and photos to Najenga’s WhatsApp number is enough; you or someone you trust can check what was filed.' },
        { q: 'Can my contractor change my figures?', a: 'Only if you make them a manager or an editor, and every change they make is kept in the version history, with who made it and when. Make them a viewer if you’d rather they only looked.' },
        { q: 'Can I keep several builds apart?', a: 'Yes. Each build is its own project with its own budget, team and records; the switcher at the top picks which one you see.' },
    ],
};

export const CONTRACTOR_JOURNEY = {
    id: 'contractors',
    eyebrow: 'For contractors',
    title: 'Run every site from one place',
    text: 'Follow Otieno & Co., a contractor with four sites going at once around Nairobi: how the office, the site managers and the clients work in Najenga, from the first site set up to the last report.',
    photo: `${BG}/pexels-40037226-7667625.webp`,
    photoPosition: 'center 40%',
    glance: [
        ['Every site', 'under one sign-in'],
        ['1 switcher', 'to move between them'],
        ['Each client', 'sees only their own project'],
        ['1 click', 'to export any list'],
    ],
    chapters: [
        {
            id: 'sites',
            when: 'Day one',
            title: 'One sign-in, every site',
            intro: 'Otieno sets up a project for each site, each with its own budget, dates and location.',
            media: { screen: '/marketing/overview.webp' },
            steps: [
                { title: 'A project per site', text: 'Ruiru flats, the Kitengela bungalow, a church hall in Thika and a shop fit-out in Westlands — four projects, four budgets.' },
                { title: 'Switch in a tap', text: 'The switcher at the top picks a site, and every page — expenses, photos, documents, timeline — shows just that one.' },
                { title: 'All sites side by side', text: 'On “All projects” the overview shows each site’s budget bar and counts, and how many are over budget.' },
            ],
            details: ['Export the list of projects to CSV.', 'Each project keeps its own currency, for clients paying in dollars.'],
            tip: null,
        },
        {
            id: 'people',
            when: 'Before work starts',
            title: 'Your team, and your clients',
            intro: 'Site managers run their sites, foremen log what happens, and each client watches their own project — nobody else’s.',
            media: { screen: '/marketing/settings-projects.webp' },
            steps: [
                { title: 'Site managers as managers', text: 'Each site manager runs their project and can invite others to it.' },
                { title: 'Foremen as editors', text: 'They add expenses, photos and documents, and change them, but don’t manage who’s on the project.' },
                { title: 'Clients as viewers', text: 'The client of the Kitengela bungalow sees that project — its spending, photos and documents — and nothing of the other three.' },
            ],
            details: [
                'Invitations go by email and expire after 7 days.',
                'See who else is working, and on which page.',
                'Admins manage every account from the Users page.',
            ],
            tip: 'Invite clients early: seeing the photos and receipts as they arrive saves a lot of phone calls.',
        },
        {
            id: 'costs',
            when: 'Every day',
            title: 'Costs from the field, filed as they happen',
            intro: 'Money is spent on four sites at once. The office needs it recorded the same day, with proof, under the right project.',
            media: { screen: '/marketing/expenses.webp' },
            steps: [
                { title: 'Receipts on WhatsApp', text: 'Site managers send receipts and M-Pesa messages to Najenga’s number; Najenga reads them and files draft expenses for the office to check.' },
                { title: 'Checked by a person', text: 'Receipt Verification shows what was read beside the receipt itself, to confirm or correct before it counts.' },
                { title: 'The month in one sheet', text: 'The spreadsheet view takes a batch of expenses at once, and assigns them to a project in one go.' },
            ],
            details: [
                'Expenses are grouped by category, with the ones missing a receipt a click away.',
                'Re-classify anything WhatsApp filed under the wrong kind.',
                'A weekly email sums up what came in on WhatsApp, and the drafts waiting.',
            ],
            tip: 'Ask each site manager to link their own WhatsApp number in Settings, so receipts are filed under their name.',
        },
        {
            id: 'site',
            when: 'As work goes on',
            title: 'Progress your clients can see',
            intro: 'Photos and milestones show each client how their project is going, without a site visit or a weekly call.',
            media: { screen: '/marketing/timeline.webp' },
            steps: [
                { title: 'Photos by site and date', text: 'Photos are dated from the camera and kept with their project, on a timeline by day, week or month.' },
                { title: 'Snags, marked on the photo', text: 'A site manager pins a note on a crack or a misaligned window; the foreman replies in the comments.' },
                { title: 'Milestones', text: 'Each stage of the work is a milestone on the timeline, with its dates and status, alongside the costs and photos from the same weeks.' },
            ],
            details: ['Download a batch of photos as a zip for a client report.', 'Every change is in the version history, and restorable.'],
            tip: null,
        },
        {
            id: 'paperwork',
            when: 'All along',
            title: 'Drawings, approvals and quotes in order',
            intro: 'Every site has its own paperwork. Najenga keeps it with the project, in folders, where everyone on that project can find it.',
            media: { photo: `${BG}/pexels-expect-best-79873-323776.webp` },
            steps: [
                { title: 'Folders per project', text: 'Drawings, Approvals, Contracts, Quotes, Variations — set up the way your office works.' },
                { title: 'Open in place', text: 'PDFs and images preview in the browser, on the office screen or a phone on site.' },
                { title: 'One search for everything', text: 'Ctrl+K searches documents, expenses and photos across every site.' },
            ],
            details: ['Comments beside each document.', 'Move documents between folders, or download several at once.'],
            tip: null,
        },
        {
            id: 'reports',
            when: 'Month end',
            title: 'Report without the scramble',
            intro: 'Clients want to know where their money went. The figures are already there.',
            media: { screen: '/marketing/analytics.webp' },
            steps: [
                { title: 'Budget against spend', text: 'Each project’s overview shows its budget used; the all-projects view flags the ones over budget.' },
                { title: 'Where it went', text: 'Analytics breaks spending down by category, month, payment method and who was paid, for any period.' },
                { title: 'Export and send', text: 'Export a site’s expenses to CSV for the client or your accountant.' },
            ],
            details: ['Activity logs show who changed what, and every sign-in.', 'Pick the last 3 months, 6 months, a year or all time.'],
            tip: 'Pick a site in the switcher before opening Analytics to see that client’s figures alone.',
        },
    ],
    faqs: [
        { q: 'Can my clients see each other’s projects?', a: 'No. Each person sees only the projects they were invited to, so a client sees their own build and nothing else.' },
        { q: 'Do my site managers need a computer?', a: 'No. Najenga works in a phone’s browser, and receipts and photos can simply be sent on WhatsApp.' },
        { q: 'We already keep costs in spreadsheets.', a: 'The spreadsheet view takes a batch of expenses in one go, and any list exports back to CSV, so Najenga fits beside the spreadsheets you rely on.' },
        { q: 'What if someone deletes the wrong thing?', a: 'Every change is kept in the version history with who made it; restore the record with one click.' },
    ],
};

/** The journeys by id, and the feature areas each one leans on most. */
export const JOURNEYS = { homeowners: HOMEOWNER_JOURNEY, contractors: CONTRACTOR_JOURNEY };

export const TOOLKIT = {
    homeowners: ['money', 'site', 'team', 'insight'],
    contractors: ['team', 'money', 'site', 'insight'],
};
