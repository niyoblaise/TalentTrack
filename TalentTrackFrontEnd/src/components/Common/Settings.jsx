import React, { useState, useEffect } from 'react';
import { usePreferences } from '../../context/PreferencesContext';
import './Settings.css';

const Settings = () => {
    const { preferences, updatePreferences, loading } = usePreferences();
    const [formData, setFormData] = useState(preferences);

    useEffect(() => {
        setFormData(preferences);
    }, [preferences]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        await updatePreferences(formData);
        alert('Settings saved successfully!');
    };

    return (
        <div className="settings-container">
            <h2>User Settings</h2>
            <form onSubmit={handleSubmit} className="settings-form">
                <div className="form-group">
                    <label>Theme</label>
                    <select name="theme" value={formData.theme} onChange={handleChange}>
                        <option value="light">Light</option>
                        <option value="dark">Dark</option>
                    </select>
                </div>

                <div className="form-group">
                    <label>Language</label>
                    <select name="language" value={formData.language} onChange={handleChange}>
                        <option value="en">English</option>
                        <option value="fr">French</option>
                        <option value="es">Spanish</option>
                    </select>
                </div>

                <div className="form-group checkbox-group">
                    <label>
                        <input
                            type="checkbox"
                            name="emailNotifications"
                            checked={formData.emailNotifications}
                            onChange={handleChange}
                        />
                        Enable Email Notifications
                    </label>
                </div>

                <div className="form-group checkbox-group">
                    <label>
                        <input
                            type="checkbox"
                            name="pushNotifications"
                            checked={formData.pushNotifications}
                            onChange={handleChange}
                        />
                        Enable Push Notifications
                    </label>
                </div>

                <button type="submit" disabled={loading} className="save-btn">
                    {loading ? 'Saving...' : 'Save Changes'}
                </button>
            </form>
        </div>
    );
};

export default Settings;
