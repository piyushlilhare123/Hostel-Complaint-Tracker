import { useState, useEffect } from 'react';
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import StatsCard from "../components/StatsCard";
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [stats, setStats] = useState({ total: 0, active: 0, pending: 0, resolved: 0, slaBreaches: 0, nearDeadline: 0 });
    const { user, token } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await fetch('/api/complaints/stats', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await response.json();
                setStats(data);
            } catch (error) {
                console.error('Error fetching stats:', error);
            }
        };

        fetchStats();
    }, [token]);

    return (
        <div className="bg-slate-50 dark:bg-slate-900 min-h-screen transition-colors duration-300">
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
            <Navbar onMenuClick={() => setIsSidebarOpen(true)} />

            <div className="lg:ml-72 p-6 lg:p-10 transition-all duration-300">

                {/* Student Info Card */}
                {user.role === 'Student' && (
                    <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg mb-8">
                        <h2 className="text-3xl font-bold mb-2">Welcome, {user.name}!</h2>
                        <div className="flex flex-wrap gap-4 text-indigo-100">
                            <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-lg backdrop-blur-sm">
                                <span className="font-semibold">Hostel Block:</span> {user.hostelBlock || 'N/A'}
                            </div>
                            <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-lg backdrop-blur-sm">
                                <span className="font-semibold">Room Number:</span> {user.roomNumber || 'N/A'}
                            </div>
                        </div>
                    </div>
                )}

                {/* Admin Welcome Card */}
                {user.role === 'Admin' && (
                    <div className="bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl p-6 text-white shadow-lg mb-8">
                        <h2 className="text-3xl font-bold mb-2">Welcome, {user.name}!</h2>
                        <p className="text-orange-100">Manage complaints, assign staff, and oversee the system efficiently.</p>
                    </div>
                )}

                {/* Staff Welcome Card */}
                {user.role === 'Staff' && (
                    <div className="bg-gradient-to-r from-blue-500 to-cyan-600 rounded-2xl p-6 text-white shadow-lg mb-8">
                        <h2 className="text-3xl font-bold mb-2">Welcome, {user.name}!</h2>
                        <div className="flex flex-wrap gap-4 text-blue-100 mb-4">
                            <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-lg backdrop-blur-sm">
                                <span className="font-semibold">Staff Category:</span> {user.domain || 'Not Assigned'}
                            </div>
                        </div>
                        <p className="text-blue-100">View assigned complaints and update their status.</p>
                    </div>
                )}

                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl lg:text-3xl font-bold text-slate-800 dark:text-white">Dashboard Overview</h2>
                    {user.role !== 'Staff' && (
                        <button
                            onClick={() => navigate('/complaints/new')}
                            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition shadow-sm font-medium"
                        >
                            + File Complaint
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                    <StatsCard title="Total Complaints" value={stats.total} />
                    <StatsCard title="Active Issues" value={stats.active} />
                    <StatsCard title="Pending" value={stats.pending} />
                    <StatsCard title="Resolved" value={stats.resolved} />
                    
                    {user.role === 'Admin' && (
                        <div className="col-span-1 border border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800 p-6 rounded-2xl shadow-md transition duration-300">
                            <h3 className="text-red-600 dark:text-red-400 font-medium">SLA Breaches</h3>
                            <p className="text-3xl font-bold mt-2 text-red-700 dark:text-red-300">{stats.slaBreaches || 0}</p>
                        </div>
                    )}
                    
                    {user.role === 'Staff' && (
                        <div className="col-span-1 border border-orange-200 bg-orange-50 dark:bg-orange-900/20 dark:border-orange-800 p-6 rounded-2xl shadow-md transition duration-300">
                            <h3 className="text-orange-600 dark:text-orange-400 font-medium">SLA Warnings</h3>
                            <p className="text-3xl font-bold mt-2 text-orange-700 dark:text-orange-300">{stats.nearDeadline || 0}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
