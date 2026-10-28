import { describe, it, expect } from 'vitest';
import titleCase from '../../../resources/js/Utils/titleCase';

describe('titleCase', () => {
    it('shows names that arrive in capitals in title case', () => {
        expect(titleCase('BERNARD OWINO')).toBe('Bernard Owino');
        expect(titleCase('MAGGA-EQUITY')).toBe('Magga-Equity');
    });

    it('keeps codes, initialisms and text that already has lower case', () => {
        expect(titleCase('STEEL BARS Y12')).toBe('Steel Bars Y12');
        expect(titleCase('KCB BANK')).toBe('KCB Bank');
        expect(titleCase('Cement, 40 bags')).toBe('Cement, 40 bags');
        expect(titleCase(null)).toBeNull();
        expect(titleCase('A')).toBe('A');
    });
});
