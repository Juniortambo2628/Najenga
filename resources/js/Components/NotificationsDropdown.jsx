import useAction from '@/Hooks/useAction';
import { NotificationsBell } from '@okjt/dashboard';

/**
 * The header's notifications: the OKJT kit's NotificationsBell (fetching,
 * polling every 30 seconds, marking read, opening and closing, which now
 * includes a click outside and Escape) drawn in Najenga's look. The server
 * answers with unread notifications only; one marked read leaves the list.
 */
export default function NotificationsDropdown() {
    return (
        <NotificationsBell
            listPath="/notifications"
            markOnePath="/notifications/:id/read"
            markAllPath="/notifications/read-all"
            renderButton={(bell) => <BellButton {...bell} />}
            renderPanel={(bell) => <BellPanel {...bell} />}
        />
    );
}

function BellButton({ open, toggle, unreadCount }) {
    return (
        <button 
            onClick={toggle} 
            aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : 'Notifications'}
            aria-expanded={open}
            className="relative p-2 text-gray-400 hover:text-white transition rounded-full hover:bg-white/10"
        >
            <i aria-hidden="true" className="fas fa-bell text-xl"></i>
            {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-gray-900"></span>
            )}
        </button>
    );
}

function BellPanel({ notifications: all, unreadCount, markRead, markAllRead: markAllReadNow }) {
    const notifications = all.filter((n) => !n.read_at);

    const markOne = useAction((id) => markRead(id), {
        error: 'Could not mark the notification as read',
    });
    const markAsRead = markOne.run;

    const markAll = useAction(() => markAllReadNow(), {
        error: 'Could not mark notifications as read',
        key: () => 'all',
    });
    const markAllRead = () => markAll.run();

    return (
        <div className="absolute right-0 mt-2 w-80 bg-surface-overlay border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50">
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
                        <div className="p-8 text-center text-gray-400">
                            <i aria-hidden="true" className="far fa-bell-slash text-2xl mb-2"></i>
                            <p className="text-sm">No new notifications</p>
                        </div>
                    ) : (
                        notifications.map(notification => (
                            <div key={notification.id} className="p-4 border-b border-white/5 hover:bg-white/5 transition flex gap-3 relative group">
                                <div className="w-8 h-8 rounded-full bg-white/10 flex-shrink-0 flex items-center justify-center text-xs text-white overflow-hidden">
                                    {notification.data.user_avatar ? (
                                        <img loading="lazy" decoding="async"  src={notification.data.user_avatar} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <i aria-hidden="true" className={`fas ${notification.data.type === 'comment' ? 'fa-comment' : 'fa-thumbtack'}`}></i>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm text-gray-200 leading-snug">{notification.data.body}</p>
                                    <span className="text-xs text-gray-400 mt-1 block">{new Date(notification.created_at).toLocaleTimeString()}</span>
                                </div>
                                <button 
                                    onClick={() => markAsRead(notification.id)}
                                    className="absolute top-2 right-2 text-gray-400 hover:text-white opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition"
                                    title="Mark as read"
                                    aria-label="Mark as read"
                                >
                                    <i aria-hidden="true" className="fas fa-check"></i>
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>
    );
}
