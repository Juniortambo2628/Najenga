import { EmptyState } from '@okjt/dashboard';

/** The kit's EmptyState, as Najenga shows it: the card, with a title and a solid action. */
export default function NajengaEmptyState(props) {
    return <EmptyState variant="card" {...props} />;
}
