import React, { useEffect, useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { TranslationKey } from '../utils/translations';
import { Employee, Warning, WarningType } from '../types';
import { getEmployees, getWarnings, addWarning, deleteWarning, updateWarning } from '../services/mockService';
import { PlusIcon, TrashIcon, XMarkIcon, ExclamationTriangleIcon, PencilSquareIcon } from '@heroicons/react/24/outline';

const LEVEL_COLORS = {
    High: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    Medium: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
    Low: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
};

export const WarningsCommitments: React.FC = () => {
    const { t } = useLanguage();
    const [warnings, setWarnings] = useState<Warning[]>([]);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(true);

    const [modalOpen, setModalOpen] = useState(false);
    const [newWarning, setNewWarning] = useState<Partial<Warning>>({
        type: WarningType.VERBAL,
        level: 'Low',
        status: 'Active',
        date: new Date().toISOString().split('T')[0]
    });

    const loadData = async () => {
        setLoading(true);
        const [empData, warnData] = await Promise.all([getEmployees(), getWarnings()]);
        setEmployees(empData);
        setWarnings(warnData);
        setLoading(false);
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newWarning.employeeId || !newWarning.description) return;

        if (newWarning.id) {
            await updateWarning(newWarning as Warning);
        } else {
            await addWarning(newWarning as Omit<Warning, 'id'>);
        }

        await loadData();
        setModalOpen(false);
        setNewWarning({
            type: WarningType.VERBAL,
            level: 'Low',
            status: 'Active',
            date: new Date().toISOString().split('T')[0]
        });
    };

    const handleEdit = (warning: Warning) => {
        setNewWarning(warning);
        setModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to delete this warning?")) {
            await deleteWarning(id);
            await loadData();
        }
    };

    const getEmployeeName = (id: string) => employees.find(e => e.id === id)?.fullName || 'Unknown';

    return (
        <div className="space-y-6 animate-fadeIn pb-10">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-black dark:text-white">{t('warnings_commitments')}</h2>
                    <p className="text-slate-500 text-sm">{t('warnings_subtitle')}</p>
                </div>
                <button
                    onClick={() => setModalOpen(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-red-600 rounded-lg text-sm font-medium text-white hover:bg-red-700 shadow-sm transition-colors"
                >
                    <PlusIcon className="w-5 h-5" />
                    <span>{t('issue_btn')}</span>
                </button>
            </div>

            {loading ? (
                <div className="text-center py-12 text-slate-500">Loading...</div>
            ) : warnings.length === 0 ? (
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-12 text-center">
                    <ExclamationTriangleIcon className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
                    <h3 className="text-lg font-medium text-slate-900 dark:text-white">{t('no_warnings_found')}</h3>
                    <p className="text-slate-500 text-sm mt-1">{t('warnings_compliant_msg')}</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {warnings.map(warning => (
                        <div key={warning.id} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4 transition-all hover:shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex items-start space-x-4">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${warning.type === WarningType.TERMINATION_NOTICE ? 'bg-red-100 text-red-600' : 'bg-orange-50 text-orange-500'}`}>
                                    <ExclamationTriangleIcon className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-900 dark:text-white">{getEmployeeName(warning.employeeId)}</h4>
                                    <div className="flex flex-wrap items-center gap-2 mt-1">
                                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${LEVEL_COLORS[warning.level]}`}>
                                            {warning.level} Level
                                        </span>
                                        <span className="text-xs text-slate-400">•</span>
                                        <span className="text-xs text-slate-500 dark:text-slate-400 capitalize">{warning.type.replace('_', ' ').toLowerCase()}</span>
                                        <span className="text-xs text-slate-400">•</span>
                                        <span className="text-xs text-slate-500 dark:text-slate-400">{warning.date}</span>
                                    </div>
                                    <p className="text-sm text-slate-600 dark:text-slate-300 mt-2 bg-slate-50 dark:bg-slate-900/50 p-2 rounded border border-slate-100 dark:border-slate-700/50">
                                        {warning.description}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-2 pl-14 md:pl-0">
                                <span className={`px-2 py-1 rounded text-xs font-bold border ${warning.status === 'Active' ? 'border-red-200 text-red-600 bg-red-50 dark:bg-red-900/20 dark:border-red-900/50' : 'border-slate-200 text-slate-500 bg-slate-50'}`}>
                                    {warning.status}
                                </span>
                                {warning.acknowledged && (
                                    <span className="px-2 py-1 rounded text-xs font-bold border border-emerald-200 text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:border-emerald-900/50">
                                        {t('acknowledged_status')}
                                    </span>
                                )}
                                <button
                                    onClick={() => handleEdit(warning)}
                                    className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                    title={t('edit_btn')}
                                >
                                    <PencilSquareIcon className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => handleDelete(warning.id)}
                                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                    title={t('delete_warning_tooltip')}
                                >
                                    <TrashIcon className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">{newWarning.id ? t('edit_warning_modal_title') : t('issue_warning_modal_title')}</h3>
                            <button onClick={() => {
                                setModalOpen(false);
                                setNewWarning({
                                    type: WarningType.VERBAL,
                                    level: 'Low',
                                    status: 'Active',
                                    date: new Date().toISOString().split('T')[0]
                                });
                            }} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                                <XMarkIcon className="w-6 h-6" />
                            </button>
                        </div>
                        <form onSubmit={handleSave} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('employee_label')}</label>
                                <select
                                    required
                                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-red-500 outline-none dark:text-white"
                                    value={newWarning.employeeId || ''}
                                    onChange={e => setNewWarning({ ...newWarning, employeeId: e.target.value })}
                                >
                                    <option value="">{t('select_employee_placeholder')}</option>
                                    {employees.map(emp => (
                                        <option key={emp.id} value={emp.id}>{emp.fullName}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('warning_type')}</label>
                                    <select
                                        className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-red-500 outline-none dark:text-white"
                                        value={newWarning.type}
                                        onChange={e => setNewWarning({ ...newWarning, type: e.target.value as WarningType })}
                                    >
                                        {Object.values(WarningType).map(warnType => {
                                            // My keys are: type_verbal, type_written, type_final, type_termination.
                                            // Enum: VERBAL, WRITTEN, FINAL, TERMINATION_NOTICE.
                                            const key = warnType === WarningType.TERMINATION_NOTICE ? 'type_termination' : `type_${warnType.toLowerCase()}`;
                                            return <option key={warnType} value={warnType}>{t(key as any)}</option>
                                        })}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('warning_level')}</label>
                                    <select
                                        className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-red-500 outline-none dark:text-white"
                                        value={newWarning.level}
                                        onChange={e => setNewWarning({ ...newWarning, level: e.target.value as any })}
                                    >
                                        <option value="Low">{t('level_low')}</option>
                                        <option value="Medium">{t('level_medium')}</option>
                                        <option value="High">{t('level_high')}</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('date_label')}</label>
                                <input
                                    type="date"
                                    required
                                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-red-500 outline-none dark:text-white"
                                    value={newWarning.date}
                                    onChange={e => setNewWarning({ ...newWarning, date: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('description_reason')}</label>
                                <textarea
                                    required
                                    rows={3}
                                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-red-500 outline-none dark:text-white resize-none"
                                    value={newWarning.description || ''}
                                    onChange={e => setNewWarning({ ...newWarning, description: e.target.value })}
                                    placeholder={t('description_placeholder')}
                                />
                            </div>

                            <div className="pt-4 flex space-x-3 rtl:space-x-reverse">
                                <button
                                    type="button"
                                    onClick={() => setModalOpen(false)}
                                    className="flex-1 py-2.5 px-4 border border-slate-300 dark:border-slate-600 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors font-medium"
                                >
                                    {t('cancel_btn')}
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-2.5 px-4 bg-red-600 text-white rounded-xl hover:bg-red-700 shadow-md shadow-red-500/20 transition-colors font-medium"
                                >
                                    {t('issue_btn')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
