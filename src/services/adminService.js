import api from './api';

// ==================== DASHBOARD STATS ====================

export const getAdminStats = async () => {
    try {
        const response = await api.get('/admin/stats');
        return { success: true, data: response.data };
    } catch (error) {
        return {
            success: false,
            message: error.response?.data?.message || 'Failed to fetch stats',
        };
    }
};

// ==================== USER MANAGEMENT ====================

export const getAllUsers = async (role = null, isActive = null) => {
    try {
        const params = {};
        if (role) params.role = role;
        if (isActive !== null) params.isActive = isActive;

        const response = await api.get('/admin/users', { params });
        return { success: true, data: response.data };
    } catch (error) {
        return {
            success: false,
            message: error.response?.data?.message || 'Failed to fetch users',
        };
    }
};

export const getUserById = async (id) => {
    try {
        const response = await api.get(`/admin/users/${id}`);
        return { success: true, data: response.data };
    } catch (error) {
        return {
            success: false,
            message: error.response?.data?.message || 'Failed to fetch user',
        };
    }
};

export const updateUser = async (id, data) => {
    try {
        const response = await api.put(`/admin/users/${id}`, data);
        return { success: true, message: response.data.message };
    } catch (error) {
        return {
            success: false,
            message: error.response?.data?.message || 'Failed to update user',
        };
    }
};

export const deleteUser = async (id) => {
    try {
        const response = await api.delete(`/admin/users/${id}`);
        return { success: true, message: response.data.message };
    } catch (error) {
        return {
            success: false,
            message: error.response?.data?.message || 'Failed to delete user',
        };
    }
};

export const deactivateUser = async (id, days, reason) => {
    try {
        const response = await api.put(`/admin/users/${id}/deactivate`, { days, reason });
        return { success: true, message: response.data.message };
    } catch (error) {
        return {
            success: false,
            message: error.response?.data?.message || 'Failed to deactivate user',
        };
    }
};

export const activateUser = async (id) => {
    try {
        const response = await api.put(`/admin/users/${id}/activate`);
        return { success: true, message: response.data.message };
    } catch (error) {
        return {
            success: false,
            message: error.response?.data?.message || 'Failed to activate user',
        };
    }
};

export const changeUserRole = async (id, newRole) => {
    try {
        const response = await api.put(`/admin/users/${id}/role`, { newRole });
        return { success: true, message: response.data.message };
    } catch (error) {
        return {
            success: false,
            message: error.response?.data?.message || 'Failed to update user role',
        };
    }
};

export const getAllJobs = async (status = null) => {
    try {
        let url = '/admin/jobs';
        if (status && status !== 'all') {
            url += `?status=${status}`;
        }
        const response = await api.get(url);
        return { success: true, data: response.data };
    } catch (error) {
        return {
            success: false,
            message: error.response?.data?.message || 'Failed to fetch jobs',
        };
    }
};

export const approveJob = async (id) => {
    try {
        const response = await api.put(`/admin/jobs/${id}/approve`);
        return { success: true, message: response.data.message };
    } catch (error) {
        return {
            success: false,
            message: error.response?.data?.message || 'Failed to approve job',
        };
    }
};

export const rejectJob = async (id, rejectionReason) => {
    try {
        const response = await api.put(`/admin/jobs/${id}/reject`, { rejectionReason });
        return { success: true, message: response.data.message };
    } catch (error) {
        return {
            success: false,
            message: error.response?.data?.message || 'Failed to reject job',
        };
    }
};

export const deleteJob = async (id) => {
    try {
        const response = await api.delete(`/admin/jobs/${id}`);
        return { success: true, message: response.data.message };
    } catch (error) {
        return {
            success: false,
            message: error.response?.data?.message || 'Failed to delete job',
        };
    }
};

// ==================== GLOBAL NOTIFICATIONS ====================

export const broadcastNotification = async (title, message, targetRole = null) => {
    try {
        const response = await api.post('/admin/notifications/broadcast', {
            title,
            message,
            targetRole
        });
        return { success: true, message: response.data.message };
    } catch (error) {
        return {
            success: false,
            message: error.response?.data?.message || 'Failed to send notification',
        };
    }
};

// ==================== CATEGORY MANAGEMENT ====================

export const getCategories = async () => {
    try {
        const response = await api.get('/categories');
        return { success: true, data: response.data };
    } catch (error) {
        return {
            success: false,
            message: error.response?.data?.message || 'Failed to fetch categories',
        };
    }
};

export const createCategory = async (data) => {
    try {
        const response = await api.post('/categories', data);
        return { success: true, data: response.data };
    } catch (error) {
        return {
            success: false,
            message: error.response?.data?.message || 'Failed to create category',
        };
    }
};

export const updateCategory = async (id, data) => {
    try {
        const response = await api.put(`/categories/${id}`, data);
        return { success: true, message: 'Category updated successfully' };
    } catch (error) {
        return {
            success: false,
            message: error.response?.data?.message || 'Failed to update category',
        };
    }
};

export const deleteCategory = async (id) => {
    try {
        const response = await api.delete(`/categories/${id}`);
        return { success: true, message: 'Category deleted successfully' };
    } catch (error) {
        return {
            success: false,
            message: error.response?.data?.message || 'Failed to delete category',
        };
    }
};
// ==================== AUDIT LOGS ====================

export const getAuditLogs = async (page = 1, pageSize = 20, entity = null) => {
    try {
        const params = { page, pageSize };
        if (entity) params.entity = entity;

        const response = await api.get('/audit', { params });
        return { success: true, data: response.data };
    } catch (error) {
        return {
            success: false,
            message: error.response?.data?.message || 'Failed to fetch audit logs',
        };
    }
};
