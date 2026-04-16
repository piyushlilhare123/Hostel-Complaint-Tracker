import { LayoutDashboard, Users, FileText, X, PlusCircle } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({ isOpen, onClose }) {
    const location = useLocation();
    const { user } = useAuth();

    const isActive = (path) => location.pathname === path
        ? "bg-indigo-600 border-l-4 border-indigo-300 dark:border-indigo-400"
        : "hover:bg-slate-800 dark:hover:bg-slate-800 border-l-4 border-transparent";

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-20 lg:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <div className={`
        fixed top-0 left-0 h-screen bg-slate-900 dark:bg-slate-950 dark:border-r dark:border-slate-800 text-white p-6 z-30 transition-transform duration-300
        w-72
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-xl font-bold">CMS</h1>
                    <button onClick={onClose} className="lg:hidden text-slate-400 hover:text-white">
                        <X size={24} />
                    </button>
                </div>

                <ul className="space-y-4">
                    <Link to="/dashboard">
                        <li className={`p-3 rounded-lg mb-4 flex items-center gap-3 transition ${isActive('/dashboard')}`}>
                            <LayoutDashboard size={20} />
                            <span>Dashboard</span>
                        </li>
                    </Link>

                    {user?.role !== 'Staff' && (
                        <Link to="/complaints/new">
                            <li className={`p-3 rounded-lg mb-4 flex items-center gap-3 transition ${isActive('/complaints/new')}`}>
                                <PlusCircle size={20} />
                                <span>File Complaint</span>
                            </li>
                        </Link>
                    )}

                    <Link to="/complaints">
                        <li className={`p-3 rounded-lg mb-4 flex items-center gap-3 transition ${isActive('/complaints')}`}>
                            <FileText size={20} />
                            <span>
                                {user?.role === 'Student' ? 'My Complaints' : 'All Complaints'}
                            </span>
                        </li>
                    </Link>

                    {user?.role === 'Admin' && (
                        <>
                            <Link to="/users">
                                <li className={`p-3 rounded-lg mb-4 flex items-center gap-3 transition ${isActive('/users')}`}>
                                    <Users size={20} />
                                    <span>Manage Users</span>
                                </li>
                            </Link>
                            <Link to="/admin/reports">
                                <li className={`p-3 rounded-lg mb-4 flex items-center gap-3 transition ${isActive('/admin/reports')}`}>
                                    <FileText size={20} />
                                    <span>Staff Performance</span>
                                </li>
                            </Link>
                        </>
                    )}

                    <Link to="/profile">
                        <li className={`p-3 rounded-lg mb-4 flex items-center gap-3 transition ${isActive('/profile')}`}>
                            <Users size={20} />
                            <span>My Profile</span>
                        </li>
                    </Link>
                </ul>
            </div>
        </>
    );
}
