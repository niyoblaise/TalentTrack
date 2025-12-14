import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyApplications, withdrawApplication } from '../../services/applicationService';
import { FileText, Calendar, Briefcase, Clock, CheckCircle, XCircle, AlertCircle, TrendingUp, Trash2 } from 'lucide-react';
import ApplicationTracker from './ApplicationTracker';
import './MyApplications.css';

const MyApplications = () => {
    const navigate = useNavigate();
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [selectedAppId, setSelectedAppId] = useState(null);
    const [showTracker, setShowTracker] = useState(false);
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
        }, 500);
        return () => clearTimeout(timer);
    }, [search]);

    useEffect(() => {
        fetchApplications();
    }, [debouncedSearch]);

    const fetchApplications = async () => {
        setLoading(true);
        const result = await getMyApplications(debouncedSearch);
        if (result.success) {
            setApplications(result.data);
        }
        setLoading(false);
    };

    const handleViewTimeline = (e, appId) => {
        e.stopPropagation();
        setSelectedAppId(appId);
        setShowTracker(true);
    };

    const handleWithdraw = async (e, appId) => {
        e.stopPropagation();
        if (window.confirm('Are you sure you want to withdraw this application?')) {
            const result = await withdrawApplication(appId);
            if (result.success) {
                setApplications(applications.filter(app => app.id !== appId));
            } else {
                alert(result.message);
            }
        }
    };

    const getStatusIcon = (status) => {
        switch (status.toLowerCase()) {
            case 'pending':
                return <Clock size={18} className="status-icon pending" />;
            case 'screening':
                return <AlertCircle size={18} className="status-icon screening" />;
            case 'interview':
                return <Calendar size={18} className="status-icon interview" />;
            case 'hired':
                return <CheckCircle size={18} className="status-icon hired" />;
            case 'rejected':
                return <XCircle size={18} className="status-icon rejected" />;
            default:
                return <FileText size={18} />;
        }
    };

    const getStatusClass = (status) => {
        return `status-badge ${status.toLowerCase()}`;
    };

    const filteredApplications = filter === 'all'
        ? applications
        : applications.filter(app => app.currentStatus.toLowerCase() === filter);

    const stats = {
        total: applications.length,
        pending: applications.filter(a => a.currentStatus.toLowerCase() === 'pending').length,
        screening: applications.filter(a => a.currentStatus.toLowerCase() === 'screening').length,
        interview: applications.filter(a => a.currentStatus.toLowerCase() === 'interview').length,
        hired: applications.filter(a => a.currentStatus.toLowerCase() === 'hired').length,
        rejected: applications.filter(a => a.currentStatus.toLowerCase() === 'rejected').length,
    };

    if (loading) {
        return <div className="loading-container">Loading your applications...</div>;
    }

    return (
        <div className="my-applications-container">
            <div className="applications-header">
                <div>
                    <h1>My Applications</h1>
                    <p className="subtitle">{stats.total} total applications</p>
                </div>
                <div className="search-wrapper">
                    <input
                        type="text"
                        placeholder="Search by job or company..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="search-input"
                    />
                </div>
            </div>

            {/* Stats Cards */}
            <div className="stats-grid">
                <div className="stat-card" onClick={() => setFilter('all')}>
                    <FileText size={24} />
                    <div>
                        <span className="stat-value">{stats.total}</span>
                        <span className="stat-label">Total</span>
                    </div>
                </div>
                <div className="stat-card" onClick={() => setFilter('pending')}>
                    <Clock size={24} />
                    <div>
                        <span className="stat-value">{stats.pending}</span>
                        <span className="stat-label">Pending</span>
                    </div>
                </div>
                <div className="stat-card" onClick={() => setFilter('screening')}>
                    <AlertCircle size={24} />
                    <div>
                        <span className="stat-value">{stats.screening}</span>
                        <span className="stat-label">Screening</span>
                    </div>
                </div>
                <div className="stat-card" onClick={() => setFilter('interview')}>
                    <Calendar size={24} />
                    <div>
                        <span className="stat-value">{stats.interview}</span>
                        <span className="stat-label">Interview</span>
                    </div>
                </div>
                <div className="stat-card success" onClick={() => setFilter('hired')}>
                    <CheckCircle size={24} />
                    <div>
                        <span className="stat-value">{stats.hired}</span>
                        <span className="stat-label">Hired</span>
                    </div>
                </div>
                <div className="stat-card danger" onClick={() => setFilter('rejected')}>
                    <XCircle size={24} />
                    <div>
                        <span className="stat-value">{stats.rejected}</span>
                        <span className="stat-label">Rejected</span>
                    </div>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="filter-tabs">
                <button
                    className={filter === 'all' ? 'active' : ''}
                    onClick={() => setFilter('all')}
                >
                    All Applications
                </button>
                <button
                    className={filter === 'pending' ? 'active' : ''}
                    onClick={() => setFilter('pending')}
                >
                    Pending
                </button>
                <button
                    className={filter === 'screening' ? 'active' : ''}
                    onClick={() => setFilter('screening')}
                >
                    Screening
                </button>
                <button
                    className={filter === 'interview' ? 'active' : ''}
                    onClick={() => setFilter('interview')}
                >
                    Interview
                </button>
                <button
                    className={filter === 'hired' ? 'active' : ''}
                    onClick={() => setFilter('hired')}
                >
                    Hired
                </button>
                <button
                    className={filter === 'rejected' ? 'active' : ''}
                    onClick={() => setFilter('rejected')}
                >
                    Rejected
                </button>
            </div>

            {/* Applications List */}
            <div className="applications-list">
                {filteredApplications.length === 0 ? (
                    <div className="empty-state">
                        <Briefcase size={48} />
                        <h3>No applications found</h3>
                        <p>
                            {filter === 'all'
                                ? "You haven't applied to any jobs yet"
                                : `No ${filter} applications`}
                        </p>
                        {filter === 'all' && (
                            <button
                                className="browse-jobs-btn"
                                onClick={() => navigate('/employee/jobs')}
                            >
                                Browse Jobs
                            </button>
                        )}
                    </div>
                ) : (
                    filteredApplications.map(app => (
                        <div
                            key={app.id}
                            className="application-card"
                            onClick={() => navigate(`/employee/applications/${app.id}`)}
                        >
                            <div className="application-header">
                                <div>
                                    <h3>{app.jobTitle}</h3>
                                    <p className="company">{app.employerName}</p>
                                </div>
                                <span className={getStatusClass(app.currentStatus)}>
                                    {getStatusIcon(app.currentStatus)}
                                    {app.currentStatus}
                                </span>
                            </div>

                            <div className="application-meta">
                                <span className="meta-item">
                                    <Calendar size={16} />
                                    Applied: {new Date(app.appliedDate).toLocaleDateString()}
                                </span>
                                {app.interviewDate && (
                                    <span className="meta-item interview-date">
                                        <Calendar size={16} />
                                        Interview: {new Date(app.interviewDate).toLocaleDateString()}
                                    </span>
                                )}
                            </div>

                            {app.rejectionReason && (
                                <div className="rejection-reason">
                                    <strong>Reason:</strong> {app.rejectionReason}
                                </div>
                            )}

                            <div className="application-actions">
                                <button
                                    className="btn-timeline"
                                    onClick={(e) => handleViewTimeline(e, app.id)}
                                >
                                    <TrendingUp size={16} />
                                    View Timeline
                                </button>
                                {app.currentStatus.toLowerCase() !== 'hired' && (
                                    <button
                                        className="btn-withdraw"
                                        onClick={(e) => handleWithdraw(e, app.id)}
                                    >
                                        <Trash2 size={16} />
                                        Withdraw
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {showTracker && selectedAppId && (
                <ApplicationTracker
                    applicationId={selectedAppId}
                    onClose={() => {
                        setShowTracker(false);
                        setSelectedAppId(null);
                    }}
                />
            )}
        </div>
    );
};

export default MyApplications;
