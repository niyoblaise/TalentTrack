import React, { useState, useEffect } from 'react';
import { getApplicationHistory } from '../../services/applicationService';
import { Clock, CheckCircle, XCircle, Users, FileText, Calendar } from 'lucide-react';
import './ApplicationTracker.css';

const ApplicationTracker = ({ applicationId, onClose }) => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchHistory();
    }, [applicationId]);

    const fetchHistory = async () => {
        const result = await getApplicationHistory(applicationId);
        if (result.success) {
            setHistory(result.data);
        }
        setLoading(false);
    };

    const getStatusIcon = (status) => {
        switch (status.toLowerCase()) {
            case 'pending':
                return <Clock size={20} color="#f59e0b" />;
            case 'screening':
                return <FileText size={20} color="#8b5cf6" />;
            case 'interview':
                return <Users size={20} color="#06b6d4" />;
            case 'hired':
                return <CheckCircle size={20} color="#10b981" />;
            case 'rejected':
                return <XCircle size={20} color="#ef4444" />;
            default:
                return <Clock size={20} color="#94a3b8" />;
        }
    };

    const getStatusColor = (status) => {
        switch (status.toLowerCase()) {
            case 'pending':
                return '#f59e0b';
            case 'screening':
                return '#8b5cf6';
            case 'interview':
                return '#06b6d4';
            case 'hired':
                return '#10b981';
            case 'rejected':
                return '#ef4444';
            default:
                return '#94a3b8';
        }
    };

    if (loading) {
        return (
            <div className="tracker-modal-overlay" onClick={onClose}>
                <div className="tracker-modal" onClick={(e) => e.stopPropagation()}>
                    <div className="tracker-loading">Loading timeline...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="tracker-modal-overlay" onClick={onClose}>
            <div className="tracker-modal" onClick={(e) => e.stopPropagation()}>
                <div className="tracker-header">
                    <h2>Application Timeline</h2>
                    <button className="tracker-close" onClick={onClose}>×</button>
                </div>

                <div className="tracker-body">
                    {history.length === 0 ? (
                        <div className="tracker-empty">
                            <p>No history available</p>
                        </div>
                    ) : (
                        <div className="timeline">
                            {history.map((item, index) => (
                                <div key={item.id} className="timeline-item">
                                    <div
                                        className="timeline-marker"
                                        style={{ backgroundColor: getStatusColor(item.status) }}
                                    >
                                        {getStatusIcon(item.status)}
                                    </div>
                                    <div className="timeline-content">
                                        <div className="timeline-status">
                                            <strong style={{ color: getStatusColor(item.status) }}>
                                                {item.status}
                                            </strong>
                                        </div>
                                        <div className="timeline-date">
                                            <Calendar size={14} />
                                            {new Date(item.changedDate).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </div>
                                        {item.notes && (
                                            <div className="timeline-notes">
                                                {item.notes}
                                            </div>
                                        )}
                                    </div>
                                    {index < history.length - 1 && (
                                        <div
                                            className="timeline-line"
                                            style={{ backgroundColor: getStatusColor(item.status) }}
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ApplicationTracker;
