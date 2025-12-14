import React, { useState, useEffect } from 'react';
import { getEmployerStats } from '../../services/dashboardService';
import { getMyNotifications, markAsRead } from '../../services/notificationService';
import { Briefcase, FileText, CheckCircle, XCircle, Eye, Clock, Bell, X } from 'lucide-react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend
} from 'recharts';
import './EmployerDashboard.css';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const StatCard = ({ title, value, icon, color }) => (
    <div className="stat-card" style={{ borderTopColor: color }}>
        <div className="stat-icon" style={{ color: color }}>
            {icon}
        </div>
        <div className="stat-info">
            <h3>{value}</h3>
            <p>{title}</p>
        </div>
    </div>
);

const EmployerDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        const fetchStats = async () => {
            const result = await getEmployerStats();
            if (result.success) {
                setStats(result.data);
            } else {
                setError(result.message);
            }
            setLoading(false);
        };
        fetchStats();
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        const result = await getMyNotifications();
        if (result.success) {
            // Filter for unread broadcast notifications
            const broadcasts = result.data.filter(n => n.type === 'Broadcast' && !n.isRead);
            setNotifications(broadcasts);
        }
    };

    const handleDismissNotification = async (id) => {
        await markAsRead(id);
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    if (loading) return <div className="loading">Loading stats...</div>;
    if (error) return <div className="error">{error}</div>;
    if (!stats) return null;

    return (
        <div className="employer-dashboard">
            {notifications.length > 0 && (
                <div className="dashboard-alerts">
                    {notifications.map(notification => (
                        <div key={notification.id} className="alert-banner">
                            <div className="alert-content">
                                <Bell size={20} />
                                <div>
                                    <strong>{notification.title}</strong>
                                    <p>{notification.message}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => handleDismissNotification(notification.id)}
                                className="alert-dismiss"
                            >
                                <X size={18} />
                            </button>
                        </div>
                    ))}
                </div>
            )}
            <h1>Dashboard Overview</h1>

            <div className="stats-grid">
                <StatCard
                    title="Total Jobs"
                    value={stats.totalJobs}
                    icon={<Briefcase size={24} />}
                    color="#3b82f6"
                />
                <StatCard
                    title="Applications"
                    value={stats.totalApplicationsReceived}
                    icon={<FileText size={24} />}
                    color="#8b5cf6"
                />
                <StatCard
                    title="Hired"
                    value={stats.hiredCount}
                    icon={<CheckCircle size={24} />}
                    color="#22c55e"
                />
                <StatCard
                    title="Rejected"
                    value={stats.rejectedCount}
                    icon={<XCircle size={24} />}
                    color="#ef4444"
                />
                <StatCard
                    title="Total Views"
                    value={stats.totalJobViews}
                    icon={<Eye size={24} />}
                    color="#eab308"
                />
                <StatCard
                    title="Pending Jobs"
                    value={stats.pendingJobs}
                    icon={<Clock size={24} />}
                    color="#f97316"
                />
            </div>

            <div className="charts-section">
                <div className="chart-card">
                    <h3>Applications Received (Last 6 Months)</h3>
                    <div className="chart-container">
                        <ResponsiveContainer width="100%" height={300}>
                            <AreaChart data={stats.applicationsOverTime}>
                                <defs>
                                    <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="name" stroke="#9CA3AF" />
                                <YAxis stroke="#9CA3AF" />
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'rgba(30, 41, 59, 0.9)',
                                        border: '1px solid rgba(148, 163, 184, 0.1)',
                                        borderRadius: '0.5rem',
                                        backdropFilter: 'blur(4px)'
                                    }}
                                    itemStyle={{ color: '#F3F4F6' }}
                                />
                                <Area type="monotone" dataKey="value" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorApps)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="chart-card">
                    <h3>Applicant Status Distribution</h3>
                    <div className="chart-container">
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={stats.applicantStatusDistribution}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {stats.applicantStatusDistribution.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'rgba(30, 41, 59, 0.9)',
                                        border: '1px solid rgba(148, 163, 184, 0.1)',
                                        borderRadius: '0.5rem',
                                        backdropFilter: 'blur(4px)'
                                    }}
                                    itemStyle={{ color: '#F3F4F6' }}
                                />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="dashboard-section">
                <h2>Recent Activity</h2>
                {stats.recentActivity && stats.recentActivity.length > 0 ? (
                    <div className="activity-list">
                        {stats.recentActivity.map(activity => {
                            let ActivityIcon = FileText;
                            const desc = activity.description.toLowerCase();
                            if (desc.includes('job')) ActivityIcon = Briefcase;
                            else if (desc.includes('interview')) ActivityIcon = Clock;
                            else if (desc.includes('hired')) ActivityIcon = CheckCircle;
                            else if (desc.includes('rejected')) ActivityIcon = XCircle;

                            return (
                                <div key={activity.id} className="activity-item">
                                    <div className="activity-icon">
                                        <ActivityIcon size={18} />
                                    </div>
                                    <div className="activity-content">
                                        <p className="activity-description">{activity.description}</p>
                                        <span className="activity-date">
                                            {new Date(activity.date).toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="empty-state">
                        <p>No recent activity to show.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EmployerDashboard;
