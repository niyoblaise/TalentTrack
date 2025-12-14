import api from './api';

// Get applications for a specific job (Employer)
export const getJobApplications = async (jobId, search = '') => {
    try {
        const response = await api.get(`/applications/job/${jobId}?search=${encodeURIComponent(search)}`);
        return { success: true, data: response.data };
    } catch (error) {
        return {
            success: false,
            message: error.response?.data?.message || 'Failed to fetch applications',
        };
    }
};

// Get all applications for employer (across all jobs)
export const getAllApplications = async (search = '') => {
    try {
        const response = await api.get(`/applications/employer/all?search=${encodeURIComponent(search)}`);
        return { success: true, data: response.data };
    } catch (error) {
        return {
            success: false,
            message: error.response?.data?.message || 'Failed to fetch applications',
        };
    }
};

// Get a single application details (includes decrypted CV)
export const getApplication = async (id) => {
    try {
        const response = await api.get(`/applications/${id}`);
        return { success: true, data: response.data };
    } catch (error) {
        return {
            success: false,
            message: error.response?.data?.message || 'Failed to fetch application details',
        };
    }
};

// Update application status (Employer - Hire/Reject)
export const updateApplicationStatus = async (id, status, rejectionReason = null) => {
    try {
        const payload = { status, rejectionReason };
        const response = await api.put(`/applications/${id}/status`, payload);
        return { success: true, message: response.data.message };
    } catch (error) {
        return {
            success: false,
            message: error.response?.data?.message || 'Failed to update status',
        };
    }
};

// Apply to a job (Employee)
export const applyToJob = async (formData) => {
    try {
        const response = await api.post('/applications/apply', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return { success: true, data: response.data };
    } catch (error) {
        console.error('Apply to job error:', error.response?.data);
        return {
            success: false,
            message: error.response?.data?.message || 'Failed to submit application',
        };
    }
};

// Get my applications (Employee)
export const getMyApplications = async (search = '') => {
    try {
        const response = await api.get(`/applications/my-applications?search=${encodeURIComponent(search)}`);
        return { success: true, data: response.data };
    } catch (error) {
        return {
            success: false,
            message: error.response?.data?.message || 'Failed to fetch applications',
        };
    }
};

// Get application history/timeline (Employee)
export const getApplicationHistory = async (applicationId) => {
    try {
        const response = await api.get(`/applications/${applicationId}/history`);
        return { success: true, data: response.data };
    } catch (error) {
        return {
            success: false,
            message: error.response?.data?.message || 'Failed to fetch history',
        };
    }
};

// Withdraw application (Employee)
export const withdrawApplication = async (applicationId) => {
    try {
        const response = await api.put(`/applications/${applicationId}/withdraw`);
        return { success: true, message: response.data.message };
    } catch (error) {
        return {
            success: false,
            message: error.response?.data?.message || 'Failed to withdraw application',
        };
    }
};
