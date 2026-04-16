import { useState } from 'react';
import { Menu, User, Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { useNavigate } from 'react-router-dom';

export default function Navbar({ onMenuClick }) {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const { user, logout } = useAuth();
    const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotification();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    }

    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
        if (isDropdownOpen && unreadCount > 0) {
           // Optionally mark all as read automatically on close, or require explicit click
        }
    };

    return (
        <div className="h-16 bg-white dark:bg-slate-900 dark:border-b dark:border-slate-800 shadow flex justify-between items-center px-6 lg:px-10 lg:ml-72 transition-all duration-300 relative">
            <div className="flex items-center gap-4">
                <button onClick={onMenuClick} className="lg:hidden text-slate-600 dark:text-slate-200 hover:text-indigo-600">
                    <Menu size={24} />
                </button>
                <h2 className="font-semibold text-slate-800 dark:text-white hidden sm:block">Welcome, {user?.name || 'User'}</h2>
            </div>

            <div className="flex items-center gap-4">
                {/* Notifications Bell */}
                <div className="relative">
                    <button
                        onClick={toggleDropdown}
                        className="p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition relative"
                    >
                        <Bell size={20} />
                        {unreadCount > 0 && (
                            <span className="absolute top-0 right-0 inline-flex items-center justify-center w-5 h-5 text-[10px] font-bold text-white bg-red-500 rounded-full border-2 border-white dark:border-slate-900 animate-pulse">
                                {unreadCount}
                            </span>
                        )}
                    </button>

                    {/* Dropdown Menu */}
                    {isDropdownOpen && (
                        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-100 dark:border-slate-700 z-50 overflow-hidden">
                            <div className="p-3 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900">
                                <h3 className="font-semibold text-slate-800 dark:text-white">Notifications</h3>
                                {unreadCount > 0 && (
                                    <button onClick={markAllAsRead} className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline">
                                        Mark all read
                                    </button>
                                )}
                            </div>
                            <div className="max-h-96 overflow-y-auto">
                                {notifications.length === 0 ? (
                                    <div className="p-4 text-center text-sm text-slate-500 dark:text-slate-400">
                                        No new notifications
                                    </div>
                                ) : (
                                    notifications.map(notif => (
                                        <div 
                                            key={notif.id} 
                                            className={`p-4 border-b border-slate-50 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition cursor-pointer ${!notif.isRead ? 'bg-indigo-50/50 dark:bg-indigo-900/10' : ''}`}
                                            onClick={() => {
                                                if (!notif.isRead) markAsRead(notif.id);
                                            }}
                                        >
                                            <div className="flex gap-3">
                                                <div className="mt-1">
                                                    {notif.type === 'Breach' ? (
                                                        <span className="w-2 h-2 rounded-full bg-red-500 block"></span>
                                                    ) : (
                                                        <span className="w-2 h-2 rounded-full bg-orange-500 block"></span>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className={`text-sm ${!notif.isRead ? 'font-semibold text-slate-800 dark:text-white' : 'text-slate-600 dark:text-slate-300'}`}>
                                                        {notif.message}
                                                    </p>
                                                    <p className="text-xs text-slate-400 mt-1">
                                                        {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>
                <span className="bg-indigo-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                    {user?.role || 'Guest'}
                </span>
                <button
                    onClick={handleLogout}
                    className="text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-500 transition text-sm font-medium"
                >
                    Logout
                </button>
            </div>
        </div>
    );
}
