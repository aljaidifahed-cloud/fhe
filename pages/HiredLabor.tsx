import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useNotifications } from '../contexts/NotificationsContext';
import { HiredWorker } from '../types';
import { getHiredWorkers, addHiredWorker } from '../services/mockService';
import {
    UserPlusIcon,
    BriefcaseIcon,
    ExclamationTriangleIcon,
    MagnifyingGlassIcon,
    TrashIcon
} from '@heroicons/react/24/outline';

const Modal: React.FC<{ isOpen: boolean; onClose: () => void; title: string, children: React.ReactNode }> = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-lg overflow-hidden transform transition-all animate-scaleIn">
                <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                    <h3 className="text-xl font-bold text-black dark:text-white">{title}</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                        ✕
                    </button>
                </div>
                <div className="p-6">
                    {children}
                </div>
            </div>
        </div>
    );
};

interface HiredLaborProps {
    onNavigate: (page: any) => void;
}

export const HiredLabor: React.FC<HiredLaborProps> = ({ onNavigate }) => {
    const { t, language } = useLanguage();
    const { addNotification } = useNotifications();

    const [workers, setWorkers] = useState<HiredWorker[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        fullName: '',
        residencyNumber: '',
        employerName: '',
        jobTitle: ''
    });

    const fetchData = async () => {
        setLoading(true);
        try {
            const data = await getHiredWorkers();
            setWorkers(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await addHiredWorker(formData);
            addNotification({
                title: t('notifications'),
                message: `${t('add_worker')} - ${formData.fullName}`,
                type: 'success'
            });
            setIsModalOpen(false);
            setFormData({ fullName: '', residencyNumber: '', employerName: '', jobTitle: '' });
            fetchData();
        } catch (error) {
            console.error(error);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="space-y-6 animate-fadeIn pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-black dark:text-white">{t('hired_labor')}</h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">{t('warnings_subtitle')}</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center space-x-2 rtl:space-x-reverse px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors shadow-sm"
                >
                    <UserPlusIcon className="w-5 h-5" />
                    <span>{t('add_worker')}</span>
                </button>
            </div>

            {/* List */}
            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-500"></div>
                </div>
            ) : workers.length === 0 ? (
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 p-12 text-center">
                    <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                        <BriefcaseIcon className="w-8 h-8 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-bold text-black dark:text-white mb-2">{t('no_hired_workers')}</h3>
                    <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                        Click "Add Worker" to register external labor.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {workers.map(worker => (
                        <div key={worker.id} className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                                    <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                                        {worker.fullName.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-black dark:text-white">{worker.fullName}</h4>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">{worker.jobTitle}</p>
                                    </div>
                                </div>
                                <span className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-1 rounded">
                                    {worker.residencyNumber}
                                </span>
                            </div>
                            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700 text-sm">
                                <p className="text-slate-500 dark:text-slate-400 flex justify-between">
                                    <span>{t('external_employer')}:</span>
                                    <span className="font-medium text-black dark:text-white">{worker.employerName}</span>
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add Modal */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={t('add_worker')}>
                <form onSubmit={handleSubmit} className="space-y-4">

                    {/* WARNING ALERT */}
                    <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 p-4 rounded-r-lg flex items-start space-x-3 rtl:space-x-reverse">
                        <ExclamationTriangleIcon className="w-6 h-6 text-amber-500 flex-shrink-0" />
                        <div>
                            <p className="text-sm text-amber-800 dark:text-amber-200 font-bold">
                                {t('warning')}
                            </p>
                            <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                                {t('hired_labor_warning')}
                            </p>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('worker_name')}</label>
                        <input
                            type="text"
                            name="fullName"
                            required
                            value={formData.fullName}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-black dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('residency_number')}</label>
                        <input
                            type="text"
                            name="residencyNumber"
                            required
                            value={formData.residencyNumber}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-black dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('external_employer')}</label>
                        <input
                            type="text"
                            name="employerName"
                            required
                            value={formData.employerName}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-black dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('worker_job_title')}</label>
                        <input
                            type="text"
                            name="jobTitle"
                            required
                            value={formData.jobTitle}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-black dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                        />
                    </div>

                    <div className="flex justify-end space-x-3 rtl:space-x-reverse pt-4">
                        <button
                            type="button"
                            onClick={() => setIsModalOpen(false)}
                            className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
                        >
                            {t('cancel')}
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-sm disabled:opacity-50"
                        >
                            {submitting ? t('saving') : t('save')}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};
