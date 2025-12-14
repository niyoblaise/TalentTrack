import React, { useState, useEffect } from 'react';
import { getAllUsers, deleteUser, deactivateUser, activateUser, changeUserRole } from '../../services/adminService';
import {
    Users,
    Search,
    UserCheck,
    UserX,
    Trash2,
    Ban,
    CheckCircle,
    Shield,
    MoreVertical,
    Edit
} from 'lucide-react';
import './UserManagement.css';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [deactivationDays, setDeactivationDays] = useState(30);
    const [deactivationReason, setDeactivationReason] = useState('');
    const [actionLoading, setActionLoading] = useState(false);

    // Role Change State
    const [roleChangeUser, setRoleChangeUser] = useState(null);
    const [newRole, setNewRole] = useState('');

    useEffect(() => {
        fetchUsers();
    }, [roleFilter, statusFilter]);

    const fetchUsers = async () => {
        setLoading(true);
        const isActive = statusFilter === '' ? null : statusFilter === 'active';
        const result = await getAllUsers(roleFilter || null, isActive);
        if (result.success) {
            setUsers(result.data);
        }
        setLoading(false);
    };

    const handleDeactivate = async () => {
        if (!selectedUser || !deactivationReason.trim()) {
            alert('Please provide a deactivation reason');
            return;
        }

        setActionLoading(true);
        const result = await deactivateUser(selectedUser.id, deactivationDays, deactivationReason);
        if (result.success) {
            fetchUsers();
            setSelectedUser(null);
            setDeactivationReason('');
            setDeactivationDays(30);
        } else {
            alert(result.message);
        }
        setActionLoading(false);
    };

    const handleActivate = async (userId) => {
        if (!confirm('Are you sure you want to activate this user?')) return;

        setActionLoading(true);
        const result = await activateUser(userId);
        if (result.success) {
            fetchUsers();
        } else {
            alert(result.message);
        }
        setActionLoading(false);
    };

    const handleDelete = async (userId, userName) => {
        if (!confirm(`Are you sure you want to delete user "${userName}"? This action cannot be undone.`)) return;

        setActionLoading(true);
        const result = await deleteUser(userId);
        if (result.success) {
            fetchUsers();
        } else {
            alert(result.message);
        }
        setActionLoading(false);
    };

    const handleChangeRole = async () => {
        if (!roleChangeUser || !newRole) return;

        setActionLoading(true);
        const result = await changeUserRole(roleChangeUser.id, newRole);
        if (result.success) {
            fetchUsers();
            setRoleChangeUser(null);
            setNewRole('');
        } else {
            alert(result.message);
        }
        setActionLoading(false);
    };

    const openRoleChangeModal = (user) => {
        setRoleChangeUser(user);
        setNewRole(user.role);
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch =
            user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch;
    });

    const activeCount = users.filter(u => u.isActive).length;
    const deactivatedCount = users.filter(u => !u.isActive).length;

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Loading users...</p>
            </div>
        );
    }

    return (
        <div className="user-management-container">
            <div className="management-header">
                <div>
                    <h1>User Management</h1>
                    <p>Manage platform users, roles, and permissions</p>
                </div>
                <div className="user-stats">
                    <div className="stat-card active">
                        <div className="stat-icon">
                            <UserCheck size={20} />
                        </div>
                        <div className="stat-info">
                            <span className="stat-value">{activeCount}</span>
                            <span className="stat-label">Active Users</span>
                        </div>
                    </div>
                    <div className="stat-card deactivated">
                        <div className="stat-icon">
                            <UserX size={20} />
                        </div>
                        <div className="stat-info">
                            <span className="stat-value">{deactivatedCount}</span>
                            <span className="stat-label">Deactivated</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="filters-section">
                <div className="search-box">
                    <Search size={20} />
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="filter-controls">
                    <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
                        <option value="">All Roles</option>
                        <option value="Employer">Employers</option>
                        <option value="Employee">Job Seekers</option>
                        <option value="Admin">Administrators</option>
                    </select>

                    <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                        <option value="">All Status</option>
                        <option value="active">Active</option>
                        <option value="inactive">Deactivated</option>
                    </select>
                </div>
            </div>

            {/* Users Table */}
            <div className="users-table-container">
                <table className="users-table">
                    <thead>
                        <tr>
                            <th>User</th>
                            <th>Role</th>
                            <th>Status</th>
                            <th>Joined Date</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="empty-row">
                                    <div className="empty-state">
                                        <Users size={48} />
                                        <p>No users found matching your criteria</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            filteredUsers.map(user => (
                                <tr key={user.id}>
                                    <td>
                                        <div className="user-info-cell">
                                            <div className="user-avatar">
                                                {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                                            </div>
                                            <div className="user-details">
                                                <span className="user-name">{user.firstName} {user.lastName}</span>
                                                <span className="user-email">{user.email}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`role-badge ${user.role.toLowerCase()}`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td>
                                        {user.isActive ? (
                                            <span className="status-badge active">
                                                <span className="status-dot"></span> Active
                                            </span>
                                        ) : (
                                            <span className="status-badge deactivated">
                                                <span className="status-dot"></span> Deactivated
                                            </span>
                                        )}
                                    </td>
                                    <td>{new Date(user.createdDate).toLocaleDateString()}</td>
                                    <td>
                                        <div className="action-buttons">
                                            <button
                                                className="btn-icon"
                                                onClick={() => openRoleChangeModal(user)}
                                                title="Change Role"
                                            >
                                                <Shield size={18} />
                                            </button>

                                            {user.isActive ? (
                                                <button
                                                    className="btn-icon warning"
                                                    onClick={() => setSelectedUser(user)}
                                                    disabled={actionLoading}
                                                    title="Deactivate user"
                                                >
                                                    <Ban size={18} />
                                                </button>
                                            ) : (
                                                <button
                                                    className="btn-icon success"
                                                    onClick={() => handleActivate(user.id)}
                                                    disabled={actionLoading}
                                                    title="Activate user"
                                                >
                                                    <CheckCircle size={18} />
                                                </button>
                                            )}

                                            <button
                                                className="btn-icon danger"
                                                onClick={() => handleDelete(user.id, `${user.firstName} ${user.lastName}`)}
                                                disabled={actionLoading}
                                                title="Delete user"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Deactivation Modal */}
            {selectedUser && (
                <div className="modal-overlay" onClick={() => setSelectedUser(null)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Deactivate User</h2>
                            <button className="close-btn" onClick={() => setSelectedUser(null)}>&times;</button>
                        </div>
                        <div className="modal-body">
                            <p>You are about to deactivate <strong>{selectedUser.firstName} {selectedUser.lastName}</strong>.</p>

                            <div className="form-group">
                                <label>Deactivation Period (days)</label>
                                <input
                                    type="number"
                                    value={deactivationDays}
                                    onChange={(e) => setDeactivationDays(parseInt(e.target.value))}
                                    min="1"
                                    max="365"
                                />
                            </div>

                            <div className="form-group">
                                <label>Reason for Deactivation</label>
                                <textarea
                                    value={deactivationReason}
                                    onChange={(e) => setDeactivationReason(e.target.value)}
                                    placeholder="Enter reason for deactivation..."
                                    rows="4"
                                />
                            </div>
                        </div>
                        <div className="modal-actions">
                            <button
                                className="btn-secondary"
                                onClick={() => {
                                    setSelectedUser(null);
                                    setDeactivationReason('');
                                    setDeactivationDays(30);
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                className="btn-danger"
                                onClick={handleDeactivate}
                                disabled={actionLoading}
                            >
                                {actionLoading ? 'Processing...' : 'Deactivate User'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Role Change Modal */}
            {roleChangeUser && (
                <div className="modal-overlay" onClick={() => setRoleChangeUser(null)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Change User Role</h2>
                            <button className="close-btn" onClick={() => setRoleChangeUser(null)}>&times;</button>
                        </div>
                        <div className="modal-body">
                            <p>Changing role for <strong>{roleChangeUser.firstName} {roleChangeUser.lastName}</strong>.</p>

                            <div className="form-group">
                                <label>Select New Role</label>
                                <select
                                    value={newRole}
                                    onChange={(e) => setNewRole(e.target.value)}
                                    className="role-select"
                                >
                                    <option value="Employee">Employee (Job Seeker)</option>
                                    <option value="Employer">Employer</option>
                                    <option value="Admin">Admin</option>
                                </select>
                            </div>

                            <div className="warning-box">
                                <Shield size={16} />
                                <p>Changing a user's role will update their permissions immediately.</p>
                            </div>
                        </div>
                        <div className="modal-actions">
                            <button
                                className="btn-secondary"
                                onClick={() => setRoleChangeUser(null)}
                            >
                                Cancel
                            </button>
                            <button
                                className="btn-primary"
                                onClick={handleChangeRole}
                                disabled={actionLoading || newRole === roleChangeUser.role}
                            >
                                {actionLoading ? 'Updating...' : 'Update Role'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManagement;
