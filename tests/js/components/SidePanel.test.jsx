import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SidePanelAside, SidePanelMobileBar } from '../../../resources/js/Components/SidePanel';

const panel = (overrides = {}) => ({
    id: 'test',
    title: 'Sections',
    items: [
        { id: 'a', label: 'Alpha', badge: 3 },
        { id: 'b', label: 'Beta', count: 7 },
    ],
    activeId: 'a',
    onChange: vi.fn(),
    ...overrides,
});

describe('SidePanelAside', () => {
    beforeEach(() => localStorage.clear());

    it('marks the active section and switches on click', () => {
        const config = panel();
        render(<SidePanelAside panel={config} />);
        expect(screen.getByRole('button', { name: /Alpha/ })).toHaveAttribute('aria-current', 'true');
        expect(screen.getByText('3')).toBeInTheDocument();
        expect(screen.getByText('7')).toBeInTheDocument();
        fireEvent.click(screen.getByRole('button', { name: /Beta/ }));
        expect(config.onChange).toHaveBeenCalledWith('b');
    });

    it('collapses to a rail and remembers it', () => {
        const { unmount } = render(<SidePanelAside panel={panel()} />);
        fireEvent.click(screen.getByRole('button', { name: 'Hide Sections' }));
        expect(screen.getByRole('complementary')).toHaveAttribute('data-side-panel', 'collapsed');
        unmount();

        render(<SidePanelAside panel={panel()} />);
        expect(screen.getByRole('complementary')).toHaveAttribute('data-side-panel', 'collapsed');
        fireEvent.click(screen.getByRole('button', { name: 'Show Sections' }));
        expect(screen.getByRole('complementary')).toHaveAttribute('data-side-panel', 'expanded');
    });

    it('starts collapsed when asked and nothing is remembered', () => {
        render(<SidePanelAside panel={panel({ defaultCollapsed: true })} />);
        expect(screen.getByRole('complementary')).toHaveAttribute('data-side-panel', 'collapsed');
    });
});

describe('SidePanelMobileBar', () => {
    it('shows the sections as chips', () => {
        const config = panel();
        render(<SidePanelMobileBar panel={config} />);
        fireEvent.click(screen.getByRole('button', { name: /Beta/ }));
        expect(config.onChange).toHaveBeenCalledWith('b');
    });

    it('opens content-only panels as a bottom sheet', () => {
        render(<SidePanelMobileBar panel={{ title: 'Tools', content: <p>Tool list</p> }} />);
        expect(screen.queryByText('Tool list')).toBeNull();
        fireEvent.click(screen.getByRole('button', { name: /Tools/ }));
        expect(screen.getByRole('dialog', { name: 'Tools' })).toBeInTheDocument();
        expect(screen.getByText('Tool list')).toBeInTheDocument();
    });

    it('renders nothing without items or content', () => {
        const { container } = render(<SidePanelMobileBar panel={{ title: 'Empty' }} />);
        expect(container).toBeEmptyDOMElement();
    });
});
