import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Link } from '@inertiajs/react';

export default function NotificationsDropdown() {
    const [notifications, setNotifications] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const dropdownRef = useRef(null);

    const fetchNotifications = async () => {
        try {
            const res = await axios.get('/notifications');
            setNotifications(res.data);
            setUnreadCount(res.data.length); // Assuming endpoint returns unread
        } catch (error) {
            console.error("Failed to fetch notifications", error);
        }
    };

    useEffect(() => {
        fetchNotifications();
        // Poll every 30 seconds
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    // Close on click outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const markAsRead = async (id) => {
        try {
            await axios.post(`/notifications/${id}/read`);
            setNotifications(notifications.filter(n => n.id !== id));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error("Failed to mark read", error);
        }
    };

    const markAllRead = async () => {
        try {
            await axios.post('/notifications/read-all');
            setNotifications([]);
            setUnreadCount(0);
        } catch (error) {
            console.error("Failed to mark all read", error);
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button 
                onClick={() => setIsOpen(!isOpen)} 
                className="relative p-2 text-gray-400 hover:text-white transition rounded-full hover:bg-white/10"
            >
                <i className="fas fa-bell text-xl"></i>
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-gray-900"></span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50">
                    <div className="p-4 border-b border-white/10 flex justify-between items-center">
                        <h3 className="text-white font-bold">Notifications</h3>
                        {unreadCount > 0 && (
                            <button onClick={markAllRead} className="text-xs text-gray-400 hover:text-white">
                                Mark all read
                            </button>
                        )}
                    </div>

                    <div className="max-h-80 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">
                                <i className="far fa-bell-slash text-2xl mb-2"></i>
                                <p className="text-sm">No new notifications</p>
                            </div>
                        ) : (
                            notifications.map(notification => (
                                <div key={notification.id} className="p-4 border-b border-white/5 hover:bg-white/5 transition flex gap-3 relative group">
                                    <div className="w-8 h-8 rounded-full bg-gray-700 flex-shrink-0 flex items-center justify-center text-xs text-white overflow-hidden">
                                        {notification.data.user_avatar ? (
                                            <img src={notification.data.user_avatar} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <i className={`fas ${notification.data.type === 'comment' ? 'fa-comment' : 'fa-thumbtack'}`}></i>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm text-gray-200 leading-snug">{notification.data.body}</p>
                                        <span className="text-xs text-gray-500 mt-1 block">{new Date(notification.created_at).toLocaleTimeString()}</span>
                                    </div>
                                    <button 
                                        onClick={() => markAsRead(notification.id)}
                                        className="absolute top-2 right-2 text-gray-600 hover:text-white opacity-0 group-hover:opacity-100 transition"
                                        title="Mark as read"
                                    >
                                        <i className="fas fa-check"></i>
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
