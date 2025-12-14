import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getEmployerJobs } from '../../services/jobService';
import { getAllApplications } from '../../services/applicationService';
import { FileText, Search, Filter, Eye } from 'lucide-react';
import './AllApplications.css';

const AllApplications = () => {
    const navigate = useNavigate();
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    const [debouncedSearch, setDebouncedSearch] = useState('');

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    useEffect(() => {
        fetchAllApplications();
    }, [debouncedSearch]);

    const fetchAllApplications = async () => {
        setLoading(true);
        try {
            const result = await getAllApplications(debouncedSearch);
            if (result.success) {
                setApplications(result.data);
            }
        } catch (error) {
            console.error("Error fetching applications:", error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusClass = (status) => {
        if (!status) return '';
        return `status-badge ${status.toLowerCase()}`;
    };

    const getScoreClass = (score) => {
        if (!score) return 'score-low';
        if (score >= 70) return 'score-high';
        if (score >= 40) return 'score-medium';
        return 'score-low';
    };

    const filteredApps = applications.filter(app => {
        return filter === 'all' || app.currentStatus.toLowerCase() === filter;
    });

    if (loading) return <div className="loading-container">Loading applications...</div>;

    return (
        <div className="all-applications-container">
            <div className="page-header">
                <div>
                    <h1>All Applications</h1>
                    <p className="subtitle">Manage candidates across all your job postings</p>
                </div>
            </div>

            <div className="filters-bar">
                <div className="search-box">
                    <Search size={20} />
                    <input
                        type="text"
                        placeholder="Search by candidate or job..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="filter-group">
                    <Filter size={20} />
                    <select value={filter} onChange={(e) => setFilter(e.target.value)}>
                        <option value="all">All Statuses</option>
                        <option value="pending">Pending</option>
                        <option value="screening">Screening</option>
                        <option value="interview">Interview</option>
                        <option value="hired">Hired</option>
                        <option value="rejected">Rejected</option>
                    </select>
                </div>
            </div>

            <div className="applications-table-container">
                <table className="applications-table">
                    <thead>
                        <tr>
                            <th>Candidate</th>
                            <th>Job Title</th>
                            <th>Applied Date</th>
                            <th>Match Score</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredApps.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="empty-state-cell">
                                    <div className="empty-state">
                                        <FileText size={48} />
                                        <p>No applications found matching your criteria</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            filteredApps.map(app => (
                                <tr key={app.id}>
                                    <td>
                                        <div className="candidate-info">
                                            <span className="candidate-name">{app.employeeName}</span>
                                            <span className="candidate-email">{app.employeeEmail}</span>
                                        </div>
                                    </td>
                                    <td>{app.jobTitle}</td>
                                    <td>{new Date(app.appliedDate).toLocaleDateString()}</td>
                                    <td>
                                        {app.matchScore !== undefined && (
                                            <span className={`match-score ${getScoreClass(app.matchScore)}`}>
                                                {app.matchScore}%
                                            </span>
                                        )}
                                    </td>
                                    <td>
                                        <span className={getStatusClass(app.currentStatus)}>
                                            {app.currentStatus}
                                        </span>
                                    </td>
                                    <td>
                                        <button
                                            className="btn-view"
                                            onClick={() => navigate(`/employer/applications/${app.id}`)}
                                        >
                                            <Eye size={18} />
                                            View
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AllApplications;
