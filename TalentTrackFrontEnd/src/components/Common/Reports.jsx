import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { BarChart2, PieChart as PieChartIcon, Download, Calendar } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import './Reports.css';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const Reports = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({ jobs: [], applications: [] });
    const [dateRange, setDateRange] = useState({
        startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0]
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchStats();
    }, [dateRange]);

    const fetchStats = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/reports/stats?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`);
            setStats(response.data);
        } catch (error) {
            console.error('Failed to fetch stats', error);
        } finally {
            setLoading(false);
        }
    };

    const handleExport = async () => {
        try {
            const response = await api.get(`/reports/export/applications?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`, {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;

            const date = new Date().toISOString().split('T')[0];
            const userName = user ? `${user.firstName}_${user.lastName}` : 'user';
            link.setAttribute('download', `applications_report_${userName}_${date}.csv`);

            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Failed to export report', error);
        }
    };

    const handleDateChange = (e) => {
        setDateRange(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    return (
        <div className="reports-container">
            <div className="reports-header">
                <div>
                    <h1>Reports & Analytics</h1>
                    <p>Track your job application progress and status overview</p>
                </div>
                <button onClick={handleExport} className="export-btn">
                    <Download size={18} />
                    Export CSV
                </button>
            </div>

            <div className="reports-controls">
                <div className="control-group">
                    <div className="control-label">
                        <Calendar size={16} />
                        <span>Date Range</span>
                    </div>
                    <div className="date-inputs">
                        <input
                            type="date"
                            name="startDate"
                            value={dateRange.startDate}
                            onChange={handleDateChange}
                        />
                        <span className="date-separator">to</span>
                        <input
                            type="date"
                            name="endDate"
                            value={dateRange.endDate}
                            onChange={handleDateChange}
                        />
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Loading analytics data...</p>
                </div>
            ) : (
                <div className="charts-grid">
                    {stats.jobs && stats.jobs.length > 0 && (
                        <div className="chart-card">
                            <div className="chart-header">
                                <div className="chart-icon job-icon">
                                    <BarChart2 size={20} />
                                </div>
                                <h3>Job Status Distribution</h3>
                            </div>
                            <div className="chart-content">
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={stats.jobs}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                                        <XAxis
                                            dataKey="status"
                                            stroke="#94a3b8"
                                            tick={{ fill: '#94a3b8' }}
                                            axisLine={{ stroke: '#334155' }}
                                        />
                                        <YAxis
                                            stroke="#94a3b8"
                                            tick={{ fill: '#94a3b8' }}
                                            axisLine={{ stroke: '#334155' }}
                                        />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: '#1e293b',
                                                borderColor: '#334155',
                                                color: '#f1f5f9'
                                            }}
                                            itemStyle={{ color: '#f1f5f9' }}
                                            cursor={{ fill: 'rgba(51, 65, 85, 0.4)' }}
                                        />
                                        <Bar
                                            dataKey="count"
                                            fill="#3b82f6"
                                            radius={[4, 4, 0, 0]}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    )}

                    <div className="chart-card">
                        <div className="chart-header">
                            <div className="chart-icon app-icon">
                                <PieChartIcon size={20} />
                            </div>
                            <h3>Application Status</h3>
                        </div>
                        <div className="chart-content">
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={stats.applications}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="count"
                                        nameKey="status"
                                    >
                                        {stats.applications.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#1e293b',
                                            borderColor: '#334155',
                                            color: '#f1f5f9'
                                        }}
                                        itemStyle={{ color: '#f1f5f9' }}
                                    />
                                    <Legend
                                        verticalAlign="bottom"
                                        height={36}
                                        formatter={(value) => <span style={{ color: '#94a3b8' }}>{value}</span>}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Reports;
