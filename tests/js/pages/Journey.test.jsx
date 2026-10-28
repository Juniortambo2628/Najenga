import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';

vi.mock('@inertiajs/react', () => ({
    Head: () => null,
    Link: ({ href, children, ...rest }) => <a href={href} {...rest}>{children}</a>,
}));

import Journey from '../../../resources/js/Pages/Journey';
import { JOURNEYS, TOOLKIT } from '../../../resources/js/Config/journeys';
import { featureGroup } from '../../../resources/js/Config/marketing';

describe('the journey pages', () => {
    it.each(['homeowners', 'contractors'])('%s: every chapter in order, each linked from the bar', (id) => {
        const { container } = render(<Journey auth={{ user: null }} journeyId={id} />);
        const journey = JOURNEYS[id];
        expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(journey.title);
        expect(screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent)).toEqual(expect.arrayContaining(journey.chapters.map((c) => c.title)));

        const bar = screen.getByRole('navigation', { name: 'The journey' });
        within(bar).getAllByRole('link').forEach((link) => expect(container.querySelector(link.getAttribute('href'))).not.toBeNull());
    });

    it('points to the other journey, and every toolkit card is a real feature area', () => {
        render(<Journey auth={{ user: null }} journeyId="homeowners" />);
        expect(screen.getByRole('link', { name: /Run every site from one place/ })).toHaveAttribute('href', '/for-contractors');
        Object.values(TOOLKIT).flat().forEach((group) => expect(featureGroup(group)).toBeDefined());
    });

    it('answers its own questions', () => {
        render(<Journey auth={{ user: null }} journeyId="contractors" />);
        const question = screen.getByRole('button', { name: /Can my clients see each other’s projects/ });
        expect(question).toHaveAttribute('aria-expanded', 'true');
        fireEvent.click(screen.getByRole('button', { name: /Do my site managers need a computer/ }));
        expect(screen.getByText(/works in a phone’s browser/)).toBeInTheDocument();
    });
});
