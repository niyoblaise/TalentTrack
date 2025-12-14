import api from './api';

// Get employer dashboard stats
export const getEmployerStats = async () => {
    try {
        const response = await api.get('/dashboard/employer');
        return { success: true, data: response.data };
    } catch (error) {
        return {
            success: false,
            message: error.response?.data?.message || 'Failed to fetch stats',
        };
    }
};

export const getEmployeeStats = async () => {
    try {
        const response = await api.get('/dashboard/employee');
        return { success: true, data: response.data };
    } catch (error) {
        return {
            success: false,
            message: error.response?.data?.message || 'Failed to fetch stats',
        };
    }
};
