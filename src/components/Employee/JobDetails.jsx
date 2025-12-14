import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getJob, deleteJob } from '../../services/jobService';
import { applyToJob } from '../../services/applicationService';
import { MapPin, Briefcase, Calendar, DollarSign, Building, FileText, Upload, ArrowLeft, CheckCircle, Edit, Trash2 } from 'lucide-react';
import './EmployeeJobs.css';

const JobDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const isEmployer = user?.role === 'Employer';

    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showApplicationForm, setShowApplicationForm] = useState(false);
    const [applicationData, setApplicationData] = useState({
        coverLetter: '',
        cvFile: null
    });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        fetchJob();
    }, [id]);

    const fetchJob = async () => {
        const result = await getJob(id);
        if (result.success) {
            setJob(result.data);
        }
        setLoading(false);
    };

    const isOwner = isEmployer && job && user?.id === job.employerId;

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this job? This action cannot be undone.')) {
            const result = await deleteJob(id);
            if (result.success) {
                navigate('/employer/jobs');
            } else {
                alert(result.message);
            }
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                setError('File size must be less than 5MB');
                return;
            }
            setApplicationData({ ...applicationData, cvFile: file });
            setError('');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!applicationData.cvFile) {
            setError('Please upload your CV');
            return;
        }

        setSubmitting(true);
        setError('');

        const formData = new FormData();
        formData.append('jobId', id);
        formData.append('coverLetter', applicationData.coverLetter);
        formData.append('cv', applicationData.cvFile);

        const result = await applyToJob(formData);

        if (result.success) {
            setSuccess(true);
            setTimeout(() => {
                navigate('/employee/applications');
            }, 2000);
        } else {
            setError(result.message);
        }
        setSubmitting(false);
    };

    if (loading) {
        return <div className="loading-container">Loading job details...</div>;
    }

    if (!job) {
        return <div className="error-container">Job not found</div>;
    }

    if (success) {
        return (
            <div className="success-container">
                <CheckCircle size={64} className="success-icon" />
                <h2>Application Submitted!</h2>
                <p>Your application has been successfully submitted.</p>
                <p>Redirecting to your applications...</p>
            </div>
        );
    }

    return (
        <div className="job-details-container">
            <div className="job-details-header-row">
                <button className="back-btn" onClick={() => navigate(isEmployer ? '/employer/all-jobs' : '/employee/jobs')}>
                    <ArrowLeft size={18} />
                    {isEmployer ? 'Back to All Jobs' : 'Back to Jobs'}
                </button>

                {isOwner && (
                    <div className="owner-actions">
                        <button className="btn-outline" onClick={() => navigate(`/employer/jobs/edit/${id}`)}>
                            <Edit size={16} /> Edit
                        </button>
                        <button className="btn-danger" onClick={handleDelete}>
                            <Trash2 size={16} /> Delete
                        </button>
                    </div>
                )}
            </div>

            <div className="job-details-card">
                <div className="job-header-section">
                    <div>
                        <h1>{job.title}</h1>
                        <p className="company-name">
                            <Building size={18} />
                            {job.employerName}
                        </p>
                    </div>
                    <span className="category-badge">{job.categoryName}</span>
                </div>

                <div className="job-meta-grid">
                    <div className="meta-card">
                        <Briefcase size={20} />
                        <div>
                            <span className="meta-label">Job Type</span>
                            <span className="meta-value">{job.type}</span>
                        </div>
                    </div>
                    <div className="meta-card">
                        <MapPin size={20} />
                        <div>
                            <span className="meta-label">Location</span>
                            <span className="meta-value">{job.location}</span>
                        </div>
                    </div>
                    <div className="meta-card">
                        <span className="currency-icon">RWF</span>
                        <div>
                            <span className="meta-label">Salary Range</span>
                            <span className="meta-value">{job.salaryRange}</span>
                        </div>
                    </div>
                    <div className="meta-card">
                        <Calendar size={20} />
                        <div>
                            <span className="meta-label">Deadline</span>
                            <span className="meta-value">{new Date(job.deadline).toLocaleDateString()}</span>
                        </div>
                    </div>
                </div>

                <div className="applicant-count">
                    <FileText size={18} />
                    {job.applicantCount} {job.applicantCount === 1 ? 'applicant' : 'applicants'}
                </div>

                <div className="job-section">
                    <h2>Job Description</h2>
                    <p className="job-text">{job.description}</p>
                </div>

                <div className="job-section">
                    <h2>Requirements</h2>
                    <p className="job-text">{job.requirements}</p>
                </div>

                {!isEmployer && !showApplicationForm && (
                    <button className="apply-btn" onClick={() => setShowApplicationForm(true)}>
                        Apply for this Position
                    </button>
                )}

                {showApplicationForm && (
                    <div className="application-form">
                        <h2>Submit Your Application</h2>

                        {error && <div className="error-message">{error}</div>}

                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Cover Letter</label>
                                <textarea
                                    value={applicationData.coverLetter}
                                    onChange={(e) => setApplicationData({ ...applicationData, coverLetter: e.target.value })}
                                    rows="6"
                                    placeholder="Tell us why you're a great fit for this role..."
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Upload CV/Resume (PDF, DOC, DOCX - Max 5MB)</label>
                                <div className="file-upload-wrapper">
                                    <input
                                        type="file"
                                        id="cv-upload"
                                        accept=".pdf,.doc,.docx"
                                        onChange={handleFileChange}
                                        required
                                    />
                                    <label htmlFor="cv-upload" className="file-upload-label">
                                        <Upload size={20} />
                                        {applicationData.cvFile ? applicationData.cvFile.name : 'Choose file'}
                                    </label>
                                </div>
                            </div>

                            <div className="form-actions">
                                <button
                                    type="button"
                                    className="btn-outline"
                                    onClick={() => setShowApplicationForm(false)}
                                    disabled={submitting}
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="btn-primary" disabled={submitting}>
                                    {submitting ? 'Submitting...' : 'Submit Application'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
};

export default JobDetails;
