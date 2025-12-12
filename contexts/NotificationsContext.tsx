import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { getWarnings } from '../services/mockService';
import { useLanguage } from './LanguageContext';

export interface Notification {
    id: string;
    title: string;
    message: string;
    time: string;
    type: 'info' | 'success' | 'warning' | 'error';
    read: boolean;
}

interface NotificationsContextType {
    notifications: Notification[];
    unreadCount: number;
    addNotification: (notification: Omit<Notification, 'id' | 'time' | 'read'>) => void;
    markAsRead: (id: string) => void;
    markAllAsRead: () => void;
    clearNotifications: () => void;
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

export const NotificationsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { currentUser } = useAuth();
    const { t } = useLanguage();
    const [notifications, setNotifications] = useState<Notification[]>([]);

    const unreadCount = notifications.filter(n => !n.read).length;

    const addNotification = (notif: Omit<Notification, 'id' | 'time' | 'read'>) => {
        const newNotif: Notification = {
            ...notif,
            id: Date.now().toString(),
            time: 'time_just_now',
            read: false,
        };
        setNotifications(prev => [newNotif, ...prev]);
    };

    // Poll for Warnings
    useEffect(() => {
        if (!currentUser) return;

        const checkWarnings = async () => {
            const warnings = await getWarnings();
            // Find warnings that are for me, unacknowledged, AND not already in my notification list
            // Just basic one-time notification generation based on warning existence
            const myUnacknowledged = warnings.filter(w => w.employeeId === currentUser.id && !w.acknowledged);

            myUnacknowledged.forEach(w => {
                const notifId = `warn-notif-${w.id}`;
                setNotifications(prev => {
                    if (prev.some(n => n.id === notifId)) return prev;
                    return [{
                        id: notifId,
                        title: t('warning_notification_title'),
                        message: t('warning_notification_body'),
                        time: w.date,
                        type: 'warning',
                        read: false,
                    }, ...prev];
                });
            });
        };

        const interval = setInterval(checkWarnings, 10000); // Check every 10s
        checkWarnings(); // Initial check

        return () => clearInterval(interval);
    }, [currentUser, t]);

    const markAsRead = (id: string) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    };

    const markAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    const clearNotifications = () => {
        setNotifications([]);
    };

    return (
        <NotificationsContext.Provider value={{ notifications, unreadCount, addNotification, markAsRead, markAllAsRead, clearNotifications }}>
            {children}
        </NotificationsContext.Provider>
    );
};

export const useNotifications = () => {
    const context = useContext(NotificationsContext);
    if (!context) {
        throw new Error('useNotifications must be used within a NotificationsProvider');
    }
    return context;
};
