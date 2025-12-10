import React, { useEffect, useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { Warning, WarningType } from '../types';
import { getWarnings, acknowledgeWarning } from '../services/mockService';
import { ExclamationTriangleIcon, CheckCircleIcon, ClockIcon } from '@heroicons/react/24/outline';

const LEVEL_COLORS = {
    High: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    Medium: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
    Low: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
};

export const MyWarnings: React.FC = () => {
    const { t } = useLanguage();
    const { currentUser } = useAuth();
    const [warnings, setWarnings] = useState<Warning[]>([]);
    const [loading, setLoading] = useState(true);

    const loadData = async () => {
        if (!currentUser) return;
        setLoading(true);
        const warnData = await getWarnings();
        // Filter for ME
        const myWarnings = warnData.filter(w => w.employeeId === currentUser.id);
        // Sort: Unacknowledged first, then by date desc
        myWarnings.sort((a, b) => {
            if (a.acknowledged === b.acknowledged) {
                return new Date(b.date).getTime() - new Date(a.date).getTime();
            }
            return a.acknowledged ? 1 : -1;
        });
        setWarnings(myWarnings);
        setLoading(false);
    };

    useEffect(() => {
        loadData();
    }, [currentUser]);

    const handleAcknowledge = async (id: string) => {
        if (confirm(t('confirm_acknowledge_warning') || "Are you sure you want to acknowledge this warning?")) {
            await acknowledgeWarning(id);
            await loadData();
        }
    };

    if (loading) return <div className="text-center py-12 text-slate-500">Loading...</div>;

    return (
        <div className="space-y-6 animate-fadeIn pb-10">
            <div>
                <h2 className="text-2xl font-bold text-black dark:text-white">{t('my_warnings')}</h2>
                <p className="text-slate-500 text-sm">{t('warnings_subtitle')}</p>
            </div>

            {warnings.length === 0 ? (
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-12 text-center">
                    <CheckCircleIcon className="w-12 h-12 mx-auto text-emerald-500 mb-4" />
                    <h3 className="text-lg font-medium text-slate-900 dark:text-white">{t('no_warnings_found')}</h3>
                    <p className="text-slate-500 text-sm mt-1">{t('warnings_compliant_msg')}</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {warnings.map(warning => (
                        <div key={warning.id} className={`bg-white dark:bg-slate-800 rounded-xl shadow-sm border p-6 flex flex-col md:flex-row gap-6 relative overflow-hidden ${warning.acknowledged ? 'border-emerald-200 dark:border-emerald-900/30' : 'border-red-200 dark:border-red-900/30 border-l-4 border-l-red-500'}`}>

                            {/* Icon */}
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${warning.type === WarningType.TERMINATION_NOTICE ? 'bg-red-100 text-red-600' : 'bg-orange-50 text-orange-500'}`}>
                                <ExclamationTriangleIcon className="w-6 h-6" />
                            </div>

                            {/* Content */}
                            <div className="flex-1">
                                <div className="flex flex-wrap items-start justify-between gap-4">
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${LEVEL_COLORS[warning.level]}`}>
                                                {warning.level}
                                            </span>
                                            <span className="text-xs text-slate-400">•</span>
                                            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                                                {t(`type_${warning.type.toLowerCase().replace('_', '_')}` as any)}
                                            </span>
                                        </div>
                                        <p className="text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg border border-slate-100 dark:border-slate-700/50">
                                            {warning.description}
                                        </p>
                                    </div>

                                    <div className="text-right shrink-0">
                                        <div className="flex items-center gap-1 text-xs text-slate-400 mb-1">
                                            <ClockIcon className="w-3 h-3" />
                                            <span>{warning.date}</span>
                                        </div>
                                        {warning.acknowledged ? (
                                            <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium text-sm bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1 rounded-full">
                                                <CheckCircleIcon className="w-4 h-4" />
                                                <span>{t('acknowledged_status')}</span>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => handleAcknowledge(warning.id)}
                                                className="flex items-center gap-2 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white px-4 py-2 rounded-lg shadow-md shadow-red-500/20 transition-all transform hover:scale-105"
                                            >
                                                <CheckCircleIcon className="w-4 h-4" />
                                                <span>{t('acknowledge_btn')}</span>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
