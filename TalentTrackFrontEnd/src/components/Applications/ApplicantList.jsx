import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getJobApplications } from '../../services/applicationService';
import { Users, ArrowLeft, Mail, Award, Briefcase, FileText, CheckCircle, XCircle, Clock } from 'lucide-react';
import './Applications.css';

const ApplicantList = () => {
    const { jobId } = useParams();
    const [applicants, setApplicants] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchApplicants();
    }, [jobId]);

    const fetchApplicants = async () => {
        const result = await getJobApplications(jobId);
        if (result.success) {
            // Sort by Match Score (High to Low)
            const sortedApplicants = result.data.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
            setApplicants(sortedApplicants);
        }
        setLoading(false);
    };

    const getScoreClass = (score) => {
        if (!score) return 'score-low';
        if (score >= 70) return 'score-high';
        if (score >= 40) return 'score-medium';
        return 'score-low';
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Hired': return <CheckCircle size={14} />;
            case 'Rejected': return <XCircle size={14} />;
            default: return <Clock size={14} />;
        }
    };

    if (loading) return <div className="loading-container">Loading applicants...</div>;

    return (
        <div className="applicant-list-container">
            <div className="page-header">
                <div>
                    <h1>Job Applicants</h1>
                    <p className="subtitle">Review and manage candidates for this position</p>
                </div>
                <Link to="/employer/jobs" className="back-btn">
                    <ArrowLeft size={18} /> Back to Jobs
                </Link>
            </div>

            <div className="applicants-grid">
                {applicants.length === 0 ? (
                    <div className="empty-state">
                        <Users size={48} />
                        <h3>No applicants yet</h3>
                        <p>Candidates will appear here once they apply.</p>
                    </div>
                ) : (
                    applicants.map(app => (
                        <div key={app.id} className="applicant-card">
                            <div className="applicant-main">
                                <div className="applicant-header-row">
                                    <h3>{app.employeeName}</h3>
                                    {app.matchScore !== undefined && (
                                        <span className={`match-score ${getScoreClass(app.matchScore)}`}>
                                            <Award size={14} />
                                            {app.matchScore}% Match
                                        </span>
                                    )}
                                </div>

                                <div className="applicant-details">
                                    <div className="detail-item">
                                        <Mail size={16} />
                                        <span>{app.employeeEmail}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className={`status-badge ${app.currentStatus.toLowerCase()}`}>
                                            {getStatusIcon(app.currentStatus)}
                                            {app.currentStatus}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="applicant-actions">
                                <Link to={`/employer/applications/${app.id}`} className="btn-view-details">
                                    View Application <ArrowLeft size={16} style={{ transform: 'rotate(180deg)' }} />
                                </Link>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ApplicantList;
