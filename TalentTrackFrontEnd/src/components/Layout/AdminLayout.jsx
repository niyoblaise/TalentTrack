import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getUnreadCount } from '../../services/notificationService';
import {
    LayoutDashboard,
    Users,
    Briefcase,
    Bell,
    User,
    LogOut,
    Layers,
    Activity,
    Settings,
    BarChart
} from 'lucide-react';
import './AdminLayout.css';

const AdminLayout = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        fetchUnreadCount();
        // In a real app, you would listen to SignalR events here
        // const connection = ...
        // connection.on('ReceiveNotification', () => fetchUnreadCount());
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

    return (
        <div className="admin-layout">
            <aside className="admin-sidebar">
                <div className="sidebar-header">
                    <h2>TalentTrack</h2>
                    <span className="admin-badge">ADMIN</span>
                </div>

                <nav className="sidebar-nav">
                    <NavLink to="/admin/dashboard" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                        <LayoutDashboard size={20} />
                        <span>Dashboard</span>
                    </NavLink>

                    <NavLink to="/admin/users" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                        <Users size={20} />
                        <span>User Management</span>
                    </NavLink>

                    <NavLink to="/admin/jobs" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                        <Briefcase size={20} />
                        <span>Job Approval</span>
                    </NavLink>

                    <NavLink to="/admin/categories" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                        <Layers size={20} />
                        <span>Categories</span>
                    </NavLink>

                    <NavLink to="/admin/broadcast" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                        <Bell size={20} />
                        <span>Broadcast</span>
                        {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
                    </NavLink>

                    <NavLink to="/admin/audit" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                        <Activity size={20} />
                        <span>Audit Logs</span>
                    </NavLink>

                    <NavLink to="/admin/profile" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                        <User size={20} />
                        <span>Profile</span>
                    </NavLink>

                    <NavLink to="/admin/reports" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                        <BarChart size={20} />
                        <span>Reports</span>
                    </NavLink>
                </nav>

                <button className="logout-btn" onClick={handleLogout}>
                    <LogOut size={20} />
                    <span>Logout</span>
                </button>
            </aside>

            <main className="admin-main">
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;
