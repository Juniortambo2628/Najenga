/**
 * Najenga's notifications as the kit's bell shows them. They are Laravel
 * database notifications (GET /notifications, the unread ones), with what
 * happened under `data`: { title, body, action_url, type, user_name }.
 */

/** A link inside the app, as a path (action_url may be a full URL). */
function pathOf(url) {
    if (!url) return null;
    try {
        const parsed = new URL(url, window.location.origin);
        return parsed.origin === window.location.origin ? parsed.pathname + parsed.search + parsed.hash : null;
    } catch {
        return null;
    }
}

export function bellItem(notification) {
    const data = notification.data ?? {};
    return {
        id: notification.id,
        title: data.title || 'Notification',
        message: data.body || '',
        link: pathOf(data.action_url),
        icon: data.type === 'comment' ? 'mail' : 'bell',
        read_at: notification.read_at,
        created_at: notification.created_at,
    };
}

/** NotificationsBell's props for Najenga's API. */
export const BELL = { listPath: '/notifications', markAllPath: '/notifications/read-all', map: bellItem };
