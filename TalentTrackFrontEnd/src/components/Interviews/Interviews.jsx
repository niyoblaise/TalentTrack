import React, { useState, useEffect } from 'react';
import { getMyInterviews, updateInterview, cancelInterview } from '../../services/interviewService';
import { useAuth } from '../../context/AuthContext';
import { Calendar, MapPin, Video, Clock, User, Briefcase, Edit, Trash2 } from 'lucide-react';
import './Interviews.css';

const Interviews = () => {
    const { user } = useAuth();
    const [interviews, setInterviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedInterview, setSelectedInterview] = useState(null);
    const [editForm, setEditForm] = useState({
        scheduledDate: '',
        meetingLink: '',
        location: ''
    });

    useEffect(() => {
        fetchInterviews();
    }, []);

    const fetchInterviews = async () => {
        try {
            const response = await getMyInterviews();
            if (response.success) {
                setInterviews(response.data);
            } else {
                setError(response.message);
            }
        } catch (err) {
            setError('Failed to load interviews');
        } finally {
            setLoading(false);
        }
    };

    const handleEditClick = (interview) => {
        setSelectedInterview(interview);
        setEditForm({
            scheduledDate: interview.scheduledDate,
            meetingLink: interview.meetingLink || '',
            location: interview.location || ''
        });
        setShowEditModal(true);
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            const response = await updateInterview(selectedInterview.id, editForm);
            if (response.success) {
                setShowEditModal(false);
                fetchInterviews();
            } else {
                alert(response.message);
            }
        } catch (err) {
            alert('Failed to update interview');
        }
    };

    const handleCancel = async (id) => {
        if (window.confirm('Are you sure you want to cancel this interview?')) {
            try {
                const response = await cancelInterview(id);
                if (response.success) {
                    fetchInterviews();
                } else {
                    alert(response.message);
                }
            } catch (err) {
                alert('Failed to cancel interview');
            }
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const upcomingInterviews = interviews.filter(i => new Date(i.scheduledDate) > new Date());
    const pastInterviews = interviews.filter(i => new Date(i.scheduledDate) <= new Date());

    if (loading) return <div className="loading">Loading interviews...</div>;

    return (
        <div className="interviews-container">
            <div className="interviews-header">
                <h1>Scheduled Interviews</h1>
                <p>Manage your upcoming interviews with candidates</p>
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="interviews-section">
                <h2>Upcoming Interviews ({upcomingInterviews.length})</h2>
                {upcomingInterviews.length === 0 ? (
                    <div className="empty-state">
                        <Calendar className="icon" />
                        <p>No upcoming interviews scheduled</p>
                    </div>
                ) : (
                    <div className="interviews-grid">
                        {upcomingInterviews.map(interview => (
                            <div key={interview.id} className="interview-card upcoming">
                                <div className="card-header">
                                    <div className="candidate-info">
                                        <User className="icon" />
                                        <h3>{interview.candidateName}</h3>
                                    </div>
                                    <span className="status-badge upcoming">Upcoming</span>
                                </div>

                                <div className="card-body">
                                    <div className="info-row">
                                        <Briefcase className="icon" />
                                        <span>{interview.jobTitle}</span>
                                    </div>
                                    <div className="info-row">
                                        <Clock className="icon" />
                                        <span>{formatDate(interview.scheduledDate)}</span>
                                    </div>
                                    {interview.meetingLink && (
                                        <div className="info-row">
                                            <Video className="icon" />
                                            <a href={interview.meetingLink} target="_blank" rel="noopener noreferrer">
                                                Join Meeting
                                            </a>
                                        </div>
                                    )}
                                    {interview.location && (
                                        <div className="info-row">
                                            <MapPin className="icon" />
                                            <span>{interview.location}</span>
                                        </div>
                                    )}
                                </div>

                                {user?.role === 'Employer' && (
                                    <div className="card-actions">
                                        <button
                                            className="btn-edit"
                                            onClick={() => handleEditClick(interview)}
                                        >
                                            <Edit /> Edit
                                        </button>
                                        <button
                                            className="btn-cancel"
                                            onClick={() => handleCancel(interview.id)}
                                        >
                                            <Trash2 /> Cancel
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="interviews-section">
                <h2>Past Interviews ({pastInterviews.length})</h2>
                {pastInterviews.length > 0 && (
                    <div className="interviews-grid">
                        {pastInterviews.map(interview => (
                            <div key={interview.id} className="interview-card past">
                                <div className="card-header">
                                    <div className="candidate-info">
                                        <User className="icon" />
                                        <h3>{interview.candidateName}</h3>
                                    </div>
                                    <span className="status-badge completed">Completed</span>
                                </div>
                                <div className="card-body">
                                    <div className="info-row">
                                        <Briefcase className="icon" />
                                        <span>{interview.jobTitle}</span>
                                    </div>
                                    <div className="info-row">
                                        <Clock className="icon" />
                                        <span>{formatDate(interview.scheduledDate)}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {showEditModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>Edit Interview</h2>
                        <form onSubmit={handleUpdate}>
                            <div className="form-group">
                                <label>Date & Time</label>
                                <input
                                    type="datetime-local"
                                    value={editForm.scheduledDate}
                                    onChange={(e) => setEditForm({ ...editForm, scheduledDate: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Meeting Link</label>
                                <input
                                    type="url"
                                    value={editForm.meetingLink}
                                    onChange={(e) => setEditForm({ ...editForm, meetingLink: e.target.value })}
                                    placeholder="https://..."
                                />
                            </div>
                            <div className="form-group">
                                <label>Location</label>
                                <input
                                    type="text"
                                    value={editForm.location}
                                    onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                                    placeholder="Office address or Remote"
                                />
                            </div>
                            <div className="modal-actions">
                                <button type="button" onClick={() => setShowEditModal(false)} className="btn-secondary">
                                    Cancel
                                </button>
                                <button type="submit" className="btn-primary">
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Interviews;
