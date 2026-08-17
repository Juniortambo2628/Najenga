import { useState, useEffect, useRef } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage } from '@inertiajs/react';
import axios from 'axios';
import { MessageBox, ChatList, Input, Button } from 'react-chat-elements';
import 'react-chat-elements/dist/main.css';
import DashboardHero from '@/Components/DashboardHero';

export default function Messages() {
    const { auth } = usePage().props;
    const [conversations, setConversations] = useState([]);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        fetchConversations();
    }, []);

    useEffect(() => {
        if (selectedConversation) {
            fetchMessages(selectedConversation.id);
        }
    }, [selectedConversation]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const fetchConversations = async () => {
        try {
            const response = await axios.get('/conversations');
            setConversations(response.data);
        } catch (error) {
            console.error("Failed to fetch conversations", error);
        }
    };

    const fetchMessages = async (conversationId) => {
        setLoading(true);
        try {
            const response = await axios.get(`/conversations/${conversationId}/messages`);
            // paginate handling if needed, but for now simple:
            setMessages(response.data.data);
        } catch (error) {
            console.error("Failed to fetch messages", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSendMessage = async () => {
        if (!newMessage.trim() || !selectedConversation) return;

        const body = newMessage;
        setNewMessage('');

        try {
            const response = await axios.post(`/conversations/${selectedConversation.id}/messages`, {
                body: body
            });
            
            setMessages([...messages, response.data]);
            
            // Update conversation list item last message
            setConversations(conversations.map(c => {
                if (c.id === selectedConversation.id) {
                    return { ...c, last_message: response.data, last_message_at: response.data.created_at };
                }
                return c;
            }));
        } catch (error) {
            console.error("Failed to send message", error);
        }
    };

    const chatListData = conversations.map(c => {
        const otherUser = c.users.find(u => u.id !== auth.user.id);
        return {
            id: c.id,
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(otherUser?.name || 'User')}&background=8B0000&color=fff`,
            alt: otherUser?.name || 'User',
            title: otherUser?.name || 'User',
            subtitle: c.last_message?.body || 'Start a conversation...',
            date: c.last_message_at ? new Date(c.last_message_at) : null,
            unread: 0, // Backend could provide unread count
            className: selectedConversation?.id === c.id ? 'bg-white/5' : '',
            conversation: c
        };
    });

    return (
        <AuthenticatedLayout>
            <Head title="Messages" />

            <div className="h-[calc(100vh-64px)] flex overflow-hidden bg-black">
                {/* Conversations Sidebar */}
                <div className="w-80 border-r border-white/10 flex flex-col bg-black/40">
                    <div className="p-4 border-b border-white/10">
                        <h2 className="text-xl font-bold text-white mb-4">Messages</h2>
                        <div className="relative">
                            <input 
                                type="text"
                                placeholder="Search conversations..."
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#8B0000]"
                            />
                        </div>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        <ChatList
                            className="chat-list dark-theme"
                            dataSource={chatListData}
                            onClick={(item) => setSelectedConversation(item.conversation)}
                        />
                    </div>
                </div>

                {/* Chat Area */}
                <div className="flex-1 flex flex-col relative">
                    {selectedConversation ? (
                        <>
                            {/* Chat Header */}
                            <div className="p-4 border-b border-white/10 flex items-center justify-between bg-black/40">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-[#8B0000] flex items-center justify-center text-white font-bold">
                                        {selectedConversation.users.find(u => u.id !== auth.user.id)?.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white">
                                            {selectedConversation.users.find(u => u.id !== auth.user.id)?.name}
                                        </h3>
                                        {selectedConversation.project && (
                                            <span className="text-[10px] text-gray-500 uppercase tracking-widest bg-white/5 px-2 py-0.5 rounded border border-white/5">
                                                {selectedConversation.project.name}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Messages List */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar bg-black/20">
                                {loading ? (
                                    <div className="flex items-center justify-center h-full">
                                        <i className="fas fa-spinner fa-spin text-2xl text-[#8B0000]"></i>
                                    </div>
                                ) : (
                                    messages.map((msg, idx) => (
                                        <MessageBox
                                            key={msg.id}
                                            position={msg.user_id === auth.user.id ? 'right' : 'left'}
                                            type={'text'}
                                            text={msg.body}
                                            date={new Date(msg.created_at)}
                                            status={msg.read_at ? 'read' : 'sent'}
                                            avatar={null}
                                            className={msg.user_id === auth.user.id ? 'my-message' : 'other-message'}
                                        />
                                    ))
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input Area */}
                            <div className="p-4 bg-black/60 border-t border-white/10">
                                <div className="flex items-end gap-2">
                                    <div className="flex-1">
                                        <Input
                                            placeholder="Write something..."
                                            multiline={true}
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            inputStyle={{ 
                                                backgroundColor: '#1a1a1a', 
                                                color: '#fff', 
                                                border: '1px solid rgba(255,255,255,0.1)',
                                                borderRadius: '12px',
                                                padding: '12px'
                                            }}
                                            onKeyPress={(e) => {
                                                if (e.shiftKey && e.charCode === 13) return;
                                                if (e.charCode === 13) {
                                                    handleSendMessage();
                                                    e.preventDefault();
                                                }
                                            }}
                                        />
                                    </div>
                                    <Button
                                        text={'Send'}
                                        onClick={handleSendMessage}
                                        title="Send"
                                        buttonStyle={{
                                            backgroundColor: '#8B0000',
                                            color: '#fff',
                                            borderRadius: '12px',
                                            height: '45px',
                                            fontWeight: 'bold'
                                        }}
                                    />
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center bg-black/40 grayscale opacity-20">
                            <i className="fas fa-comments text-8xl mb-4"></i>
                            <h2 className="text-2xl font-bold">Your Messages</h2>
                            <p>Select a conversation to start chatting</p>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
