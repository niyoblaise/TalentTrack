import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getEmployeeStats } from '../../services/dashboardService';
import { getMyNotifications, markAsRead } from '../../services/notificationService';
import { Briefcase, Clock, Users, CheckCircle, XCircle, TrendingUp, TrendingDown, Bell, X } from 'lucide-react';
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    ResponsiveContainer,
    Legend
} from 'recharts';
import './EmployeeDashboard.css';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const EmployeeDashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        fetchStats();
        fetchNotifications();
    }, []);

    const fetchStats = async () => {
        const result = await getEmployeeStats();
        if (result.success) {
            setStats(result.data);
        }
        setLoading(false);
    };

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

    if (loading) {
        return <div className="loading-container">Loading dashboard...</div>;
    }

    const statCards = [
        {
            title: 'Total Applications',
            value: stats?.totalApplications || 0,
            icon: <Briefcase size={24} />,
            color: '#3b82f6',
            bgColor: 'rgba(59, 130, 246, 0.1)'
        },
        {
            title: 'Pending Review',
            value: stats?.pendingApplications || 0,
            icon: <Clock size={24} />,
            color: '#f59e0b',
            bgColor: 'rgba(245, 158, 11, 0.1)'
        },
        {
            title: 'In Screening',
            value: stats?.screeningCount || 0,
            icon: <Users size={24} />,
            color: '#8b5cf6',
            bgColor: 'rgba(139, 92, 246, 0.1)'
        },
        {
            title: 'Interview Scheduled',
            value: stats?.interviewScheduled || 0,
            icon: <Users size={24} />,
            color: '#06b6d4',
            bgColor: 'rgba(6, 182, 212, 0.1)'
        },
        {
            title: 'Hired',
            value: stats?.hiredCount || 0,
            icon: <CheckCircle size={24} />,
            color: '#10b981',
            bgColor: 'rgba(16, 185, 129, 0.1)'
        },
        {
            title: 'Rejected',
            value: stats?.rejectedCount || 0,
            icon: <XCircle size={24} />,
            color: '#ef4444',
            bgColor: 'rgba(239, 68, 68, 0.1)'
        }
    ];

    return (
        <div className="employee-dashboard">
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

            <div className="dashboard-header">
                <div>
                    <h1>Welcome back, {user?.firstName || user?.email}!</h1>
                    <p>Here's your application overview</p>
                </div>
            </div>

            <div className="stats-grid">
                {statCards.map((card, index) => (
                    <div
                        key={index}
                        className="stat-card"
                        style={{ borderLeft: `4px solid ${card.color}` }}
                    >
                        <div className="stat-icon" style={{ backgroundColor: card.bgColor, color: card.color }}>
                            {card.icon}
                        </div>
                        <div className="stat-content">
                            <h3>{card.title}</h3>
                            <p className="stat-value" style={{ color: card.color }}>
                                <strong>{card.value}</strong>
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {stats && stats.totalApplications > 0 && (
                <div className="charts-section">
                    <div className="chart-card">
                        <h3>Application Status Distribution</h3>
                        <div className="chart-container">
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={stats.applicationStatusDistribution}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {stats.applicationStatusDistribution.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '0.5rem' }}
                                        itemStyle={{ color: '#F3F4F6' }}
                                    />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="success-metrics-container">
                        <div className="metric-card">
                            <div className="metric-header">
                                <TrendingUp size={20} color="#10b981" />
                                <h3>Success Rate</h3>
                            </div>
                            <p className="metric-value" style={{ color: '#10b981' }}>
                                <strong>{stats.hirePercentage}%</strong>
                            </p>
                            <p className="metric-label">Applications resulted in hire</p>
                        </div>
                        <div className="metric-card">
                            <div className="metric-header">
                                <TrendingDown size={20} color="#ef4444" />
                                <h3>Rejection Rate</h3>
                            </div>
                            <p className="metric-value" style={{ color: '#ef4444' }}>
                                <strong>{stats.rejectionPercentage}%</strong>
                            </p>
                            <p className="metric-label">Applications were rejected</p>
                        </div>
                    </div>
                </div>
            )}

            {(!stats || stats.totalApplications === 0) && (
                <div className="empty-state">
                    <Briefcase size={64} />
                    <h2>No Applications Yet</h2>
                    <p>Start browsing jobs and apply to positions that match your skills!</p>
                </div>
            )}
        </div>
    );
};

export default EmployeeDashboard;
