import React, { useEffect, useState } from 'react';
import { getEmployees } from '../services/mockService';
import { Employee, NationalityType, Page, Permission } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { hasPermission } from '../utils/rbac';
import { UserPlusIcon, PencilSquareIcon, ArrowPathIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

interface EmployeesProps {
  onNavigate: (page: Page) => void;
  onEdit?: (id: string) => void;
}

export const Employees: React.FC<EmployeesProps> = ({ onNavigate, onEdit }) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { t } = useLanguage();
  const { currentUser } = useAuth();
  // Permission checks
  const canAdd = hasPermission(currentUser?.permissions, Permission.MANAGE_ALL_EMPLOYEES);
  const canEditAll = hasPermission(currentUser?.permissions, Permission.MANAGE_ALL_EMPLOYEES);
  const canEditDept = hasPermission(currentUser?.permissions, Permission.MANAGE_DEPT_EMPLOYEES);

  // Fetch on Mount: "Database-First"
  useEffect(() => {
    const fetchList = async () => {
      try {
        setLoading(true);
        const data = await getEmployees();
        setEmployees(data);
      } catch (error) {
        console.error("Failed to fetch employees", error);
      } finally {
        setLoading(false);
      }
    };
    fetchList();
  }, []);

  const getNationalityLabel = (nationality: string) => {
    if (nationality === NationalityType.SAUDI || nationality === 'Saudi Arabia' || nationality === 'المملكة العربية السعودية') return t('nationality_saudi');
    if (nationality === NationalityType.NON_SAUDI || nationality === 'Non-Saudi') return t('nationality_non_saudi');

    // Exact Country Matches
    if (nationality === 'Egypt') return t('country_egypt');
    if (nationality === 'Jordan') return t('country_jordan');
    if (nationality === 'India') return t('country_india');
    if (nationality === 'Pakistan') return t('country_pakistan');
    if (nationality === 'Bangladesh') return t('country_bangladesh');
    if (nationality === 'Philippines') return t('country_philippines');
    if (nationality === 'Yemen') return t('country_yemen');
    if (nationality === 'Lebanon') return t('country_lebanon');
    if (nationality === 'Syria') return t('country_syria');
    if (nationality === 'Sudan') return t('country_sudan');
    if (nationality === 'United States') return t('country_us');
    if (nationality === 'United Kingdom') return t('country_uk');

    return nationality;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="w-full md:w-auto">
          <h2 className="text-3xl font-bold text-black dark:text-white transition-colors">{t('employee_directory')}</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm">{t('manage_files')}</p>
        </div>
        {canAdd && (
          <button
            onClick={() => onNavigate(Page.ADD_EMPLOYEE)}
            className="flex items-center space-x-2 rtl:space-x-reverse px-4 py-2 bg-emerald-600 rounded-lg text-sm font-medium text-white hover:bg-emerald-700 shadow-sm transition-colors"
          >
            <UserPlusIcon className="w-5 h-5" />
            <span>{t('new_employee')}</span>
          </button>
        )}
      </div>

      <div className="bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 rounded-xl overflow-x-auto transition-colors">
        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center text-slate-500 dark:text-slate-400">
            <ArrowPathIcon className="w-8 h-8 animate-spin mb-2" />
            <p>{t('msg_loading_data')}</p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
            <thead className="bg-slate-50 dark:bg-slate-700/50">
              <tr>
                <th scope="col" className="px-6 py-3 text-start text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">{t('col_employee')}</th>
                <th scope="col" className="px-6 py-3 text-start text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">{t('col_dept')}</th>
                <th scope="col" className="px-6 py-3 text-start text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">{t('col_nationality')}</th>
                <th scope="col" className="px-6 py-3 text-start text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">{t('col_position')}</th>
                <th scope="col" className="px-6 py-3 text-start text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">{t('col_status')}</th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Edit</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
              {employees.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500 dark:text-slate-400 italic">
                    {t('no_employees_found')}
                  </td>
                </tr>
              ) : (
                employees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {emp.avatarUrl ? (
                            <img className="h-10 w-10 rounded-full object-cover" src={emp.avatarUrl} alt="" />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-slate-200 dark:bg-slate-600 flex items-center justify-center text-slate-500 dark:text-slate-200 font-bold">
                              {emp.fullName.charAt(0)}
                            </div>
                          )}
                        </div>
                        <div className="ml-4 rtl:ml-0 rtl:mr-4">
                          <div className="text-sm font-medium text-black dark:text-white">{emp.fullName}</div>
                          <div className="text-sm text-slate-500 dark:text-slate-400">{emp.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-black dark:text-white">{emp.department}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">{t('joined')} {new Date(emp.joinDate).toLocaleDateString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${emp.nationality === NationalityType.SAUDI
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                        : 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300'
                        }`}>
                        {getNationalityLabel(emp.nationality)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-300">
                      {emp.position}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300">
                        {t('status_active')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-end text-sm font-medium">
                      <div className="flex justify-end space-x-2 rtl:space-x-reverse">
                        {/* Permissions Button: Only Admins/Managers */}
                        {canEditAll && (
                          <button
                            onClick={() => onNavigate(Page.PERMISSIONS)}
                            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                            title={t('permissions')}
                          >
                            <ShieldCheckIcon className="w-5 h-5" />
                          </button>
                        )}

                        {/* Edit Button: Admins OR Dept Managers (if in same dept? - logical simplification: if they have edit rights) */}
                        {(canEditAll || canEditDept) && (
                          <button
                            onClick={() => onEdit && onEdit(emp.id)}
                            className="text-emerald-600 hover:text-emerald-900 dark:text-emerald-400 dark:hover:text-emerald-300"
                            title={t('edit')}
                          >
                            <PencilSquareIcon className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div >
  );
};