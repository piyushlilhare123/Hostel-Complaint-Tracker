import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { playBeep, playLongBeep } from '../utils/audio';

const NotificationContext = createContext();

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [unreadAssignCount, setUnreadAssignCount] = useState(0);
    const { token, user } = useAuth();

    useEffect(() => {
        if (!token || !user) {
            setNotifications([]);
            setUnreadCount(0);
            return;
        }

        const fetchNotifications = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/notifications', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.ok) {
                    const data = await response.json();
                    
                    const newUnreadCount = data.filter(n => !n.isRead).length;
                    const newAssignCount = data.filter(n => !n.isRead && (n.type === 'Assignment' || n.type === 'NewComplaint')).length;
                    
                    let playedLong = false;
                    setUnreadAssignCount(prev => {
                        if (newAssignCount > prev && prev !== 0) {
                            playLongBeep();
                            playedLong = true;
                        }
                        return newAssignCount;
                    });

                    setUnreadCount(prev => {
                        if (newUnreadCount > prev && prev !== 0 && !playedLong) {
                            playBeep(); // Only regular beep if we didn't just long beep
                        }
                        return newUnreadCount;
                    });
                    
                    setNotifications(data);
                }
            } catch (error) {
                console.error('Error fetching notifications:', error);
            }
        };

        fetchNotifications();
        const interval = setInterval(fetchNotifications, 3000); // Poll every 3s
        return () => clearInterval(interval);
    }, [token, user]);

    const markAsRead = async (id) => {
        try {
            await fetch(`http://localhost:5000/api/notifications/${id}/read`, {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Error marking read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await fetch('http://localhost:5000/api/notifications/read-all', {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setNotifications(notifications.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error('Error marking all read:', error);
        }
    };

    return (
        <NotificationContext.Provider value={{ notifications, unreadCount, markAsRead, markAllAsRead }}>
            {children}
        </NotificationContext.Provider>
    );
};
