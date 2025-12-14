import React, { useState, useEffect } from 'react';
import { getMyNotifications, markAsRead } from '../../services/notificationService';
import { Bell, Check } from 'lucide-react';
import './Notifications.css';

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        const result = await getMyNotifications();
        if (result.success) {
            setNotifications(result.data);
        }
        setLoading(false);
    };

    const handleMarkAsRead = async (id) => {
        const result = await markAsRead(id);
        if (result.success) {
            setNotifications(notifications.map(n =>
                n.id === id ? { ...n, isRead: true } : n
            ));
        }
    };

    if (loading) {
        return <div className="loading-container">Loading notifications...</div>;
    }

    return (
        <div className="notifications-container">
            <div className="notifications-header">
                <h1>Notifications</h1>
                <span className="badge">{notifications.filter(n => !n.isRead).length} Unread</span>
            </div>

            <div className="notifications-list">
                {notifications.length === 0 ? (
                    <div className="empty-state">
                        <Bell size={48} />
                        <h3>No notifications</h3>
                        <p>You're all caught up!</p>
                    </div>
                ) : (
                    notifications.map(notification => (
                        <div
                            key={notification.id}
                            className={`notification-item ${notification.isRead ? 'read' : 'unread'}`}
                        >
                            <div className="notification-icon">
                                <Bell size={20} />
                            </div>
                            <div className="notification-content">
                                <div className="notification-header">
                                    <h3>{notification.title}</h3>
                                    <span className="notification-time">
                                        {new Date(notification.createdAt).toLocaleString()}
                                    </span>
                                </div>
                                <p>{notification.message}</p>
                            </div>
                            {!notification.isRead && (
                                <button
                                    className="mark-read-btn"
                                    onClick={() => handleMarkAsRead(notification.id)}
                                    title="Mark as read"
                                >
                                    <Check size={16} />
                                </button>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Notifications;
