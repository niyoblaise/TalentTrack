import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getEmployerJobs, deleteJob, getJob } from '../../services/jobService';
import { MapPin, DollarSign, Eye, Users, Edit, Trash2, Plus, X, Calendar, Briefcase, XCircle } from 'lucide-react';
import './Jobs.css';

const JobList = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedJob, setSelectedJob] = useState(null);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        console.log('[JobList] Fetching employer jobs...');
        const result = await getEmployerJobs();
        console.log('[JobList] getEmployerJobs result:', result);
        if (result.success) {
            console.log('[JobList] Jobs data:', result.data);
            setJobs(result.data);
        } else {
            console.error('[JobList] Failed to fetch jobs:', result.message);
        }
        setLoading(false);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this job?')) {
            const result = await deleteJob(id);
            if (result.success) {
                setJobs(jobs.filter(job => job.id !== id));
            } else {
                alert(result.message);
            }
        }
    };

    const handleViewDetails = async (jobId) => {
        const result = await getJob(jobId);
        if (result.success) {
            setSelectedJob(result.data);
            setShowModal(true);
        }
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedJob(null);
    };

    if (loading) return <div className="loading-container">Loading jobs...</div>;

    return (
        <>
            <div className="job-list-container">
                <div className="job-list-header">
                    <div>
                        <h1>My Jobs</h1>
                        <p className="subtitle">Manage your job postings and view applicants</p>
                    </div>
                    <Link to="/employer/jobs/create" className="btn-primary">
                        <Plus size={18} /> Post New Job
                    </Link>
                </div>

                <div className="jobs-grid">
                    {jobs.length === 0 ? (
                        <div className="empty-state">
                            <Briefcase size={48} />
                            <h3>No jobs posted yet</h3>
                            <p>Create your first job posting to start receiving applications</p>
                        </div>
                    ) : (
                        jobs.map(job => (
                            <div key={job.id} className="job-card">
                                <div className="job-card-header">
                                    <div>
                                        <h3>{job.title}</h3>
                                        <span className="category-badge">{job.categoryName}</span>
                                    </div>
                                    <span className={`status-badge ${job.status?.toLowerCase() || 'open'}`}>
                                        {job.status || 'Open'}
                                    </span>
                                </div>
                                <div className="job-meta">
                                    <span className="meta-item"><MapPin size={16} /> <strong>{job.location}</strong></span>
                                    <span className="meta-item"><span className="currency-label">RWF</span> <strong>{job.salaryRange}</strong></span>
                                    <span className="meta-item"><Eye size={16} /> <strong>{job.views}</strong> Views</span>
                                    <span className="meta-item"><Users size={16} /> <strong>{job.applicantCount}</strong> Applicants</span>
                                </div>
                                <div className="job-actions">
                                    <button onClick={() => handleViewDetails(job.id)} className="btn-outline">
                                        View Details
                                    </button>
                                    {job.status !== 'Rejected' && (
                                        <Link to={`/employer/jobs/${job.id}/applicants`} className="btn-outline">
                                            View Applicants
                                        </Link>
                                    )}
                                    <Link to={`/employer/jobs/edit/${job.id}`} className="btn-icon">
                                        <Edit size={16} />
                                    </Link>
                                    <button onClick={() => handleDelete(job.id)} className="btn-icon btn-danger">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Job Details Modal */}
            {showModal && selectedJob && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{selectedJob.title}</h2>
                            <button className="modal-close" onClick={closeModal}>
                                <X size={24} />
                            </button>
                        </div>
                        <div className="modal-body">
                            {selectedJob.status === 'Rejected' && selectedJob.rejectionReason && (
                                <div className="rejection-banner">
                                    <XCircle size={20} />
                                    <div>
                                        <strong>Job Rejected</strong>
                                        <p>{selectedJob.rejectionReason}</p>
                                    </div>
                                </div>
                            )}
                            <div className="job-detail-section">
                                <div className="detail-row">
                                    <span className="detail-label">Category:</span>
                                    <span className="category-badge">{selectedJob.categoryName}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">Status:</span>
                                    <span className={`status-badge ${selectedJob.status?.toLowerCase() || 'open'}`}>
                                        {selectedJob.status || 'Open'}
                                    </span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label"><MapPin size={16} /> Location:</span>
                                    <span>{selectedJob.location}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label"><span className="currency-label-sm">RWF</span> Salary:</span>
                                    <span>{selectedJob.salaryRange}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label"><Briefcase size={16} /> Type:</span>
                                    <span>{selectedJob.type}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label"><Calendar size={16} /> Posted:</span>
                                    <span>{new Date(selectedJob.postedDate).toLocaleDateString()}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label"><Calendar size={16} /> Deadline:</span>
                                    <span>{new Date(selectedJob.deadline).toLocaleDateString()}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label"><Eye size={16} /> Views:</span>
                                    <span>{selectedJob.views}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label"><Users size={16} /> Applicants:</span>
                                    <span>{selectedJob.applicantCount}</span>
                                </div>
                            </div>

                            <div className="job-detail-section">
                                <h3>Description</h3>
                                <p className="job-description">{selectedJob.description}</p>
                            </div>

                            <div className="job-detail-section">
                                <h3>Requirements</h3>
                                <p className="job-requirements">{selectedJob.requirements}</p>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <Link to={`/employer/jobs/edit/${selectedJob.id}`} className="btn-primary">
                                <Edit size={16} /> Edit Job
                            </Link>
                            {selectedJob.status !== 'Rejected' && (
                                <Link to={`/employer/jobs/${selectedJob.id}/applicants`} className="btn-outline">
                                    <Users size={16} /> View Applicants
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default JobList;
