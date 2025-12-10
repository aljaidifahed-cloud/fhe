import React, { useEffect, useState } from 'react';
import { getEmployees, addDeduction, getDeductions, deleteDeduction } from '../services/mockService'; // Updated imports
import { Employee, PayrollRecord, PayrollDeduction } from '../types';
import { calculatePayroll, formatCurrency, generateWPSContent } from '../utils/payrollUtils';
import { useLanguage } from '../contexts/LanguageContext';
import { ArrowDownTrayIcon, PlusIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/outline';

// Extend PayrollRecord to include warnings for the UI
type PayrollRow = PayrollRecord & {
  warnings: string[];
};

export const Payroll: React.FC = () => {
  const [payrollRows, setPayrollRows] = useState<PayrollRow[]>([]);
  const [deductions, setDeductions] = useState<PayrollDeduction[]>([]);
  const { t, language } = useLanguage();

  // Modal State
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    employeeId: string;
    type: 'absence' | 'penalty';
    amount: string;
    reason: string;
  }>({
    isOpen: false,
    employeeId: '',
    type: 'absence',
    amount: '',
    reason: ''
  });

  const loadData = async () => {
    const [employees, allDeductions] = await Promise.all([getEmployees(), getDeductions()]);
    setDeductions(allDeductions);

    const rows = employees.map(emp => {
      // Pass persistent deductions to calculation
      const record = calculatePayroll(emp, allDeductions);
      const warnings: string[] = [];

      // Check for Warnings
      if (!emp.iban) warnings.push(t('missing_iban') || 'Missing IBAN');

      // Check ID Expiry
      if (emp.idExpiryDate) {
        const expiry = new Date(emp.idExpiryDate);
        const today = new Date();
        const diffDays = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays < 0) warnings.push(t('expired_id') || 'Expired ID');
        else if (diffDays < 30) warnings.push(t('expiring_soon') || 'Expiring Soon');
      }

      return { ...record, warnings };
    });
    setPayrollRows(rows);
  };

  useEffect(() => {
    loadData();
  }, [t]);

  const handleDownloadWPS = () => {
    // Generate simplified CSV for demo
    const header = "Employee ID,Name,Details,Net Salary\n";
    const body = payrollRows.map(r => `${r.employeeId},${r.employeeName},${r.isSaudi ? 'Saudi' : 'Non-Saudi'},${r.netSalary}`).join("\n");
    const blob = new Blob([header + body], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `WPS_SALARY_REPORT.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const currencyLocale = language === 'ar' ? 'ar-SA' : 'en-SA';

  const openDeductionModal = (employeeId: string, type: 'absence' | 'penalty') => {
    setModalState({
      isOpen: true,
      employeeId,
      type,
      amount: '',
      reason: ''
    });
  };

  const handleSaveDeduction = async (e: React.FormEvent) => {
    e.preventDefault();
    const { employeeId, type, amount, reason } = modalState;
    const amountNum = parseFloat(amount);

    if (isNaN(amountNum) || amountNum <= 0) return;

    // Persist new deduction
    await addDeduction({
      employeeId,
      type: type === 'absence' ? 'ABSENCE' : 'PENALTY',
      amount: amountNum,
      reason,
      month: new Date().toISOString().slice(0, 7), // Current month YYYY-MM
      createdAt: new Date().toISOString()
    });

    await loadData(); // Reload to reflect changes
    setModalState({ ...modalState, isOpen: false });
  };

  const removeDeduction = async (employeeId: string, type: 'absence' | 'penalty') => {
    if (!window.confirm("Are you sure you want to remove all deductions of this type for this employee?")) return;

    // Find all deductions of this type for this employee
    const targetType = type === 'absence' ? 'ABSENCE' : 'PENALTY';
    const toDelete = deductions.filter(d => d.employeeId === employeeId && d.type === targetType);

    // Delete them one by one (or bulk if API supported it, here sequential is fine for MVP)
    for (const d of toDelete) {
      await deleteDeduction(d.id);
    }
    await loadData();
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="w-full md:w-auto">
          <h2 className="text-2xl font-bold text-black dark:text-white">{t('payroll_processing')}</h2>
          <p className="text-slate-500 text-sm">{t('working_days')}</p>
        </div>
        <div className="flex space-x-3 rtl:space-x-reverse">
          <button
            onClick={handleDownloadWPS}
            className="flex items-center space-x-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm transition-all">
            <ArrowDownTrayIcon className="w-4 h-4" />
            <span>{t('download_wps')}</span>
          </button>
          <button className="px-4 py-2 bg-emerald-600 rounded-lg text-sm font-medium text-white hover:bg-emerald-700 shadow-sm transition-colors">
            {t('approve_pay')}
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 transition-colors">
          <p className="text-xs text-slate-500 uppercase font-semibold">{t('total_net')}</p>
          <p className="text-2xl font-bold text-black dark:text-white mt-1">{formatCurrency(payrollRows.reduce((sum, p) => sum + p.netSalary, 0), currencyLocale)}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 transition-colors">
          <p className="text-xs text-slate-500 uppercase font-semibold">{t('total_gosi_employer')}</p>
          <p className="text-2xl font-bold text-slate-800 dark:text-slate-200 mt-1">{formatCurrency(payrollRows.reduce((sum, p) => sum + p.gosiDeductionEmployer, 0), currencyLocale)}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 transition-colors">
          <p className="text-xs text-slate-500 uppercase font-semibold">{t('total_gosi_emp')}</p>
          <p className="text-2xl font-bold text-slate-800 dark:text-slate-200 mt-1">{formatCurrency(payrollRows.reduce((sum, p) => sum + p.gosiDeductionEmployee, 0), currencyLocale)}</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 rounded-xl overflow-x-auto transition-colors">
        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
          <thead className="bg-slate-50 dark:bg-slate-900/50">
            <tr>
              <th className="px-6 py-3 text-start text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">{t('col_employee')}</th>
              <th className="px-6 py-3 text-start text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">{t('col_basic')}</th>
              <th className="px-6 py-3 text-start text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">{t('col_allowances')}</th>
              <th className="px-6 py-3 text-start text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">
                {t('col_gosi_deduction')}
                <span className="block text-[10px] text-slate-400 normal-case">{t('sub_gosi_deduction')}</span>
              </th>
              <th className="px-6 py-3 text-start text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">
                {t('col_gosi_employer')}
                <span className="block text-[10px] text-slate-400 normal-case">{t('sub_gosi_employer')}</span>
              </th>
              <th className="px-6 py-3 text-start text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">{t('col_net')}</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">{t('col_absence')}</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">{t('col_penalty')}</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
            {payrollRows.map((row) => (
              <tr key={row.employeeId} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-black dark:text-white">{row.employeeName}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">{row.isSaudi ? t('saudi') : t('non_saudi')}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-300">
                  {formatCurrency(row.basicSalary, currencyLocale)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-300">
                  {formatCurrency(row.totalAllowances, currencyLocale)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 dark:text-red-400 font-medium">
                  -{formatCurrency(row.gosiDeductionEmployee, currencyLocale)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                  {formatCurrency(row.gosiDeductionEmployer, currencyLocale)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-emerald-700 dark:text-emerald-400">
                  {formatCurrency(row.netSalary, currencyLocale)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                  {row.absenceDeduction > 0 ? (
                    <div className="flex flex-col items-center group/cell relative cursor-pointer">
                      <div className="group-hover/cell:opacity-20 transition-opacity">
                        <span className="text-red-500 font-bold">-{formatCurrency(row.absenceDeduction, currencyLocale)}</span>
                        <span className="block text-[10px] text-red-400">{row.absenceReason || t('deduction_absence')}</span>
                      </div>
                      <button
                        onClick={() => removeDeduction(row.employeeId, 'absence')}
                        className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/cell:opacity-100 transition-opacity"
                        title="Remove Absence"
                      >
                        <TrashIcon className="w-5 h-5 text-red-500 bg-red-50 dark:bg-red-900/30 p-1 rounded-full" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => openDeductionModal(row.employeeId, 'absence')}
                      className="text-slate-300 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 p-1 rounded-full transition-colors"
                      title="Add Absence"
                    >
                      <PlusIcon className="w-5 h-5" />
                    </button>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                  {row.penaltyDeduction > 0 ? (
                    <div className="flex flex-col items-center group/cell relative cursor-pointer">
                      <div className="group-hover/cell:opacity-20 transition-opacity">
                        <span className="text-red-500 font-bold">-{formatCurrency(row.penaltyDeduction, currencyLocale)}</span>
                        <span className="block text-[10px] text-red-400">{row.penaltyReason || t('deduction_penalty')}</span>
                      </div>
                      <button
                        onClick={() => removeDeduction(row.employeeId, 'penalty')}
                        className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/cell:opacity-100 transition-opacity"
                        title="Remove Penalty"
                      >
                        <TrashIcon className="w-5 h-5 text-red-500 bg-red-50 dark:bg-red-900/30 p-1 rounded-full" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => openDeductionModal(row.employeeId, 'penalty')}
                      className="text-slate-300 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 p-1 rounded-full transition-colors"
                      title="Add Penalty"
                    >
                      <PlusIcon className="w-5 h-5" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Deduction Modal */}
      {modalState.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-md border border-slate-200 dark:border-slate-700 animate-in fade-in zoom-in duration-200">
            <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
              <h3 className="font-bold text-lg dark:text-white">
                {modalState.type === 'absence' ? t('deduction_absence') || 'Add Absence' : t('deduction_penalty') || 'Add Penalty'}
              </h3>
              <button onClick={() => setModalState({ ...modalState, isOpen: false })} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveDeduction} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  {t('amount') || 'Amount'} (SAR)
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all dark:text-white"
                  value={modalState.amount}
                  onChange={e => setModalState({ ...modalState, amount: e.target.value })}
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  {t('reason') || 'Reason'}
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all dark:text-white"
                  value={modalState.reason}
                  onChange={e => setModalState({ ...modalState, reason: e.target.value })}
                  placeholder={modalState.type === 'absence' ? 'e.g. Unexcused Day' : 'e.g. Policy Violation'}
                />
              </div>
              <div className="pt-2 flex space-x-3 rtl:space-x-reverse">
                <button
                  type="button"
                  onClick={() => setModalState({ ...modalState, isOpen: false })}
                  className="flex-1 py-2 px-4 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                  {t('cancel') || 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 px-4 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 shadow-md shadow-emerald-500/20 transition-colors"
                >
                  {t('save') || 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};