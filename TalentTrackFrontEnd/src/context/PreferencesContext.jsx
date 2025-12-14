import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const PreferencesContext = createContext();

export const usePreferences = () => useContext(PreferencesContext);

export const PreferencesProvider = ({ children }) => {
    const { user } = useAuth();
    const [preferences, setPreferences] = useState({
        theme: 'light',
        language: 'en',
        emailNotifications: true,
        pushNotifications: true
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            fetchPreferences();
        }
    }, [user]);

    useEffect(() => {
        // Apply theme
        document.body.className = preferences.theme === 'dark' ? 'dark-theme' : 'light-theme';
        // Apply language (placeholder for i18n)
        document.documentElement.lang = preferences.language;
    }, [preferences.theme, preferences.language]);

    const fetchPreferences = async () => {
        try {
            const response = await api.get('/preferences');
            setPreferences(response.data);
        } catch (error) {
            console.error('Failed to fetch preferences', error);
        }
    };

    const updatePreferences = async (newPrefs) => {
        try {
            setLoading(true);
            const response = await api.put('/preferences', newPrefs);
            setPreferences(response.data);
        } catch (error) {
            console.error('Failed to update preferences', error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const toggleTheme = () => {
        const newTheme = preferences.theme === 'light' ? 'dark' : 'light';
        updatePreferences({ ...preferences, theme: newTheme });
    };

    return (
        <PreferencesContext.Provider value={{ preferences, updatePreferences, toggleTheme, loading }}>
            {children}
        </PreferencesContext.Provider>
    );
};
