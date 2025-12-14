import api from './api';

// Get all jobs (public/employee view)
export const getAllJobs = async (filters = {}) => {
    try {
        const queryParams = new URLSearchParams();
        if (filters.search) queryParams.append('search', filters.search);
        if (filters.category) queryParams.append('categoryId', filters.category);
        if (filters.type) queryParams.append('type', filters.type);

        const response = await api.get(`/jobs?${queryParams.toString()}`);
        return { success: true, data: response.data };
    } catch (error) {
        return {
            success: false,
            message: error.response?.data?.message || 'Failed to fetch jobs',
        };
    }
};

// Get employer's jobs
export const getEmployerJobs = async () => {
    try {
        console.log('[jobService] Calling GET /jobs/employer');
        const response = await api.get('/jobs/employer');
        console.log('[jobService] Response:', response);
        return { success: true, data: response.data };
    } catch (error) {
        console.error('[jobService] Error details:', {
            message: error.message,
            response: error.response,
            status: error.response?.status,
            data: error.response?.data
        });
        return {
            success: false,
            message: error.response?.data?.message || error.message || 'Failed to fetch jobs',
        };
    }
};

// Get single job
export const getJob = async (id) => {
    try {
        const response = await api.get(`/jobs/${id}`);
        return { success: true, data: response.data };
    } catch (error) {
        return {
            success: false,
            message: error.response?.data?.message || 'Failed to fetch job',
        };
    }
};

// Create job
export const createJob = async (jobData) => {
    try {
        const response = await api.post('/jobs', jobData);
        return { success: true, data: response.data };
    } catch (error) {
        return {
            success: false,
            message: error.response?.data?.message || 'Failed to create job',
        };
    }
};

// Update job
export const updateJob = async (id, jobData) => {
    try {
        const response = await api.put(`/jobs/${id}`, jobData);
        return { success: true, data: response.data };
    } catch (error) {
        return {
            success: false,
            message: error.response?.data?.message || 'Failed to update job',
        };
    }
};

// Delete job
export const deleteJob = async (id) => {
    try {
        await api.delete(`/jobs/${id}`);
        return { success: true };
    } catch (error) {
        return {
            success: false,
            message: error.response?.data?.message || 'Failed to delete job',
        };
    }
};
