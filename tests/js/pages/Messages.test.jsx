import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, within, waitFor } from '@testing-library/react';

const page = vi.hoisted(() => ({ props: { auth: { user: { id: 1 }, projects: [] } }, component: 'Messages' }));
const axiosMock = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn() }));
vi.mock('axios', () => ({ default: axiosMock }));
vi.mock('@inertiajs/react', () => ({
    Head: () => null,
    Link: ({ href, children, ...rest }) => <a href={href} {...rest}>{children}</a>,
    usePage: () => page,
    router: { reload: vi.fn(), visit: vi.fn() },
}));
vi.mock('@/Layouts/AuthenticatedLayout', () => ({ default: ({ children }) => children }));
vi.mock('react-chat-elements', () => ({ MessageBox: ({ text }) => <p>{text}</p> }));
vi.mock('react-chat-elements/dist/main.css', () => ({}));

import Messages, { conversationItems } from '../../../resources/js/Pages/Messages';

const conversations = [
    { id: 4, users: [{ id: 1, name: 'Me' }, { id: 2, name: 'Mary Manager' }], project: { name: 'Kitengela site' }, last_message: { body: 'Slab poured' }, last_message_at: '2026-10-27T10:00:00Z' },
    { id: 5, users: [{ id: 1, name: 'Me' }, { id: 3, name: 'Otieno' }], project: null, last_message: null, last_message_at: '2026-10-28T10:00:00Z' },
];

beforeEach(() => {
    axiosMock.get.mockReset();
    axiosMock.post.mockReset();
    axiosMock.get.mockImplementation((url) =>
        Promise.resolve(url === '/conversations' ? { data: conversations } : { data: { data: [{ id: 9, user_id: 2, body: 'Slab poured', created_at: '2026-10-27T10:00:00Z' }] } }),
    );
});

describe('conversationItems', () => {
    it('lists the other person, newest first, grouped by project, and searches', () => {
        const items = conversationItems(conversations, 1);
        expect(items.map((i) => i.label)).toEqual(['Otieno', 'Mary Manager']);
        expect(items[1]).toMatchObject({ id: '4', group: 'Kitengela site', description: 'Slab poured' });
        expect(conversationItems(conversations, 1, 'kitengela').map((i) => i.label)).toEqual(['Mary Manager']);
    });
});

describe('the Messages page', () => {
    it('opens a conversation from the side panel and sends a reply', async () => {
        axiosMock.post.mockResolvedValue({ data: { id: 10, user_id: 1, body: 'Thanks', created_at: '2026-10-28T11:00:00Z' } });
        render(<Messages />);
        const panel = await screen.findByRole('complementary', { name: 'Conversations' });
        fireEvent.click(await within(panel).findByRole('button', { name: /Mary Manager/ }));

        expect(await screen.findByRole('heading', { name: 'Mary Manager' })).toBeInTheDocument();
        await screen.findByText('Slab poured', { selector: 'p' });

        fireEvent.change(screen.getByLabelText('Message to Mary Manager'), { target: { value: 'Thanks' } });
        fireEvent.click(screen.getByRole('button', { name: /Send/ }));
        await waitFor(() => expect(axiosMock.post).toHaveBeenCalledWith('/conversations/4/messages', { body: 'Thanks' }));
        expect(await screen.findByText('Thanks', { selector: 'p' })).toBeInTheDocument();
    });
});
