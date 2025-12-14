import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getEmployerStats } from '../../services/dashboardService';
import { getUnreadCount } from '../../services/notificationService';
import { LayoutDashboard, Briefcase, Calendar, Bell, User, LogOut, Settings, BarChart } from 'lucide-react';
import './EmployerLayout.css';

const EmployerLayout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [stats, setStats] = useState(null);
    const [unreadNotifications, setUnreadNotifications] = useState(0);

    useEffect(() => {
        fetchStats();
        fetchUnreadCount();
    }, []);

    const fetchStats = async () => {
        try {
            const result = await getEmployerStats();
            if (result.success) {
                setStats(result.data);
            }
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        }
    };

    const fetchUnreadCount = async () => {
        const result = await getUnreadCount();
        if (result.success) {
            setUnreadNotifications(result.count);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navItems = [
        { path: '/employer/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
        { path: '/employer/jobs', label: 'My Jobs', icon: <Briefcase size={20} /> },
        { path: '/employer/all-jobs', label: 'All Jobs', icon: <Briefcase size={20} /> },
        { path: '/employer/applications', label: 'Applications', icon: <User size={20} /> },
        { path: '/employer/interviews', label: 'Interviews', icon: <Calendar size={20} /> },
        { path: '/employer/notifications', label: 'Notifications', icon: <Bell size={20} />, badge: unreadNotifications },
        { path: '/employer/reports', label: 'Reports', icon: <BarChart size={20} /> },
    ];

    return (
        <div className="employer-layout">
            <aside className="sidebar">
                <div className="sidebar-header">
                    <h2>TalentTrack</h2>
                    <span className="role-badge">EMPLOYER</span>
                </div>
                <nav className="sidebar-nav">
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
                        >
                            <span className="nav-icon">{item.icon}</span>
                            <span className="nav-label">{item.label}</span>
                            {item.badge > 0 && <span className="nav-badge">{item.badge}</span>}
                        </Link>
                    ))}
                </nav>
                <div className="sidebar-footer">
                    <Link to="/employer/profile" className="user-info-link">
                        <div className="user-info">
                            <div className="avatar">
                                <User size={20} />
                            </div>
                            <div className="user-details">
                                <span className="user-name">My Profile</span>
                                <span className="user-email">{user?.email}</span>
                            </div>
                        </div>
                    </Link>
                    <button onClick={handleLogout} className="logout-btn">
                        <LogOut size={18} />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>
            <main className="main-content">
                <Outlet />
            </main>
        </div>
    );
};

export default EmployerLayout;
