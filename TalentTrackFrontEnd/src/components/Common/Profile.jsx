import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getUserProfile } from '../../services/authService';
import { User, Mail, Shield, Save } from 'lucide-react';
import './Profile.css';

const Profile = () => {
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        role: ''
    });
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            setLoading(true);
            const response = await getUserProfile();
            if (response.success) {
                const userData = response.data;
                setFormData({
                    firstName: userData.firstName || '',
                    lastName: userData.lastName || '',
                    email: userData.email || '',
                    role: userData.role || ''
                });
            }
            setLoading(false);
        };

        fetchProfile();
    }, []);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        // Simulate API call for now
        setTimeout(() => {
            setLoading(false);
            setIsEditing(false);
            alert('Profile updated successfully!');
        }, 1000);
    };

    return (
        <div className="profile-container">
            <div className="profile-header">
                <div className="profile-avatar">
                    <User size={48} />
                </div>
                <h1>My Profile</h1>
                <p className="profile-subtitle">Manage your account settings</p>
            </div>

            <div className="profile-card">
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Role</label>
                        <div className="input-with-icon">
                            <Shield size={20} />
                            <input
                                type="text"
                                value={formData.role}
                                disabled
                                className="input-disabled"
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Email Address</label>
                        <div className="input-with-icon">
                            <Mail size={20} />
                            <input
                                type="email"
                                value={formData.email}
                                disabled
                                className="input-disabled"
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>First Name</label>
                            <input
                                type="text"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleChange}
                                disabled={!isEditing}
                                className={!isEditing ? 'input-disabled' : ''}
                            />
                        </div>
                        <div className="form-group">
                            <label>Last Name</label>
                            <input
                                type="text"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleChange}
                                disabled={!isEditing}
                                className={!isEditing ? 'input-disabled' : ''}
                            />
                        </div>
                    </div>

                    <div className="form-actions">
                        {isEditing ? (
                            <>
                                <button
                                    type="button"
                                    className="btn-cancel"
                                    onClick={() => setIsEditing(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn-save"
                                    disabled={loading}
                                >
                                    <Save size={18} />
                                    {loading ? 'Saving...' : 'Save Changes'}
                                </button>
                            </>
                        ) : (
                            <button
                                type="button"
                                className="btn-edit"
                                onClick={() => setIsEditing(true)}
                            >
                                Edit Profile
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Profile;
