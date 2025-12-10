import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import {
    ArrowDownTrayIcon,
    DocumentTextIcon,
    XMarkIcon,
    ArrowPathIcon,
    ChartBarIcon,
    TableCellsIcon
} from '@heroicons/react/24/outline';
import { useLanguage } from '../contexts/LanguageContext';

interface TimesheetEntry {
    id: number;
    empId: string;
    name: string;
    date: string;
    timeIn: string;
    timeOut: string;
    officialHours: string;
    overtimeHours: string;
    status: string;
}

export const TimesheetUploader: React.FC = () => {
    const { t } = useLanguage();
    const [selectedEmployee, setSelectedEmployee] = useState<TimesheetEntry | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Mock System Data
    const data: TimesheetEntry[] = [
        { id: 1, empId: '10001', name: 'Fahad Aljaidi', date: '2023-10-01', timeIn: '08:00', timeOut: '17:00', officialHours: '8', overtimeHours: '1', status: 'status_approved' },
        { id: 2, empId: '10004', name: 'Mona Al-Harbi', date: '2023-10-01', timeIn: '08:15', timeOut: '16:15', officialHours: '7', overtimeHours: '0', status: 'status_pending' },
        { id: 3, empId: '10007', name: 'Hail (IT)', date: '2023-10-01', timeIn: '09:00', timeOut: '19:00', officialHours: '8', overtimeHours: '2', status: 'status_approved' },
        { id: 4, empId: '10001', name: 'Fahad Aljaidi', date: '2023-10-02', timeIn: '08:00', timeOut: '18:30', officialHours: '8', overtimeHours: '2.5', status: 'status_approved' },
        { id: 5, empId: '10004', name: 'Mona Al-Harbi', date: '2023-10-02', timeIn: '08:00', timeOut: '16:00', officialHours: '8', overtimeHours: '0', status: 'status_approved' },
    ];

    const handleDownload = () => {
        setIsGenerating(true);
        setTimeout(() => {
            setIsGenerating(false);
            setIsModalOpen(true);
        }, 1500);
    };

    const handleDownloadSchedule = () => {
        if (!selectedEmployee) return;
        alert(`${t('download_schedule')} - ${selectedEmployee.name}`);
    };

    const closeModal = () => setSelectedEmployee(null);

    return (
        <>
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 mb-6 gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-black dark:text-white flex items-center gap-2">
                        <ChartBarIcon className="w-8 h-8 text-indigo-500" />
                        {t('monthly_prep_report')}
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                        {t('official_hours_desc')}
                    </p>
                </div>
                <button
                    onClick={handleDownload}
                    disabled={isGenerating}
                    className="flex items-center space-x-2 rtl:space-x-reverse px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {isGenerating ? (
                        <>
                            <ArrowPathIcon className="w-5 h-5 animate-spin" />
                            <span>{t('generating') || 'Generating'}...</span>
                        </>
                    ) : (
                        <>
                            <ArrowDownTrayIcon className="w-5 h-5" />
                            <span>{t('download_report')}</span>
                        </>
                    )}
                </button>
            </div>

            {/* PREVIEW TABLE */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden mb-6">
                <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
                    <h3 className="font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                        <TableCellsIcon className="w-5 h-5 text-slate-400" />
                        {t('preview_gen_data')}
                    </h3>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left rtl:text-right border-collapse">
                        <thead>
                            <tr className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs uppercase tracking-wider">
                                <th className="p-3 font-semibold border-b dark:border-slate-600">{t('col_employee')}</th>
                                <th className="p-3 font-semibold border-b dark:border-slate-600">{t('col_date')}</th>
                                <th className="p-3 font-semibold border-b dark:border-slate-600">{t('col_time_in_out')}</th>
                                <th className="p-3 font-semibold border-b dark:border-slate-600 text-center">{t('col_official_work')}</th>
                                <th className="p-3 font-semibold border-b dark:border-slate-600 text-center">{t('col_overtime')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                            {data.map((row, idx) => (
                                <tr
                                    key={idx}
                                    onClick={() => setSelectedEmployee(row)}
                                    className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors text-sm cursor-pointer"
                                >
                                    <td className="p-3">
                                        <div className="font-medium text-slate-800 dark:text-white">{row.name}</div>
                                        <div className="text-xs text-slate-500">ID: {row.empId}</div>
                                    </td>
                                    <td className="p-3 text-slate-600 dark:text-slate-400 font-mono">
                                        {row.date}
                                    </td>
                                    <td className="p-3">
                                        <div className="flex flex-col text-xs font-mono">
                                            <span className="text-emerald-600 dark:text-emerald-400">IN: {row.timeIn}</span>
                                            <span className="text-red-500 dark:text-red-400">OUT: {row.timeOut}</span>
                                        </div>
                                    </td>
                                    <td className="p-3 text-center">
                                        <span className="inline-block px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded text-slate-700 dark:text-slate-300 font-mono text-xs">
                                            {row.officialHours}{t('suffix_hours')}
                                        </span>
                                    </td>
                                    <td className="p-3 text-center">
                                        <span className={`inline-block px-2 py-1 rounded font-mono text-xs ${parseFloat(row.overtimeHours) > 0
                                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 font-bold'
                                            : 'text-slate-400'
                                            }`}>
                                            {parseFloat(row.overtimeHours) > 0 ? `+${row.overtimeHours}${t('suffix_hours')}` : '-'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* DOWNLOAD SUCCESS MODAL - truncated in replacement but kept via context matches */}
            {isModalOpen && createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-2xl shadow-2xl p-6 text-center border border-slate-200 dark:border-slate-700">
                        <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <DocumentTextIcon className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">{t('monthly_report_downloaded') || "Report Downloaded!"}</h3>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
                            {t('msg_report_download_desc')}
                        </p>
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="w-full py-2.5 bg-slate-900 dark:bg-slate-700 text-white rounded-lg font-medium hover:bg-slate-800 dark:hover:bg-slate-600 transition-colors"
                        >
                            {t('close_modal') || "Close"}
                        </button>
                    </div>
                </div>,
                document.body
            )}

            {/* Employee Details Modal - Rendered via Portal */}
            {selectedEmployee && createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn" onClick={closeModal}>
                    <div
                        className="bg-[#1e293b] w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-700 overflow-hidden animate-scaleIn relative"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="p-6 border-b border-slate-700 flex justify-between items-start">
                            <div className="flex items-center gap-4">
                                <div className="h-16 w-16 rounded-full bg-slate-700 flex items-center justify-center text-2xl font-bold text-white border-4 border-[#1e293b] shadow-lg">
                                    {selectedEmployee.name.charAt(0)}
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-white">{selectedEmployee.name}</h2>
                                    <p className="text-emerald-400 font-mono">{t('employee_id')}: #{selectedEmployee.empId}</p>
                                </div>
                            </div>
                            <button onClick={closeModal} className="text-slate-400 hover:text-white transition-colors bg-slate-800 p-2 rounded-lg hover:bg-slate-700">
                                <XMarkIcon className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <h3 className="text-lg font-semibold text-slate-300 border-b border-slate-700 pb-2">{t('job_details')}</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-[#0f172a] p-4 rounded-xl border border-slate-700/50">
                                        <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">{t('lbl_department')}</p>
                                        <p className="font-medium text-white">{t('dept_engineering')}</p>
                                    </div>
                                    <div className="bg-[#0f172a] p-4 rounded-xl border border-slate-700/50">
                                        <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">{t('role') || "Role"}</p>
                                        <p className="font-medium text-white">{t('role_senior_dev')}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <h3 className="text-lg font-semibold text-slate-300 border-b border-slate-700 pb-2">{t('monthly_stats')}</h3>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center p-3 bg-[#0f172a] rounded-lg">
                                        <span className="text-slate-400">{t('total_working_hours')}</span>
                                        <span className="font-bold text-white font-mono">{selectedEmployee.officialHours}{t('suffix_hours')}</span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-[#0f172a] rounded-lg border border-emerald-900/30">
                                        <span className="text-slate-400">{t('total_overtime')}</span>
                                        <span className="font-bold text-emerald-400 font-mono">{selectedEmployee.overtimeHours}{t('suffix_hours')}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 bg-[#0f172a] border-t border-slate-700 flex justify-end gap-3">
                            <button onClick={closeModal} className="px-5 py-2.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors font-medium">
                                {t('close_modal') || "Close"}
                            </button>
                            <button
                                onClick={handleDownloadSchedule}
                                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg shadow-lg shadow-emerald-900/20 transition-all font-medium flex items-center gap-2"
                            >
                                <ArrowDownTrayIcon className="w-5 h-5" />
                                {t('download_schedule')}
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </>
    );
};
