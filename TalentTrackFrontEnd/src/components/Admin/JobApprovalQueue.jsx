import React, { useState, useEffect } from 'react';
import { getAllJobs, approveJob, rejectJob, getAdminStats } from '../../services/adminService';
import {
    CheckCircle,
    XCircle,
    Clock,
    MapPin,
    Briefcase,
    Calendar,
    User
} from 'lucide-react';
import './JobApprovalQueue.css';

const JobApprovalQueue = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('pending'); // 'all', 'pending', 'approved', 'rejected'
    const [selectedJob, setSelectedJob] = useState(null);
    const [rejectionReason, setRejectionReason] = useState('');
    const [actionLoading, setActionLoading] = useState(false);
    const [stats, setStats] = useState({
        pendingJobs: 0,
        approvedJobs: 0,
        rejectedJobs: 0,
        totalJobs: 0
    });

    useEffect(() => {
        fetchJobs();
        fetchStats();
    }, [filter]);

    const fetchStats = async () => {
        const result = await getAdminStats();
        if (result.success) {
            setStats({
                pendingJobs: result.data.pendingJobs,
                approvedJobs: result.data.approvedJobs,
                rejectedJobs: result.data.rejectedJobs,
                totalJobs: result.data.totalJobs
            });
        }
    };

    const fetchJobs = async () => {
        setLoading(true);
        const result = await getAllJobs(filter);
        if (result.success) {
            setJobs(result.data);
        }
        setLoading(false);
    };

    const handleApprove = async (jobId) => {
        setActionLoading(true);
        const result = await approveJob(jobId);
        if (result.success) {
            fetchJobs();
            fetchStats();
            setSelectedJob(null);
        } else {
            alert(result.message);
        }
        setActionLoading(false);
    };

    const handleReject = async (jobId) => {
        if (!rejectionReason.trim()) {
            alert('Please provide a rejection reason');
            return;
        }

        setActionLoading(true);
        const result = await rejectJob(jobId, rejectionReason);
        if (result.success) {
            fetchJobs();
            fetchStats();
            setSelectedJob(null);
            setRejectionReason('');
        } else {
            alert(result.message);
        }
        setActionLoading(false);
    };

    if (loading) {
        return <div className="loading-container">Loading jobs...</div>;
    }

    return (
        <div className="job-approval-container">
            <div className="approval-header">
                <div>
                    <h1>Job Approval Queue</h1>
                    <p>Review and approve job postings</p>
                </div>
                <div className="approval-stats">
                    <span className="stat pending">{stats.pendingJobs} Pending</span>
                    <span className="stat approved">{stats.approvedJobs} Approved</span>
                    <span className="stat rejected">{stats.rejectedJobs} Rejected</span>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="filter-tabs">
                <button
                    className={filter === 'pending' ? 'active' : ''}
                    onClick={() => setFilter('pending')}
                >
                    <Clock size={18} />
                    Pending ({stats.pendingJobs})
                </button>
                <button
                    className={filter === 'approved' ? 'active' : ''}
                    onClick={() => setFilter('approved')}
                >
                    <CheckCircle size={18} />
                    Approved ({stats.approvedJobs})
                </button>
                <button
                    className={filter === 'rejected' ? 'active' : ''}
                    onClick={() => setFilter('rejected')}
                >
                    <XCircle size={18} />
                    Rejected ({stats.rejectedJobs})
                </button>
                <button
                    className={filter === 'all' ? 'active' : ''}
                    onClick={() => setFilter('all')}
                >
                    All Jobs ({stats.totalJobs})
                </button>
            </div>

            {/* Jobs List */}
            <div className="jobs-list">
                {jobs.length === 0 ? (
                    <div className="empty-state">
                        <Briefcase size={48} />
                        <h3>No jobs found</h3>
                        <p>There are no jobs matching your filter</p>
                    </div>
                ) : (
                    jobs.map(job => (
                        <div key={job.id} className={`job-card ${job.status?.toLowerCase() || (job.isApproved ? 'approved' : 'pending')}`}>
                            <div className="job-header">
                                <div>
                                    <h3>{job.title}</h3>
                                    <p className="employer">
                                        <User size={16} />
                                        {job.employerName}
                                    </p>
                                </div>
                                <span className={`status-badge ${job.status?.toLowerCase() || (job.isApproved ? 'approved' : 'pending')}`}>
                                    {job.status === 'Rejected' ? (
                                        <><XCircle size={16} /> Rejected</>
                                    ) : job.isApproved ? (
                                        <><CheckCircle size={16} /> Approved</>
                                    ) : (
                                        <><Clock size={16} /> Pending</>
                                    )}
                                </span>
                            </div>
                            <p className="job-description">{job.description.substring(0, 200)}...</p>

                            <div className="job-meta">
                                <span className="meta-item">
                                    <Briefcase size={16} />
                                    {job.type}
                                </span>
                                <span className="meta-item">
                                    <MapPin size={16} />
                                    {job.location}
                                </span>
                                <span className="meta-item">
                                    <span className="currency-label-sm">RWF</span>
                                    {job.salaryRange}
                                </span>
                                <span className="meta-item">
                                    <Calendar size={16} />
                                    Posted: {new Date(job.postedDate).toLocaleDateString()}
                                </span>
                            </div>

                            <div className="job-actions">
                                {job.status === 'Rejected' ? (
                                    <button
                                        className="btn-approve"
                                        onClick={() => handleApprove(job.id)}
                                        disabled={actionLoading}
                                    >
                                        <CheckCircle size={18} />
                                        Approve (Reverse)
                                    </button>
                                ) : !job.isApproved && (
                                    <>
                                        <button
                                            className="btn-approve"
                                            onClick={() => handleApprove(job.id)}
                                            disabled={actionLoading}
                                        >
                                            <CheckCircle size={18} />
                                            Approve
                                        </button>
                                        <button
                                            className="btn-reject"
                                            onClick={() => setSelectedJob(job)}
                                            disabled={actionLoading}
                                        >
                                            <XCircle size={18} />
                                            Reject
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Rejection Modal */}
            {selectedJob && (
                <div className="modal-overlay" onClick={() => setSelectedJob(null)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h2>Reject Job: {selectedJob.title}</h2>
                        <p>Please provide a reason for rejection:</p>
                        <textarea
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            placeholder="Enter rejection reason..."
                            rows="4"
                        />
                        <div className="modal-actions">
                            <button
                                className="btn-cancel"
                                onClick={() => {
                                    setSelectedJob(null);
                                    setRejectionReason('');
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                className="btn-confirm-reject"
                                onClick={() => handleReject(selectedJob.id)}
                                disabled={actionLoading}
                            >
                                Confirm Rejection
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default JobApprovalQueue;
