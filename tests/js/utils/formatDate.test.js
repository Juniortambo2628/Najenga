import { describe, it, expect } from 'vitest';
import formatDate, { shortDate, yearOf } from '../../../resources/js/Utils/formatDate';

describe('formatDate', () => {
    it('reads date-only values as that calendar day', () => {
        expect(formatDate('2026-10-01')).toBe('Oct 1, 2026');
        expect(formatDate('2026-10-01T00:00:00.000000Z')).toBe('Oct 1, 2026');
        expect(shortDate('2026-10-20T00:00:00.000000Z')).toBe('Oct 20');
        expect(yearOf('2026-10-20')).toBe('2026');
    });

    it('leaves empty and unreadable values alone', () => {
        expect(formatDate(null)).toBeNull();
        expect(formatDate('')).toBeNull();
        expect(formatDate('soon')).toBe('soon');
    });
});
