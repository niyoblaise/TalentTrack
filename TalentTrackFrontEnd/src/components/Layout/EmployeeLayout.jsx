import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getUnreadCount } from '../../services/notificationService';
import { Briefcase, FileText, Bell, LogOut, User, LayoutDashboard, Video, Settings, BarChart } from 'lucide-react';
import './EmployeeLayout.css';

const EmployeeLayout = () => {
    const { logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        fetchUnreadCount();
    }, []);

    const fetchUnreadCount = async () => {
        const result = await getUnreadCount();
        if (result.success) {
            setUnreadCount(result.count);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isActive = (path) => {
        return location.pathname.startsWith(path);
    };

    return (
        <div className="employee-layout">
            <aside className="sidebar">
                <div className="sidebar-header">
                    <h2>TalentTrack</h2>
                    <span className="role-badge">Employee</span>
                </div>

                <nav className="sidebar-nav">
                    <Link
                        to="/employee/dashboard"
                        className={isActive('/employee/dashboard') ? 'active' : ''}
                    >
                        <LayoutDashboard size={20} />
                        Dashboard
                    </Link>
                    <Link
                        to="/employee/jobs"
                        className={isActive('/employee/jobs') ? 'active' : ''}
                    >
                        <Briefcase size={20} />
                        Browse Jobs
                    </Link>
                    <Link
                        to="/employee/applications"
                        className={isActive('/employee/applications') ? 'active' : ''}
                    >
                        <FileText size={20} />
                        My Applications
                    </Link>
                    <Link
                        to="/employee/interviews"
                        className={isActive('/employee/interviews') ? 'active' : ''}
                    >
                        <Video size={20} />
                        Interviews
                    </Link>
                    <Link
                        to="/employee/notifications"
                        className={isActive('/employee/notifications') ? 'active' : ''}
                    >
                        <Bell size={20} />
                        Notifications
                        {unreadCount > 0 && (
                            <span className="notification-badge">{unreadCount}</span>
                        )}
                    </Link>
                    <Link
                        to="/employee/reports"
                        className={isActive('/employee/reports') ? 'active' : ''}
                    >
                        <BarChart size={20} />
                        Reports
                    </Link>
                    <Link
                        to="/employee/profile"
                        className={isActive('/employee/profile') ? 'active' : ''}
                    >
                        <User size={20} />
                        Profile
                    </Link>
                </nav>

                <button className="logout-btn" onClick={handleLogout}>
                    <LogOut size={20} />
                    Logout
                </button>
            </aside>

            <main className="main-content">
                <Outlet />
            </main>
        </div>
    );
};

export default EmployeeLayout;
