import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getApplication, updateApplicationStatus } from '../../services/applicationService';
import ScheduleInterviewModal from '../Interviews/ScheduleInterviewModal';
import { FileText, Mail, Calendar, XCircle, CheckCircle, ArrowLeft } from 'lucide-react';
import './Applications.css';

const ApplicantDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [application, setApplication] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [showInterviewModal, setShowInterviewModal] = useState(false);

    useEffect(() => {
        fetchApplication();
    }, [id]);

    const fetchApplication = async () => {
        const result = await getApplication(id);
        if (result.success) {
            setApplication(result.data);
        }
        setLoading(false);
    };

    const handleStatusUpdate = async (status, reason = null) => {
        const result = await updateApplicationStatus(id, status, reason);
        if (result.success) {
            fetchApplication();
            setShowRejectModal(false);
        } else {
            alert(result.message);
        }
    };

    if (loading) return <div className="loading-container">Loading details...</div>;
    if (!application) return <div className="error-container">Application not found</div>;

    return (
        <div className="applicant-details-container">
            <button className="back-btn" onClick={() => navigate(-1)} style={{ marginBottom: '1rem' }}>
                <ArrowLeft size={18} /> Back to List
            </button>

            <div className="details-header">
                <div>
                    <h1>{application.employeeName}</h1>
                    <p className="subtitle">Applied for: {application.jobTitle}</p>
                </div>
                <div className="status-display">
                    <span className={`status-badge ${application.currentStatus.toLowerCase()}`}>
                        {application.currentStatus}
                    </span>
                    {application.currentStatus === 'Rejected' && application.rejectionReason && (
                        <div className="rejection-reason-badge">
                            Reason: {application.rejectionReason}
                        </div>
                    )}
                </div>
            </div>

            <div className="details-card">
                <div className="section">
                    <h3>Contact Info</h3>
                    <p className="contact-item"><Mail size={16} /> {application.employeeEmail}</p>
                </div>

                <div className="section">
                    <h3>Cover Letter</h3>
                    <p className="cover-letter">{application.coverLetter}</p>
                </div>

                <div className="section">
                    <h3>CV / Resume</h3>
                    <a href={application.cvUrl} target="_blank" rel="noopener noreferrer" className="cv-btn">
                        <FileText size={18} /> View Decrypted CV
                    </a>
                </div>

                <div className="action-bar">
                    {application.currentStatus === 'Pending' && (
                        <>
                            <button onClick={() => setShowInterviewModal(true)} className="btn-primary">
                                <Calendar size={18} /> Schedule Interview
                            </button>
                            <button onClick={() => setShowRejectModal(true)} className="btn-danger">
                                <XCircle size={18} /> Reject
                            </button>
                        </>
                    )}
                    {application.currentStatus === 'Interview' && (
                        <>
                            <button onClick={() => handleStatusUpdate('Hired')} className="btn-success">
                                <CheckCircle size={18} /> Hire Candidate
                            </button>
                            <button onClick={() => setShowRejectModal(true)} className="btn-danger">
                                <XCircle size={18} /> Reject
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Reject Modal */}
            {showRejectModal && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h2>Reject Application</h2>
                        <textarea
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            placeholder="Reason for rejection..."
                            rows="4"
                        />
                        <div className="modal-actions">
                            <button onClick={() => setShowRejectModal(false)} className="btn-outline">Cancel</button>
                            <button onClick={() => handleStatusUpdate('Rejected', rejectionReason)} className="btn-danger">Confirm Rejection</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Interview Modal */}
            {showInterviewModal && (
                <ScheduleInterviewModal
                    applicationId={id}
                    onClose={() => setShowInterviewModal(false)}
                    onSuccess={() => {
                        setShowInterviewModal(false);
                        fetchApplication();
                    }}
                />
            )}
        </div>
    );
};

export default ApplicantDetails;
