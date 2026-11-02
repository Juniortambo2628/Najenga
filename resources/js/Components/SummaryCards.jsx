import { AdminSummaryCards } from '@okjt/dashboard';

/**
 * The overview cards under a page's hero: the kit's, in Najenga's bold look.
 * cards: [{ label, value, icon, hint?, trend?, onClick?, active? }]; columns,
 * stackOnPhones: see AdminSummaryCards.
 */
export default function SummaryCards(props) {
    return <AdminSummaryCards variant="bold" {...props} />;
}
