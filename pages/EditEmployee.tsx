import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useNotifications } from '../contexts/NotificationsContext';
import { Page } from '../types';
import { NationalityType, Employee } from '../types';
import { getEmployeeById, updateEmployee, getCountries, Country } from '../services/mockService';
import { UserPlusIcon, ArrowLeftIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

interface EditEmployeeProps {
  id: string;
  onNavigate: (page: Page) => void;
}

export const EditEmployee: React.FC<EditEmployeeProps> = ({ id, onNavigate }) => {
  const { t, language } = useLanguage();
  const { addNotification } = useNotifications();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [countries, setCountries] = useState<Country[]>([]);

  const [formData, setFormData] = useState({
    fullName: '',
    nationality: 'Saudi Arabia',
    iqamaOrNationalId: '',
    idExpiryDate: '',
    position: '',
    department: '',
    joinDate: '',
    email: '',
    iban: '',
    bankName: '',
    basicSalary: 0,
    housingAllowance: 0,
    transportAllowance: 0,
    otherAllowance: 0,
    avatarUrl: ''
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      try {
        // Upload file
        const url = await import('../services/mockService').then(m => m.uploadFile(file));
        setFormData(prev => ({ ...prev, avatarUrl: url }));
      } catch (err) {
        console.error("Upload failed", err);
        // Fallback to local preview if service fails
        const localUrl = URL.createObjectURL(file);
        setFormData(prev => ({ ...prev, avatarUrl: localUrl }));
      }
    }
  };

  // Fetch Data on Mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setInitialLoading(true);
        // Fetch Countries concurrently
        const [employee, countriesList] = await Promise.all([
          getEmployeeById(id),
          getCountries()
        ]);

        setCountries(countriesList);

        if (employee) {
          setFormData({
            fullName: employee.fullName,
            nationality: employee.nationality,
            iqamaOrNationalId: employee.iqamaOrNationalId,
            idExpiryDate: employee.idExpiryDate,
            position: employee.position,
            department: employee.department,
            joinDate: employee.joinDate,
            email: employee.email,
            iban: employee.iban,
            bankName: employee.bankName,
            basicSalary: employee.contract.basicSalary,
            housingAllowance: employee.contract.housingAllowance,
            transportAllowance: employee.contract.transportAllowance,
            otherAllowance: employee.contract.otherAllowance,
            avatarUrl: employee.avatarUrl || ''
          });
        } else {
          setError(t('err_employee_not_found'));
        }
      } catch (err) {
        setError(t('err_fetch_failed'));
      } finally {
        setInitialLoading(false);
      }
    };
    fetchData();
  }, [id, t]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Construct the payload matching the backend structure
      const updatedEmployee: Partial<Employee> = {
        fullName: formData.fullName,
        nationality: formData.nationality, // Now a string from the dropdown
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
        },
        avatarUrl: formData.avatarUrl,
      };

      // Call Service (Simulating PUT request)
      await updateEmployee(id, updatedEmployee);
      addNotification({
        title: t('notifications'),
        message: `${t('new_employee')} - ${updatedEmployee.fullName || formData.fullName}`,
        type: 'success'
      });
      onNavigate(Page.EMPLOYEES);
    } catch (err) {
      console.error("Update failed:", err);
      setError(t('connection_error'));
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center">
          <ArrowPathIcon className="w-8 h-8 text-emerald-500 animate-spin" />
          <p className="text-slate-500 mt-2">{t('msg_loading_data')}</p>
        </div>
      </div>
    );
  }

  if (error && !formData.fullName) {
    return (
      <div className="p-8 text-center bg-white rounded-xl border border-red-200">
        <p className="text-red-500 font-bold mb-4">{error}</p>
        <button onClick={() => onNavigate(Page.EMPLOYEES)} className="text-emerald-600 hover:underline">
          {t('btn_return')}
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div className="flex items-center space-x-4 rtl:space-x-reverse mb-6">
        <button
          onClick={() => onNavigate(Page.EMPLOYEES)}
          className="p-2 rounded-full bg-white hover:bg-slate-100 text-slate-500 transition-colors shadow-sm"
        >
          <ArrowLeftIcon className="w-5 h-5 rtl:rotate-180" />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-black dark:text-white">{t('edit_employee_title')}</h2>
          <p className="text-slate-500 text-sm">{t('edit_employee_subtitle')} {formData.fullName || id}</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-lg text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">

        {/* Avatar Section */}
        <div className="flex justify-center mb-8">
          <div className="relative group">
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg bg-slate-100">
              {formData.avatarUrl ? (
                <img src={formData.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400">
                  <UserPlusIcon className="w-12 h-12" />
                </div>
              )}
            </div>
            <label htmlFor="avatar-upload" className="absolute bottom-0 right-0 p-2 bg-emerald-600 text-white rounded-full cursor-pointer hover:bg-emerald-700 shadow-md transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
              </svg>
            </label>
            <input
              id="avatar-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
        </div>

        {/* Personal Info Section */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex items-center space-x-2 rtl:space-x-reverse mb-6 pb-2 border-b border-slate-100">
            <UserPlusIcon className="w-5 h-5 text-emerald-600" />
            <h3 className="text-lg font-bold text-black dark:text-white">{t('personal_info')}</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-black dark:text-white mb-1">Employee Number</label>
              <input
                disabled
                value={id}
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
            onClick={() => onNavigate(Page.EMPLOYEES)}
            className="px-6 py-3 rounded-lg border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 transition-colors"
          >
            {t('btn_cancel')}
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-700 shadow-md transition-colors disabled:opacity-50 flex items-center space-x-2 rtl:space-x-reverse"
          >
            {loading && <ArrowPathIcon className="w-4 h-4 animate-spin" />}
            <span>{loading ? t('msg_updating') : t('btn_update_employee')}</span>
          </button>
        </div>
      </form>
    </div>
  );
};