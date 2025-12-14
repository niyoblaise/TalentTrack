import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAdminStats } from '../../services/adminService';
import {
    Users,
    Briefcase,
    FileText,
    CheckCircle,
    Clock,
    UserCheck,
    UserX,
    TrendingUp
} from 'lucide-react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar,
    Legend
} from 'recharts';
import './AdminDashboard.css';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        setLoading(true);
        const result = await getAdminStats();
        if (result.success) {
            setStats(result.data);
        }
        setLoading(false);
    };

    if (loading) {
        return <div className="loading-container">Loading dashboard...</div>;
    }

    if (!stats) {
        return <div className="error-container">Failed to load dashboard stats</div>;
    }

    return (
        <div className="admin-dashboard">
            <div className="dashboard-header">
                <div>
                    <h1>Admin Dashboard</h1>
                    <p>Overview of platform activity and statistics</p>
                </div>
            </div>

            {/* Main Stats Grid */}
            <div className="stats-grid">
                <div className="stat-card primary" onClick={() => navigate('/admin/users')}>
                    <div className="stat-icon">
                        <Users size={32} />
                    </div>
                    <div className="stat-content">
                        <h3>Total Users</h3>
                        <div className="stat-value">{stats.totalUsers}</div>
                        <div className="stat-meta">
                            <span className="active">{stats.activeUsers} active</span>
                            <span className="inactive">{stats.deactivatedUsers} deactivated</span>
                        </div>
                    </div>
                </div>

                <div className="stat-card success" onClick={() => navigate('/admin/jobs')}>
                    <div className="stat-icon">
                        <Briefcase size={32} />
                    </div>
                    <div className="stat-content">
                        <h3>Total Jobs</h3>
                        <div className="stat-value">{stats.totalJobs}</div>
                        <div className="stat-meta">
                            <span className="approved">{stats.approvedJobs} approved</span>
                            <span className="pending">{stats.pendingJobs} pending</span>
                        </div>
                    </div>
                </div>

                <div className="stat-card info">
                    <div className="stat-icon">
                        <FileText size={32} />
                    </div>
                    <div className="stat-content">
                        <h3>Applications</h3>
                        <div className="stat-value">{stats.totalApplications}</div>
                        <div className="stat-meta">
                            <span>Total submissions</span>
                        </div>
                    </div>
                </div>

                {stats.pendingJobs > 0 && (
                    <div className="stat-card warning" onClick={() => navigate('/admin/jobs')}>
                        <div className="stat-icon">
                            <Clock size={32} />
                        </div>
                        <div className="stat-content">
                            <h3>Pending Approval</h3>
                            <div className="stat-value">{stats.pendingJobs}</div>
                            <div className="stat-meta">
                                <span>Jobs awaiting review</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Charts Section */}
            <div className="charts-section">
                <div className="chart-card">
                    <h3>User Growth (Last 6 Months)</h3>
                    <div className="chart-container">
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={stats.userGrowth}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                <XAxis dataKey="name" stroke="#9CA3AF" />
                                <YAxis stroke="#9CA3AF" />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '0.5rem' }}
                                    itemStyle={{ color: '#F3F4F6' }}
                                />
                                <Line type="monotone" dataKey="value" stroke="#3B82F6" strokeWidth={2} dot={{ r: 4 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="chart-card">
                    <h3>Jobs Posted Trends</h3>
                    <div className="chart-container">
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={stats.jobsPostedOverTime}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                <XAxis dataKey="name" stroke="#9CA3AF" />
                                <YAxis stroke="#9CA3AF" />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '0.5rem' }}
                                    itemStyle={{ color: '#F3F4F6' }}
                                />
                                <Line type="monotone" dataKey="value" stroke="#10B981" strokeWidth={2} dot={{ r: 4 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="chart-card">
                    <h3>Application Trends</h3>
                    <div className="chart-container">
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={stats.applicationTrends}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                <XAxis dataKey="name" stroke="#9CA3AF" />
                                <YAxis stroke="#9CA3AF" />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '0.5rem' }}
                                    itemStyle={{ color: '#F3F4F6' }}
                                />
                                <Bar dataKey="value" fill="#10B981" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="chart-card full-width">
                    <h3>Jobs by Category</h3>
                    <div className="chart-container">
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={stats.jobCategories} layout="vertical" margin={{ left: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" horizontal={false} />
                                <XAxis type="number" stroke="#9CA3AF" />
                                <YAxis dataKey="name" type="category" stroke="#9CA3AF" width={150} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '0.5rem' }}
                                    itemStyle={{ color: '#F3F4F6' }}
                                />
                                <Bar dataKey="value" fill="#8B5CF6" radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* User Breakdown */}
            <div className="breakdown-section">
                <h2>User Breakdown</h2>
                <div className="breakdown-grid">
                    <div className="breakdown-card">
                        <div className="breakdown-icon employers">
                            <Briefcase size={24} />
                        </div>
                        <div className="breakdown-content">
                            <div className="breakdown-value">{stats.totalEmployers}</div>
                            <div className="breakdown-label">Employers</div>
                            <div className="breakdown-percentage">
                                {((stats.totalEmployers / stats.totalUsers) * 100).toFixed(1)}%
                            </div>
                        </div>
                    </div>

                    <div className="breakdown-card">
                        <div className="breakdown-icon employees">
                            <Users size={24} />
                        </div>
                        <div className="breakdown-content">
                            <div className="breakdown-value">{stats.totalEmployees}</div>
                            <div className="breakdown-label">Job Seekers</div>
                            <div className="breakdown-percentage">
                                {((stats.totalEmployees / stats.totalUsers) * 100).toFixed(1)}%
                            </div>
                        </div>
                    </div>

                    <div className="breakdown-card">
                        <div className="breakdown-icon admins">
                            <UserCheck size={24} />
                        </div>
                        <div className="breakdown-content">
                            <div className="breakdown-value">{stats.totalAdmins}</div>
                            <div className="breakdown-label">Administrators</div>
                            <div className="breakdown-percentage">
                                {((stats.totalAdmins / stats.totalUsers) * 100).toFixed(1)}%
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="quick-actions-section">
                <h2>Quick Actions</h2>
                <div className="actions-grid">
                    {stats.pendingJobs > 0 && (
                        <button className="action-btn primary" onClick={() => navigate('/admin/jobs')}>
                            <CheckCircle size={20} />
                            <span>Review Pending Jobs ({stats.pendingJobs})</span>
                        </button>
                    )}

                    <button className="action-btn secondary" onClick={() => navigate('/admin/users')}>
                        <Users size={20} />
                        <span>Manage Users</span>
                    </button>

                    <button className="action-btn tertiary" onClick={() => navigate('/admin/broadcast')}>
                        <TrendingUp size={20} />
                        <span>Send Broadcast</span>
                    </button>

                    {stats.deactivatedUsers > 0 && (
                        <button className="action-btn warning" onClick={() => navigate('/admin/users?status=deactivated')}>
                            <UserX size={20} />
                            <span>View Deactivated Users ({stats.deactivatedUsers})</span>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
