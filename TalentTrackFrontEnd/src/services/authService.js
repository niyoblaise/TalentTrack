import api from './api';

// Register as Employer
export const registerEmployer = async (userData) => {
    try {
        const payload = { ...userData, role: 'Employer' };
        const response = await api.post('/auth/register/employer', payload);
        return { success: true, data: response.data };
    } catch (error) {
        return {
            success: false,
            message: error.response?.data?.message || 'Registration failed',
        };
    }
};

// Register as Employee
export const registerEmployee = async (userData) => {
    try {
        const payload = { ...userData, role: 'Employee' };
        const response = await api.post('/auth/register/employee', payload);
        return { success: true, data: response.data };
    } catch (error) {
        return {
            success: false,
            message: error.response?.data?.message || 'Registration failed',
        };
    }
};

// Register as Admin
export const registerAdmin = async (userData) => {
    try {
        const payload = { ...userData, role: 'Admin' };
        const response = await api.post('/auth/register/admin', payload);
        return { success: true, data: response.data };
    } catch (error) {
        return {
            success: false,
            message: error.response?.data?.message || 'Registration failed',
        };
    }
};

// Login
export const login = async (credentials) => {
    try {
        const response = await api.post('/auth/login', credentials);
        if (response.data.isSuccess) {
            if (response.data.requiresOtp) {
                return { success: true, data: response.data };
            }

            // Store token and user info
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('role', response.data.role);

            // Return standardized user object with permissions
            return { success: true, data: getCurrentUser() };
        }
        return { success: false, message: response.data.message };
    } catch (error) {
        return {
            success: false,
            message: error.response?.data?.message || 'Login failed',
        };
    }
};

// Send OTP
export const sendOtp = async (userId) => {
    try {
        const response = await api.post('/auth/send-otp', JSON.stringify(userId));
        return { success: true, message: response.data.message };
    } catch (error) {
        return {
            success: false,
            message: error.response?.data?.message || 'Failed to send OTP',
        };
    }
};

// Verify OTP
export const verifyOtp = async (data) => {
    try {
        const response = await api.post('/auth/verify-otp', data);
        if (response.data.isSuccess) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('role', response.data.role);
            return { success: true, data: getCurrentUser() };
        }
        return { success: true, data: response.data };
    } catch (error) {
        return {
            success: false,
            message: error.response?.data?.message || 'OTP verification failed',
        };
    }
};

// Google Login
export const googleLogin = async (idToken) => {
    try {
        const response = await api.post('/auth/google-login', { idToken });
        if (response.data.isSuccess) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('role', response.data.role);
            return { success: true, data: getCurrentUser() };
        }
        return { success: true, data: response.data };
    } catch (error) {
        return {
            success: false,
            message: error.response?.data?.message || 'Google login failed',
        };
    }
};

// Forgot Password
export const forgotPassword = async (email) => {
    try {
        const response = await api.post('/auth/forgot-password', { email });
        return { success: true, message: response.data.message };
    } catch (error) {
        return {
            success: false,
            message: error.response?.data?.message || 'Failed to send reset code',
        };
    }
};

// Reset Password
export const resetPassword = async (email, code, newPassword) => {
    try {
        const response = await api.post('/auth/reset-password', { email, code, newPassword });
        return { success: true, message: response.data.message };
    } catch (error) {
        return {
            success: false,
            message: error.response?.data?.message || 'Password reset failed',
        };
    }
};

// Helper to decode JWT
const parseJwt = (token) => {
    try {
        return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
        return null;
    }
};

// Get user profile from API
export const getUserProfile = async () => {
    try {
        const response = await api.get('/auth/profile');
        return { success: true, data: response.data };
    } catch (error) {
        return {
            success: false,
            message: error.response?.data?.message || 'Failed to fetch profile',
        };
    }
};

// Get current user from localStorage
export const getCurrentUser = () => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    if (token && role) {
        const decoded = parseJwt(token);
        // Extract permissions (handle single string or array)
        let permissions = [];
        if (decoded?.Permission) {
            permissions = Array.isArray(decoded.Permission)
                ? decoded.Permission
                : [decoded.Permission];
        }

        return {
            token,
            role,
            permissions,
            isAuthenticated: true,
            firstName: decoded?.FirstName,
            lastName: decoded?.LastName,
            email: decoded?.email || decoded?.unique_name || decoded?.sub,
            id: decoded?.nameid || decoded?.id || decoded?.sub
        };
    }
    return null;
};

// Logout
export const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
};
