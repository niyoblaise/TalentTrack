import React, { useState } from 'react';
import { broadcastNotification } from '../../services/adminService';
import {
    Send,
    Users,
    Briefcase,
    UserCheck,
    AlertCircle,
    CheckCircle
} from 'lucide-react';
import './BroadcastNotification.css';

const BroadcastNotification = () => {
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [targetRole, setTargetRole] = useState(''); // '', 'Employer', 'Employee'
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!title.trim() || !message.trim()) {
            setError('Please fill in both title and message');
            return;
        }

        setLoading(true);
        const result = await broadcastNotification(title, message, targetRole || null);

        if (result.success) {
            setSuccess(result.message);
            setTitle('');
            setMessage('');
            setTargetRole('');
        } else {
            setError(result.message);
        }

        setLoading(false);
    };

    const getTargetAudience = () => {
        if (!targetRole) return 'All Users';
        if (targetRole === 'Employer') return 'All Employers';
        if (targetRole === 'Employee') return 'All Job Seekers';
        return 'All Users';
    };

    return (
        <div className="broadcast-container">
            <div className="broadcast-header">
                <div>
                    <h1>Broadcast Notification</h1>
                    <p>Send notifications to users across the platform</p>
                </div>
            </div>

            <div className="broadcast-content">
                <div className="broadcast-form-section">
                    <form onSubmit={handleSubmit} className="broadcast-form">
                        {error && (
                            <div className="alert error">
                                <AlertCircle size={20} />
                                <span>{error}</span>
                            </div>
                        )}

                        {success && (
                            <div className="alert success">
                                <CheckCircle size={20} />
                                <span>{success}</span>
                            </div>
                        )}

                        <div className="form-group">
                            <label htmlFor="title">Notification Title</label>
                            <input
                                type="text"
                                id="title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Enter notification title..."
                                disabled={loading}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="message">Message</label>
                            <textarea
                                id="message"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Enter your message..."
                                rows="6"
                                disabled={loading}
                            />
                            <span className="char-count">{message.length} characters</span>
                        </div>

                        <div className="form-group">
                            <label>Target Audience</label>
                            <div className="role-selector">
                                <div
                                    className={`role-card ${targetRole === '' ? 'active' : ''}`}
                                    onClick={() => !loading && setTargetRole('')}
                                >
                                    <Users size={24} />
                                    <span>All Users</span>
                                    <p>Send to everyone</p>
                                </div>

                                <div
                                    className={`role-card ${targetRole === 'Employer' ? 'active' : ''}`}
                                    onClick={() => !loading && setTargetRole('Employer')}
                                >
                                    <Briefcase size={24} />
                                    <span>Employers</span>
                                    <p>Companies only</p>
                                </div>

                                <div
                                    className={`role-card ${targetRole === 'Employee' ? 'active' : ''}`}
                                    onClick={() => !loading && setTargetRole('Employee')}
                                >
                                    <UserCheck size={24} />
                                    <span>Job Seekers</span>
                                    <p>Candidates only</p>
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="btn-broadcast"
                            disabled={loading}
                        >
                            <Send size={20} />
                            {loading ? 'Sending...' : 'Send Broadcast'}
                        </button>
                    </form>
                </div>

                <div className="broadcast-preview-section">
                    <h2>Preview</h2>
                    <div className="preview-card">
                        <div className="preview-header">
                            <div className="preview-icon">
                                <AlertCircle size={20} />
                            </div>
                            <div className="preview-meta">
                                <span className="preview-badge">System Notification</span>
                                <span className="preview-time">Just now</span>
                            </div>
                        </div>
                        <div className="preview-content">
                            <h3>{title || 'Notification Title'}</h3>
                            <p>{message || 'Your message will appear here...'}</p>
                        </div>
                        <div className="preview-footer">
                            <span className="preview-audience">
                                To: {getTargetAudience()}
                            </span>
                        </div>
                    </div>

                    <div className="broadcast-info">
                        <h3>How it works</h3>
                        <ul>
                            <li>Notifications are delivered in real-time via SignalR</li>
                            <li>Users will see a notification bell indicator</li>
                            <li>Notifications are stored in the database</li>
                            <li>Only active users receive notifications</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BroadcastNotification;
