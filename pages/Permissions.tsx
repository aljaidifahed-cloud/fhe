import React, { useEffect, useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { getEmployees, updateEmployee } from '../services/mockService';
import { Employee, Page } from '../types';
import { ShieldCheckIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';

export const Permissions: React.FC = () => {
    const { t } = useLanguage();
    const { currentUser } = useAuth();
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(true);
    const [savingId, setSavingId] = useState<string | null>(null);

    // Filter out pages that don't need permission control or are accessible to everyone/nobody
    const PERMISSION_PAGES = Object.values(Page).filter(p =>
        p !== Page.ADD_EMPLOYEE &&
        p !== Page.EDIT_EMPLOYEE &&
        p !== Page.PROFILE
    );

    useEffect(() => {
        loadEmployees();
    }, []);

    const loadEmployees = () => {
        setLoading(true);
        getEmployees().then(data => {
            setEmployees(data);
            setLoading(false);
        });
    };

    const handleTogglePermission = async (id: string, page: Page, currentValue: boolean) => {
        // Prevent editing self permissions if you are the current user (optional safety, but maybe allowed for Admin)
        // Prevent editing Admin (Fahad) permissions to avoid lockout
        if (id === '10001') {
            alert(t('cannot_edit_admin_permissions') || "Cannot modify Super Admin permissions.");
            return;
        }

        setSavingId(id);
        const employee = employees.find(e => e.id === id);
        if (!employee) return;

        const currentPermissions = employee.permissions || {};
        const updatedPermissions = {
            ...currentPermissions,
            [page]: !currentValue
        };

        try {
            // Optimistic update
            setEmployees(prev => prev.map(emp =>
                emp.id === id ? { ...emp, permissions: updatedPermissions } : emp
            ));

            await updateEmployee(id, { permissions: updatedPermissions });
        } catch (error) {
            console.error("Failed to update permissions", error);
            loadEmployees(); // Revert on failure
        } finally {
            setSavingId(null);
        }
    };

    const handleResult = (success: boolean) => {
        // Silent toast or just optimistic UI
    };

    if (loading) return (
        <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
        </div>
    );

    return (
        <div className="space-y-6 animate-fadeIn p-4 md:p-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-black dark:text-white flex items-center gap-2">
                        <ShieldCheckIcon className="w-8 h-8 text-emerald-600" />
                        {t('permissions')}
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">{t('permissions_subtitle') || "Manage user access and roles"}</p>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left rtl:text-right">
                        <thead className="bg-slate-50 dark:bg-slate-700/50">
                            <tr>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider sticky left-0 bg-slate-50 dark:bg-slate-800 z-10">
                                    {t('employee')}
                                </th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                    {t('position')}
                                </th>
                                {PERMISSION_PAGES.map(page => (
                                    <th key={page} className="px-4 py-4 text-center text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">
                                        {t(page) || page}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                            {employees.map((emp) => {
                                const perms = emp.permissions || {};
                                const isSuperAdmin = emp.id === '10001';

                                return (
                                    <tr key={emp.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap sticky left-0 bg-white dark:bg-slate-800 z-10">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center overflow-hidden">
                                                    {emp.avatarUrl ? (
                                                        <img src={emp.avatarUrl} alt={emp.fullName} className="h-full w-full object-cover" />
                                                    ) : (
                                                        <span className="text-sm font-bold text-slate-500">{emp.fullName.charAt(0)}</span>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-black dark:text-white flex items-center gap-1">
                                                        {emp.fullName}
                                                        {isSuperAdmin && <ShieldCheckIcon className="w-3 h-3 text-emerald-500" title="Super Admin" />}
                                                    </p>
                                                    <p className="text-xs text-slate-500">{emp.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-300">
                                            {emp.position}
                                        </td>

                                        {PERMISSION_PAGES.map(page => {
                                            const hasAccess = isSuperAdmin ? true : !!perms[page];
                                            return (
                                                <td key={page} className="px-4 py-4 text-center whitespace-nowrap">
                                                    <label className={`relative inline-flex items-center cursor-pointer ${isSuperAdmin ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                                        <input
                                                            type="checkbox"
                                                            className="sr-only peer"
                                                            checked={hasAccess}
                                                            onChange={() => !isSuperAdmin && handleTogglePermission(emp.id, page, hasAccess)}
                                                            disabled={savingId === emp.id || isSuperAdmin}
                                                        />
                                                        <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-emerald-300 dark:peer-focus:ring-emerald-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-emerald-600"></div>
                                                    </label>
                                                </td>
                                            );
                                        })}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
