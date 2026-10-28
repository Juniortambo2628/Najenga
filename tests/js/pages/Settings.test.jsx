import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';

const page = vi.hoisted(() => ({
    component: 'Profile/Edit',
    props: { auth: { user: { id: 1, role: 'client', email: 'a@example.com', login_notifications_enabled: true }, projects: [{ id: 7, name: 'Kitengela', role: 'owner' }] }, errors: {} },
}));

vi.mock('@inertiajs/react', () => ({
    Head: () => null,
    Link: ({ href, children, ...rest }) => <a href={href} {...rest}>{children}</a>,
    usePage: () => page,
    useForm: () => ({ data: {}, setData: vi.fn(), patch: vi.fn(), put: vi.fn(), delete: vi.fn(), errors: {}, processing: false, reset: vi.fn(), recentlySuccessful: false }),
    router: { visit: vi.fn(), patch: vi.fn(), post: vi.fn() },
}));
vi.mock('@/Layouts/AuthenticatedLayout', () => ({ default: ({ children }) => children }));

import Edit, { settingsSections } from '../../../resources/js/Pages/Profile/Edit';

const props = { whatsapp: {}, twoFactor: { enabled: true }, passkeys: [], preferences: { currency: 'KES', activity_notifications: true, weekly_digest: false } };

describe('settingsSections', () => {
    it('summarises each section, and only admins get the workspace', () => {
        const sections = settingsSections({ isAdmin: false, twoFactor: { enabled: true }, passkeys: [{}, {}], loginAlerts: false, projects: [{}] });
        const byId = Object.fromEntries(sections.map((s) => [s.id, s]));
        expect(byId['two-factor'].description).toBe('On');
        expect(byId.passkeys.description).toBe('2 passkeys');
        expect(byId['sign-in'].description).toBe('Off');
        expect(byId.projects.description).toBe('1 project');
        expect(byId.workspace).toBeUndefined();
        expect(settingsSections({ isAdmin: true }).map((s) => s.id)).toContain('workspace');
    });
});

describe('the Settings page', () => {
    it('opens the asked-for section and switches from the side panel', () => {
        render(<Edit {...props} section="preferences" />);
        expect(screen.getByRole('heading', { name: 'Currency' })).toBeInTheDocument();
        expect(screen.getByRole('switch', { name: 'Weekly WhatsApp summary' })).not.toBeChecked();

        const panel = screen.getByRole('complementary', { name: 'Settings' });
        fireEvent.click(within(panel).getByRole('button', { name: /Your projects/ }));
        expect(screen.getByRole('link', { name: 'Kitengela' })).toHaveAttribute('href', '/projects/7');
        expect(screen.getByRole('button', { name: 'Share…' })).toBeInTheDocument();
    });
});
