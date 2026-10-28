const DATE_ONLY = /^(\d{4})-(\d{2})-(\d{2})(?:$|T00:00:00(?:\.0+)?Z$)/;

/**
 * A date for people to read: "Oct 20, 2026" (or as `options` say).
 *
 * Date-only values ("2026-10-20", or Laravel's date cast "2026-10-20T00:00:00.000000Z")
 * are read as that calendar day wherever the reader is, so they never slip to
 * the day before. Anything else is a moment, shown in the reader's time zone.
 *
 * @returns {string|null} null for no date; the value as given when it isn't a date
 */
export default function formatDate(value, options = { day: 'numeric', month: 'short', year: 'numeric' }) {
    if (!value) return null;
    const day = String(value).match(DATE_ONLY);
    const date = day ? new Date(Date.UTC(Number(day[1]), Number(day[2]) - 1, Number(day[3]))) : new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);
    return date.toLocaleDateString('en-US', day ? { ...options, timeZone: 'UTC' } : options);
}

/** "Oct 20": for summary cards, with the year in the hint. */
export const shortDate = (value) => formatDate(value, { day: 'numeric', month: 'short' });

/** "2026" */
export const yearOf = (value) => formatDate(value, { year: 'numeric' });
