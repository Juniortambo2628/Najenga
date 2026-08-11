import { describe, it, expect } from 'vitest';
import { formatCurrency, CURRENCIES, CURRENCY_OPTIONS } from '../../../resources/js/Config/currencies';

describe('currencies', () => {
    describe('CURRENCIES', () => {
        it('contains KES', () => {
            expect(CURRENCIES.KES).toBeDefined();
            expect(CURRENCIES.KES.symbol).toBe('KES');
            expect(CURRENCIES.KES.locale).toBe('en-KE');
        });

        it('contains USD', () => {
            expect(CURRENCIES.USD).toBeDefined();
            expect(CURRENCIES.USD.symbol).toBe('$');
        });
    });

    describe('CURRENCY_OPTIONS', () => {
        it('returns array of { value, label } objects', () => {
            expect(Array.isArray(CURRENCY_OPTIONS)).toBe(true);
            expect(CURRENCY_OPTIONS.length).toBeGreaterThan(0);
            expect(CURRENCY_OPTIONS[0]).toHaveProperty('value');
            expect(CURRENCY_OPTIONS[0]).toHaveProperty('label');
        });

        it('includes KES option', () => {
            const kes = CURRENCY_OPTIONS.find(o => o.value === 'KES');
            expect(kes).toBeDefined();
            expect(kes.label).toContain('KES');
        });
    });

    describe('formatCurrency', () => {
        it('formats KES correctly', () => {
            const result = formatCurrency(1000, 'KES');
            expect(result).toContain('1');
            expect(result).toContain('000');
        });

        it('formats USD correctly', () => {
            const result = formatCurrency(50, 'USD');
            expect(result).toContain('50');
        });

        it('defaults to KES when currency unknown', () => {
            const result = formatCurrency(100, 'XYZ');
            expect(result).toBeDefined();
        });

        it('returns fallback for NaN input', () => {
            const result = formatCurrency('not-a-number', 'KES');
            expect(result).toContain('0');
        });

        it('handles zero amount', () => {
            const result = formatCurrency(0, 'KES');
            expect(result).toBeDefined();
        });

        it('handles negative amount', () => {
            const result = formatCurrency(-500, 'KES');
            expect(result).toBeDefined();
        });
    });
});
