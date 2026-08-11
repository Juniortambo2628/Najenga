export const CURRENCIES = {
    KES: { symbol: 'KES', name: 'Kenyan Shilling', locale: 'en-KE' },
    USD: { symbol: '$', name: 'US Dollar', locale: 'en-US' },
    EUR: { symbol: '\u20AC', name: 'Euro', locale: 'de-DE' },
    GBP: { symbol: '\u00A3', name: 'British Pound', locale: 'en-GB' },
    UGX: { symbol: 'UGX', name: 'Ugandan Shilling', locale: 'en-UG' },
    TZS: { symbol: 'TZS', name: 'Tanzanian Shilling', locale: 'en-TZ' },
    NGN: { symbol: '\u20A6', name: 'Nigerian Naira', locale: 'en-NG' },
    ZAR: { symbol: 'R', name: 'South African Rand', locale: 'en-ZA' },
};

export const CURRENCY_OPTIONS = Object.entries(CURRENCIES).map(([code, info]) => ({
    value: code,
    label: `${info.symbol} \u2014 ${info.name}`,
}));

export function formatCurrency(amount, currency = 'KES') {
    const info = CURRENCIES[currency] || CURRENCIES.KES;
    const num = Number(amount);
    if (isNaN(num)) return `${info.symbol} 0`;
    try {
        return new Intl.NumberFormat(info.locale, {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(num);
    } catch {
        return `${info.symbol} ${num.toLocaleString()}`;
    }
}
