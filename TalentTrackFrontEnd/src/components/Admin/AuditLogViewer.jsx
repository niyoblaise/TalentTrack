import React, { useState, useEffect } from 'react';
import { getAuditLogs } from '../../services/adminService';
import { Search, ChevronLeft, ChevronRight, Clock, User, Activity, Database } from 'lucide-react';
import './AuditLogViewer.css';

const AuditLogViewer = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [entityFilter, setEntityFilter] = useState('');
    const [totalCount, setTotalCount] = useState(0);

    const fetchLogs = async () => {
        setLoading(true);
        const response = await getAuditLogs(page, 20, entityFilter);
        if (response.success) {
            setLogs(response.data.data);
            setTotalPages(response.data.totalPages);
            setTotalCount(response.data.totalCount);
        }
        setLoading(false);
    };

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchLogs();
        }, 500); // Debounce search

        return () => clearTimeout(timeoutId);
    }, [page, entityFilter]);

    const getActionColor = (method) => {
        switch (method) {
            case 'POST': return 'action-create';
            case 'PUT': return 'action-update';
            case 'DELETE': return 'action-delete';
            default: return 'action-default';
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString();
    };

    return (
        <div className="audit-viewer-container">
            <div className="audit-header">
                <div className="header-title">
                    <Activity size={24} className="header-icon" />
                    <h2>Audit Logs</h2>
                    <span className="log-count">{totalCount} entries</span>
                </div>

                <div className="search-box">
                    <Search size={18} />
                    <input
                        type="text"
                        placeholder="Filter by Entity (e.g., Job, User)..."
                        value={entityFilter}
                        onChange={(e) => {
                            setEntityFilter(e.target.value);
                            setPage(1); // Reset to first page on search
                        }}
                    />
                </div>
            </div>

            <div className="audit-table-container">
                {loading ? (
                    <div className="loading-state">Loading audit logs...</div>
                ) : (
                    <table className="audit-table">
                        <thead>
                            <tr>
                                <th>Method</th>
                                <th>Entity</th>
                                <th>User ID</th>
                                <th>Duration</th>
                                <th>Status</th>
                                <th>Timestamp</th>
                                <th>Details</th>
                            </tr>
                        </thead>
                        <tbody>
                            {logs.length > 0 ? (
                                logs.map((log) => (
                                    <tr key={log.id}>
                                        <td>
                                            <span className={`method-badge ${getActionColor(log.actionType)}`}>
                                                {log.actionType}
                                            </span>
                                        </td>
                                        <td className="entity-cell">
                                            <div className="cell-content">
                                                <Database size={14} />
                                                {log.entityName}
                                            </div>
                                        </td>
                                        <td className="user-cell">
                                            <div className="cell-content">
                                                <User size={14} />
                                                {log.userId ? log.userId.substring(0, 8) + '...' : 'System'}
                                            </div>
                                        </td>
                                        <td>{log.durationMs}ms</td>
                                        <td>
                                            <span className={`status-badge ${log.responseStatusCode >= 200 && log.responseStatusCode < 300 ? 'success' : 'error'}`}>
                                                {log.responseStatusCode}
                                            </span>
                                        </td>
                                        <td className="time-cell">
                                            <div className="cell-content">
                                                <Clock size={14} />
                                                {formatDate(log.timestamp)}
                                            </div>
                                        </td>
                                        <td className="details-cell">
                                            <div className="details-truncate" title={log.detailsJson}>
                                                {log.detailsJson || '-'}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="empty-state">No audit logs found</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            <div className="pagination-controls">
                <button
                    disabled={page === 1}
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    className="page-btn"
                >
                    <ChevronLeft size={20} />
                </button>
                <span className="page-info">Page {page} of {totalPages || 1}</span>
                <button
                    disabled={page === totalPages}
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    className="page-btn"
                >
                    <ChevronRight size={20} />
                </button>
            </div>
        </div>
    );
};

export default AuditLogViewer;
