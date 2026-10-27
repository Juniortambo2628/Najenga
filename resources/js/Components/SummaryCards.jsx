import StatCard from '@/Components/StatCard';

// Phones: two per row (one for a single card). From tablets up, one row when
// the cards fit, so four cards never leave one alone on a second row.
const gridColumns = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-2 md:grid-cols-3',
    4: 'grid-cols-2 xl:grid-cols-4',
    5: 'grid-cols-2 md:grid-cols-3 xl:grid-cols-5',
    6: 'grid-cols-2 md:grid-cols-3 xl:grid-cols-6',
};

/**
 * The overview cards under a page's hero.
 *
 * @param {Array}  cards     - [{ label, value, icon, hint?, trend?, onClick?, active? }];
 *                             a card with onClick is a button (e.g. it applies a filter)
 * @param {number} [columns] - Cards per row on wide screens (1–6); defaults to the card count, at most 4
 * @param {boolean} [stackOnPhones] - One card per row on phones (for wide values such as amounts)
 */
export default function SummaryCards({ cards = [], columns, stackOnPhones = false }) {
    if (!cards.length) return null;
    let cols = gridColumns[columns ?? Math.min(cards.length, 4)] || gridColumns[4];
    const compact = (columns ?? cards.length) >= 5;
    if (stackOnPhones) cols = cols.replace(/^grid-cols-2\b/, 'grid-cols-1 sm:grid-cols-2');

    return (
        <div className={`grid gap-3 lg:gap-4 ${cols}`}>
            {cards.map((card) => <StatCard key={card.label} compact={compact} {...card} />)}
        </div>
    );
}
