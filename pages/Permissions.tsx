import React, { useEffect, useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { getEmployees, updateEmployee } from '../services/mockService';
import { Employee, UserRole } from '../types';
import { ShieldCheckIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { getDefaultPermissions } from '../utils/rbac'; // Import RBAC Helper

export const Permissions: React.FC = () => {
    const { t } = useLanguage();
    const { currentUser } = useAuth();
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(true);
    const [savingId, setSavingId] = useState<string | null>(null);

    // Mappings for UI Labels
    const ROLE_OPTIONS = [
        { value: UserRole.MANAGER, label: t('role_manager') },
        { value: UserRole.ADMIN, label: t('role_admin') },
        { value: UserRole.DEPT_MANAGER, label: t('role_dept_manager') },
        { value: UserRole.EMPLOYEE, label: t('role_employee') },
    ];

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

    const handleRoleChange = async (id: string, newRole: UserRole) => {
        // Prevent editing Admin (Fahad) permissions to avoid lockout
        if (id === '10001') {
            alert(t('cannot_edit_admin_permissions'));
            return;
        }

        setSavingId(id);

        // 1. Calculate new permissions based on role
        const newPermissions = getDefaultPermissions(newRole);

        try {
            // Optimistic update
            setEmployees(prev => prev.map(emp =>
                emp.id === id ? { ...emp, role: newRole, permissions: newPermissions } : emp
            ));

            // 2. Persist both Role and Permissions
            await updateEmployee(id, {
                role: newRole,
                permissions: newPermissions
            });
        } catch (error) {
            console.error("Failed to update role", error);
            loadEmployees(); // Revert
        } finally {
            setSavingId(null);
        }
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
                    <p className="text-slate-500 dark:text-slate-400 mt-1">{t('permissions_subtitle')}</p>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-visible">
                <div className="overflow-x-auto overflow-y-visible min-h-[400px]">
                    <table className="w-full text-left rtl:text-right">
                        <thead className="bg-slate-50 dark:bg-slate-700/50">
                            <tr>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-1/3">
                                    {t('employee')}
                                </th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-1/3">
                                    {t('position')}
                                </th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-1/3 text-center">
                                    {t('select_role')}
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                            {employees.map((emp) => {
                                const isSuperAdmin = emp.id === '10001';
                                return (
                                    <tr key={emp.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
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
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            {/* Role Dropdown */}
                                            <div className="relative inline-block w-48">
                                                <select
                                                    value={emp.role || UserRole.EMPLOYEE}
                                                    onChange={(e) => handleRoleChange(emp.id, e.target.value as UserRole)}
                                                    disabled={savingId === emp.id || isSuperAdmin}
                                                    className={`
                                                        block w-full rounded-lg border-0 py-2 pl-3 pr-10 ring-1 ring-inset focus:ring-2 sm:text-sm sm:leading-6
                                                        ${isSuperAdmin
                                                            ? 'bg-slate-100 text-slate-400 ring-slate-200 dark:bg-slate-800 dark:text-slate-500 dark:ring-slate-700 cursor-not-allowed'
                                                            : 'bg-white text-slate-900 ring-slate-300 focus:ring-emerald-600 dark:bg-slate-900 dark:text-slate-200 dark:ring-slate-600'
                                                        }
                                                    `}
                                                >
                                                    {ROLE_OPTIONS.map(option => (
                                                        <option key={option.value} value={option.value}>
                                                            {option.label}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        </td>
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
