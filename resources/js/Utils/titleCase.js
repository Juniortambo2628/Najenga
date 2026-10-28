/**
 * Names that arrive in capitals (M-Pesa messages, receipts: "BERNARD OWINO")
 * shown in title case ("Bernard Owino"). Text that already has lower-case
 * letters is left alone, and so are words with digits ("Y12") or no vowels
 * (initialisms like "KCB"). Only for display: the stored value is unchanged.
 */
export default function titleCase(text) {
    if (typeof text !== 'string' || !/[A-Z]{2}/.test(text) || /[a-z]/.test(text)) return text;
    return text.replace(/[A-Z0-9']+/g, (word) => (/\d/.test(word) || !/[AEIOUY]/.test(word) ? word : word.charAt(0) + word.slice(1).toLowerCase()));
}
