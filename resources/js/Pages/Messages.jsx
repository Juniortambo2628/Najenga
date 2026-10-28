import { useState, useEffect, useMemo, useRef } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage } from '@inertiajs/react';
import axios from 'axios';
import DashboardPage from '@/Components/DashboardPage';
import ListPanel from '@/Components/ListPanel';
import EmptyState from '@/Components/EmptyState';
import Button from '@/Components/Button';
import useAction from '@/Hooks/useAction';
import { rootBreadcrumbs } from '@/Config/navigation';
import { MessageBox } from 'react-chat-elements';
import 'react-chat-elements/dist/main.css';

/** The other person in a conversation (or a placeholder). */
const otherPerson = (conversation, userId) => conversation.users.find((u) => u.id !== userId) ?? { name: 'User' };

/** The side panel's rows: one per conversation, newest message first, matching the search. */
export function conversationItems(conversations, userId, search = '') {
    const q = search.trim().toLowerCase();
    return conversations
        .map((c) => ({ conversation: c, person: otherPerson(c, userId) }))
        .filter(({ conversation, person }) => !q || [person.name, conversation.project?.name, conversation.last_message?.body].some((field) => field?.toLowerCase().includes(q)))
        .sort((a, b) => new Date(b.conversation.last_message_at || 0) - new Date(a.conversation.last_message_at || 0))
        .map(({ conversation, person }) => ({
            id: String(conversation.id),
            label: person.name,
            description: conversation.last_message?.body || 'Start a conversation…',
            icon: 'fa-user',
            group: conversation.project?.name,
        }));
}

/**
 * Messages: conversations in the shared side panel (chips on phones), the
 * open conversation as the page's list panel: who it's with on top, the
 * messages scrolling, and the reply box pinned underneath.
 */
export default function Messages() {
    const { auth } = usePage().props;
    const [conversations, setConversations] = useState([]);
    const [selectedId, setSelectedId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const selected = conversations.find((c) => c.id === selectedId) ?? null;

    useEffect(() => {
        axios
            .get('/conversations')
            .then((response) => setConversations(response.data))
            .catch(() => setConversations([]));
    }, []);

    useEffect(() => {
        if (!selectedId) return;
        setLoading(true);
        axios
            .get(`/conversations/${selectedId}/messages`)
            .then((response) => setMessages(response.data.data))
            .catch(() => setMessages([]))
            .finally(() => setLoading(false));
    }, [selectedId]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView?.({ behavior: 'smooth', block: 'end' });
    }, [messages]);

    const send = useAction((conversationId, body) => axios.post(`/conversations/${conversationId}/messages`, { body }), {
        error: 'Message not sent',
        key: () => 'send',
        onSuccess: (response, conversationId) => {
            setMessages((list) => [...list, response.data]);
            setConversations((list) =>
                list.map((c) => (c.id === conversationId ? { ...c, last_message: response.data, last_message_at: response.data.created_at } : c)),
            );
        },
        // Give the text back so it can be sent again.
        onError: (err, conversationId, body) => setNewMessage(body),
    });

    const handleSend = (e) => {
        e?.preventDefault();
        if (!newMessage.trim() || !selected) return;
        const body = newMessage;
        setNewMessage('');
        send.run(selected.id, body);
    };

    const items = useMemo(() => conversationItems(conversations, auth.user.id, search), [conversations, auth.user.id, search]);
    const person = selected ? otherPerson(selected, auth.user.id) : null;

    return (
        <AuthenticatedLayout>
            <Head title="Messages" />

            <DashboardPage
                fill={!!selected}
                hero={{
                    title: 'Messages',
                    subtitle: `${conversations.length} conversation${conversations.length === 1 ? '' : 's'}`,
                    breadcrumbs: [...rootBreadcrumbs(), { label: 'Messages' }],
                }}
                toolbar={{ search: { value: search, onChange: setSearch, placeholder: 'Search conversations' } }}
                panel={{
                    id: 'messages',
                    title: 'Conversations',
                    icon: 'fa-comments',
                    subtitle: search ? `${items.length} matching` : 'Newest first',
                    items,
                    activeId: selected ? String(selected.id) : undefined,
                    onChange: (id) => setSelectedId(Number(id)),
                }}
            >
                {!selected ? (
                    <EmptyState
                        icon="fa-comments"
                        title={conversations.length ? 'Pick a conversation' : 'No conversations yet'}
                        message={conversations.length ? 'Choose someone from Conversations to read and reply.' : 'Conversations with your project team show here.'}
                    />
                ) : (
                    <ListPanel
                        header={
                            <div className="flex items-center gap-3 border-b border-white/[0.08] px-5 py-3">
                                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#8B0000] font-bold text-white">{person.name.charAt(0)}</span>
                                <div className="min-w-0">
                                    <h2 className="truncate font-semibold text-white">{person.name}</h2>
                                    {selected.project && <p className="truncate text-xs text-gray-400">{selected.project.name}</p>}
                                </div>
                            </div>
                        }
                        footer={
                            <form onSubmit={handleSend} className="flex items-end gap-2 p-3">
                                <label htmlFor="message-body" className="sr-only">
                                    Message to {person.name}
                                </label>
                                <textarea
                                    id="message-body"
                                    rows={1}
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) handleSend(e);
                                    }}
                                    placeholder="Write a message… (Shift+Enter for a new line)"
                                    className="max-h-40 min-h-[2.75rem] flex-1 resize-y rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-gray-400 focus:border-[#8B0000] focus:outline-none"
                                />
                                <Button type="submit" disabled={!newMessage.trim() || send.pending}>
                                    <i aria-hidden="true" className="fas fa-paper-plane" />
                                    Send
                                </Button>
                            </form>
                        }
                        bodyClassName="space-y-2 p-4"
                    >
                        {loading ? (
                            <div className="flex justify-center py-10">
                                <i aria-label="Loading messages" className="fas fa-spinner fa-spin text-2xl text-[#8B0000]" />
                            </div>
                        ) : messages.length === 0 ? (
                            <p className="py-10 text-center text-sm text-gray-400">No messages yet. Say hello.</p>
                        ) : (
                            messages.map((msg) => (
                                <MessageBox
                                    key={msg.id}
                                    position={msg.user_id === auth.user.id ? 'right' : 'left'}
                                    type="text"
                                    text={msg.body}
                                    date={new Date(msg.created_at)}
                                    status={msg.read_at ? 'read' : 'sent'}
                                    className={msg.user_id === auth.user.id ? 'my-message' : 'other-message'}
                                />
                            ))
                        )}
                        <div ref={messagesEndRef} />
                    </ListPanel>
                )}
            </DashboardPage>
        </AuthenticatedLayout>
    );
}
