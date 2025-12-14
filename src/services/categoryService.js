import api from './api';

// Get all categories
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
