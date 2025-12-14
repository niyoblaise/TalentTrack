import api from './api';

// Schedule an interview
export const scheduleInterview = async (interviewData) => {
    try {
        const response = await api.post('/interviews', interviewData);
        return { success: true, data: response.data };
    } catch (error) {
        return {
            success: false,
            message: error.response?.data?.message || 'Failed to schedule interview',
        };
    }
};

// Get my interviews
export const getMyInterviews = async () => {
    try {
        const response = await api.get('/interviews/my-interviews');
        return { success: true, data: response.data };
    } catch (error) {
        return {
            success: false,
            message: error.response?.data?.message || 'Failed to fetch interviews',
        };
    }
};

// Update interview details
export const updateInterview = async (id, interviewData) => {
    try {
        const response = await api.put(`/interviews/${id}`, interviewData);
        return { success: true, data: response.data };
    } catch (error) {
        return {
            success: false,
            message: error.response?.data?.message || 'Failed to update interview',
        };
    }
};

// Cancel interview
export const cancelInterview = async (id) => {
    try {
        await api.delete(`/interviews/${id}`);
        return { success: true };
    } catch (error) {
        return {
            success: false,
            message: error.response?.data?.message || 'Failed to cancel interview',
        };
    }
};
