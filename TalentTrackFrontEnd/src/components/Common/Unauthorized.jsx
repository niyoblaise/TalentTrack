import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Unauthorized.css';

const Unauthorized = () => {
    const navigate = useNavigate();
    const { logout } = useAuth();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleGoBack = () => {
        navigate(-1);
    };

    return (
        <div className="unauthorized-container">
            <div className="unauthorized-card">
                <div className="icon-container">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                </div>
                <h1>Access Denied</h1>
                <p>You do not have permission to access this page.</p>
                <div className="actions">
                    <button onClick={handleGoBack} className="btn-secondary">
                        Go Back
                    </button>
                    <button onClick={handleLogout} className="btn-primary">
                        Logout
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Unauthorized;
