import api from './api';

export const getUnreadCount = async () => {
    try {
        const response = await api.get('/notifications/unread-count');
        return { success: true, count: response.data.unreadCount };
    } catch (error) {
        console.error('Failed to fetch unread count:', error);
        return { success: false, count: 0 };
    }
};

export const markAsRead = async (id) => {
    try {
        await api.put(`/notifications/${id}/read`);
        return { success: true };
    } catch (error) {
        console.error('Failed to mark notification as read:', error);
        return { success: false };
    }
};

export const getMyNotifications = async () => {
    try {
        const response = await api.get('/notifications');
        return { success: true, data: response.data };
    } catch (error) {
        console.error('Failed to fetch notifications:', error);
        return { success: false, data: [] };
    }
};
