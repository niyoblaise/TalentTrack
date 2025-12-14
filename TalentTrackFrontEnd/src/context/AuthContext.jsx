import { createContext, useState, useContext, useEffect } from 'react';
import { getCurrentUser, logout as logoutService } from '../services/authService';
import signalRService from '../services/signalRService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check if user is logged in on mount
        const currentUser = getCurrentUser();
        console.log('[AuthContext] getCurrentUser on mount:', currentUser);
        if (currentUser) {
            setUser(currentUser);
            // Connect to SignalR when user is authenticated
            signalRService.connect();
        }
        setLoading(false);
    }, []);

    const login = (userData) => {
        console.log('[AuthContext] login called with:', userData);
        // Store token and role in localStorage
        if (userData.token) {
            localStorage.setItem('token', userData.token);
        }
        if (userData.role) {
            localStorage.setItem('role', userData.role);
        }
        console.log('[AuthContext] Stored in localStorage - token:', !!userData.token, 'role:', userData.role);
        setUser(userData);

        // Connect to SignalR after login
        signalRService.connect();
    };

    const logout = () => {
        // Disconnect from SignalR before logout
        signalRService.disconnect();
        logoutService();
        setUser(null);
    };

    const value = {
        user,
        login,
        logout,
        isAuthenticated: !!user,
        loading,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
