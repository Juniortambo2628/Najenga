import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';

import Tour, { shouldAutoStart, startTour, TOUR_STEPS } from '../../../resources/js/Components/Tour';

const daysAgo = (n) => new Date(Date.now() - n * 86_400_000).toISOString();

// Mark the shell's targets, with a size so they count as on screen.
function Shell({ withSidebar = true }) {
    return (
        <div>
            {withSidebar && <nav data-tour="sidebar">pages</nav>}
            <div data-tour="project-switcher">switcher</div>
            <button data-tour="history">history</button>
            <div data-tour="notifications">bell</div>
            <div data-tour="account">me</div>
        </div>
    );
}

beforeEach(() => {
    try {
        localStorage.clear();
    } catch {
        /* storage unavailable */
    }
    vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function () {
        return { top: 10, left: 10, right: 110, bottom: 40, width: 100, height: 30 };
    });
});

describe('Tour', () => {
    it('starts by itself for a new account, once', () => {
        const user = { id: 5, created_at: daysAgo(2) };
        expect(shouldAutoStart(user)).toBe(true);
        expect(shouldAutoStart({ id: 6, created_at: daysAgo(60) })).toBe(false);

        render(<><Shell /><Tour user={user} autoStart /></>);
        expect(screen.getByRole('dialog', { name: 'Welcome to Najenga' })).toBeInTheDocument();
        expect(screen.getByText(`1 of ${TOUR_STEPS.length}`)).toBeInTheDocument();

        fireEvent.click(screen.getByRole('button', { name: 'Skip tour' }));
        expect(screen.queryByRole('dialog')).toBeNull();
        expect(shouldAutoStart(user)).toBe(false);
    });

    it('walks through the stops, back and forth, and finishes', () => {
        render(<><Shell /><Tour user={{ id: 7, created_at: daysAgo(400) }} /></>);
        expect(screen.queryByRole('dialog')).toBeNull();

        act(() => startTour());
        fireEvent.click(screen.getByRole('button', { name: 'Next' }));
        expect(screen.getByRole('dialog', { name: 'Your pages' })).toBeInTheDocument();
        fireEvent.click(screen.getByRole('button', { name: 'Back' }));
        expect(screen.getByRole('dialog', { name: 'Welcome to Najenga' })).toBeInTheDocument();

        for (let i = 1; i < TOUR_STEPS.length; i += 1) fireEvent.click(screen.getByRole('button', { name: 'Next' }));
        expect(screen.getByRole('dialog', { name: 'Your account' })).toBeInTheDocument();
        fireEvent.click(screen.getByRole('button', { name: 'Done' }));
        expect(screen.queryByRole('dialog')).toBeNull();
    });

    it('skips stops whose element is not on screen', () => {
        render(<><Shell withSidebar={false} /><Tour user={{ id: 8, created_at: daysAgo(1) }} /></>);
        act(() => startTour());
        expect(screen.getByText(`1 of ${TOUR_STEPS.length - 1}`)).toBeInTheDocument();
        fireEvent.click(screen.getByRole('button', { name: 'Next' }));
        expect(screen.getByRole('dialog', { name: 'Pick a project' })).toBeInTheDocument();
        fireEvent.keyDown(document, { key: 'Escape' });
        expect(screen.queryByRole('dialog')).toBeNull();
    });
});
