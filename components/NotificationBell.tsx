import React, { useState, useRef, useEffect } from 'react';
import { BellIcon, CheckCircleIcon, ExclamationCircleIcon, InformationCircleIcon, XMarkIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useNotifications } from '../contexts/NotificationsContext';
import { useLanguage } from '../contexts/LanguageContext';

export const NotificationBell: React.FC = () => {
    const { notifications, unreadCount, markAsRead, markAllAsRead, clearNotifications } = useNotifications();
    const { t } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const getIcon = (type: string) => {
        switch (type) {
            case 'success': return <CheckCircleIcon className="w-5 h-5 text-emerald-500" />;
            case 'warning': return <ExclamationCircleIcon className="w-5 h-5 text-amber-500" />;
            case 'error': return <XMarkIcon className="w-5 h-5 text-red-500" />;
            default: return <InformationCircleIcon className="w-5 h-5 text-blue-500" />;
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
                <BellIcon className="w-6 h-6" />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white dark:ring-slate-900">
                        {unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 rtl:left-0 rtl:right-auto mt-2 w-80 md:w-96 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 z-50 animate-fadeIn overflow-hidden">
                    <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                        <h3 className="font-semibold text-black dark:text-white">{t('notifications')}</h3>
                        <div className="flex space-x-2 rtl:space-x-reverse text-xs">
                            {unreadCount > 0 && (
                                <button onClick={markAllAsRead} className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400">
                                    {t('mark_all_read')}
                                </button>
                            )}
                            <button onClick={clearNotifications} className="text-slate-400 hover:text-red-500" title={t('clear_all')}>
                                <TrashIcon className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center text-slate-500 dark:text-slate-400">
                                <BellIcon className="w-12 h-12 mx-auto mb-2 opacity-20" />
                                <p>{t('no_notifications')}</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-100 dark:divide-slate-700">
                                {notifications.map(notif => (
                                    <div
                                        key={notif.id}
                                        className={`p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer ${!notif.read ? 'bg-slate-50/50 dark:bg-slate-700/20' : ''}`}
                                        onClick={() => markAsRead(notif.id)}
                                    >
                                        <div className="flex items-start space-x-3 rtl:space-x-reverse">
                                            <div className="flex-shrink-0 mt-1">
                                                {getIcon(notif.type)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start">
                                                    <p className={`text-sm font-medium ${!notif.read ? 'text-black dark:text-white' : 'text-slate-600 dark:text-slate-300'}`}>
                                                        {t(notif.title as any) || notif.title}
                                                    </p>
                                                    <span className="text-xs text-slate-400 whitespace-nowrap ml-2 rtl:mr-2 rtl:ml-0">{t(notif.time as any)}</span>
                                                </div>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{t(notif.message as any)}</p>
                                            </div>
                                            {!notif.read && (
                                                <div className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0 mt-2"></div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
