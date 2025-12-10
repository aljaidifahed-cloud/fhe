import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Page } from '../types';
import { NationalityType, Employee } from '../types';
import { addEmployee, getCountries, getNextEmployeeId, Country } from '../services/mockService';
import { UserPlusIcon, ArrowLeftIcon, IdentificationIcon } from '@heroicons/react/24/outline';

interface AddEmployeeProps {
  onNavigate: (page: Page) => void;
}

export const AddEmployee: React.FC<AddEmployeeProps> = ({ onNavigate }) => {
  const { t, language } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [countries, setCountries] = useState<Country[]>([]);
  const [jobId, setJobId] = useState<string>('Loading...');

  const [formData, setFormData] = useState({
    fullName: '',
    nationality: 'Saudi Arabia',
    iqamaOrNationalId: '',
    idExpiryDate: '',
    position: '',
    department: '',
    joinDate: new Date().toISOString().split('T')[0],
    email: '',
    iban: '',
    bankName: '',
    basicSalary: 0,
    housingAllowance: 0,
    transportAllowance: 0,
    otherAllowance: 0
  });

  // Fetch Countries & Next ID on Mount
  useEffect(() => {
    getCountries().then(setCountries);
    getNextEmployeeId().then(setJobId);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const newEmployee: Employee = {
      id: jobId, // Use the fetched sequential ID
      companyId: 'COMP-001',
      fullName: formData.fullName,
      nationality: formData.nationality,
      iqamaOrNationalId: formData.iqamaOrNationalId,
      idExpiryDate: formData.idExpiryDate,
      position: formData.position,
      department: formData.department,
      joinDate: formData.joinDate,
      email: formData.email,
      iban: formData.iban,
      bankName: formData.bankName,
      contract: {
        basicSalary: Number(formData.basicSalary),
        housingAllowance: Number(formData.housingAllowance),
        transportAllowance: Number(formData.transportAllowance),
        otherAllowance: Number(formData.otherAllowance),
      }
    };

    await addEmployee(newEmployee);
    setLoading(false);
    onNavigate(Page.EMPLOYEES);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div className="flex items-center space-x-4 rtl:space-x-reverse mb-6">
        <button
          onClick={() => onNavigate(Page.DASHBOARD)}
          className="p-2 rounded-full bg-white hover:bg-slate-100 text-slate-500 transition-colors shadow-sm"
        >
          <ArrowLeftIcon className="w-5 h-5 rtl:rotate-180" />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-black dark:text-white">{t('form_title')}</h2>
          <p className="text-slate-500 text-sm">{t('form_subtitle')}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">

        {/* Personal Info Section */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex items-center space-x-2 rtl:space-x-reverse mb-6 pb-2 border-b border-slate-100">
            <UserPlusIcon className="w-5 h-5 text-emerald-600" />
            <h3 className="text-lg font-bold text-black dark:text-white">{t('new_employee')}</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Employee Number - Moved Here */}
            <div>
              <label className="block text-sm font-medium text-black dark:text-white mb-1">Employee Number</label>
              <input
                disabled
                value={jobId}
                className="w-full px-3 py-2 border border-slate-200 bg-slate-50 text-slate-500 rounded-lg font-mono font-bold"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-black dark:text-white mb-1">{t('lbl_full_name')}</label>
              <input required name="fullName" value={formData.fullName} onChange={handleChange} type="text" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-black dark:bg-slate-700 dark:text-white dark:border-slate-600" />
            </div>

            <div>
              <label className="block text-sm font-medium text-black dark:text-white mb-1">{t('lbl_nationality')}</label>
              <select
                name="nationality"
                value={formData.nationality}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none bg-white text-black dark:bg-slate-700 dark:text-white dark:border-slate-600"
              >
                <option disabled value="">Select Country</option>
                {countries.map(c => (
                  <option key={c.isoCode} value={c.nameEn}>
                    {language === 'ar' ? c.nameAr : c.nameEn}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-black dark:text-white mb-1">{t('lbl_iqama')}</label>
              <input required name="iqamaOrNationalId" value={formData.iqamaOrNationalId} onChange={handleChange} type="text" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-black dark:bg-slate-700 dark:text-white dark:border-slate-600" />
            </div>

            <div>
              <label className="block text-sm font-medium text-black dark:text-white mb-1">{t('lbl_id_expiry')}</label>
              <input required name="idExpiryDate" value={formData.idExpiryDate} onChange={handleChange} type="date" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-black dark:bg-slate-700 dark:text-white dark:border-slate-600" />
            </div>

            <div>
              <label className="block text-sm font-medium text-black dark:text-white mb-1">{t('lbl_email')}</label>
              <input required name="email" value={formData.email} onChange={handleChange} type="email" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-black dark:bg-slate-700 dark:text-white dark:border-slate-600" />
            </div>

            <div>
              <label className="block text-sm font-medium text-black dark:text-white mb-1">{t('lbl_join_date')}</label>
              <input required name="joinDate" value={formData.joinDate} onChange={handleChange} type="date" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-black dark:bg-slate-700 dark:text-white dark:border-slate-600" />
            </div>

            <div>
              <label className="block text-sm font-medium text-black dark:text-white mb-1">{t('lbl_department')}</label>
              <input required name="department" value={formData.department} onChange={handleChange} type="text" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-black dark:bg-slate-700 dark:text-white dark:border-slate-600" />
            </div>

            <div>
              <label className="block text-sm font-medium text-black dark:text-white mb-1">{t('lbl_position')}</label>
              <input required name="position" value={formData.position} onChange={handleChange} type="text" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-black dark:bg-slate-700 dark:text-white dark:border-slate-600" />
            </div>
          </div>
        </div>

        {/* Contract & Financials */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex items-center space-x-2 rtl:space-x-reverse mb-6 pb-2 border-b border-slate-100">
            <h3 className="text-lg font-bold text-black dark:text-white">{t('lbl_contract_details')}</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-black dark:text-white mb-1">{t('lbl_basic_salary')}</label>
              <input required name="basicSalary" value={formData.basicSalary} onChange={handleChange} type="number" min="0" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-black dark:bg-slate-700 dark:text-white dark:border-slate-600" />
            </div>

            <div>
              <label className="block text-sm font-medium text-black dark:text-white mb-1">{t('lbl_housing')}</label>
              <input required name="housingAllowance" value={formData.housingAllowance} onChange={handleChange} type="number" min="0" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-black dark:bg-slate-700 dark:text-white dark:border-slate-600" />
            </div>

            <div>
              <label className="block text-sm font-medium text-black dark:text-white mb-1">{t('lbl_transport')}</label>
              <input required name="transportAllowance" value={formData.transportAllowance} onChange={handleChange} type="number" min="0" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-black dark:bg-slate-700 dark:text-white dark:border-slate-600" />
            </div>

            <div>
              <label className="block text-sm font-medium text-black dark:text-white mb-1">{t('lbl_other_allowance')}</label>
              <input name="otherAllowance" value={formData.otherAllowance} onChange={handleChange} type="number" min="0" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-black dark:bg-slate-700 dark:text-white dark:border-slate-600" />
            </div>

            <div>
              <label className="block text-sm font-medium text-black dark:text-white mb-1">{t('lbl_iban')}</label>
              <input required name="iban" value={formData.iban} onChange={handleChange} placeholder="SA..." type="text" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-black dark:bg-slate-700 dark:text-white dark:border-slate-600" />
            </div>

            <div>
              <label className="block text-sm font-medium text-black dark:text-white mb-1">{t('lbl_bank')}</label>
              <input required name="bankName" value={formData.bankName} onChange={handleChange} type="text" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-black dark:bg-slate-700 dark:text-white dark:border-slate-600" />
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-4 rtl:space-x-reverse">
          <button
            type="button"
            onClick={() => onNavigate(Page.DASHBOARD)}
            className="px-6 py-3 rounded-lg border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 transition-colors"
          >
            {t('btn_cancel')}
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-700 shadow-md transition-colors disabled:opacity-50"
          >
            {loading ? 'Saving...' : t('btn_save_employee')}
          </button>
        </div>
      </form>
    </div>
  );
};