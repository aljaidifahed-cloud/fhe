import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { Page } from '../types';
import { updateMyProfile, getEmployeeById, getEmployees } from '../services/mockService';
import { Employee } from '../types';
import {
    UserCircleIcon,
    CameraIcon,
    MapPinIcon,
    PhoneIcon,
    BriefcaseIcon,
    CheckCircleIcon,
    ArrowPathIcon,
    CalendarIcon,
    BanknotesIcon,
    BuildingOfficeIcon,
    ChartBarIcon
} from '@heroicons/react/24/outline';

interface ProfileProps {
    onNavigate: (page: Page) => void;
}

export const Profile: React.FC<ProfileProps> = ({ onNavigate }) => {
    const { t, language } = useLanguage();
    const { currentUser, loadUser } = useAuth();

    // State
    const [activeTab, setActiveTab] = useState('overview');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [nationalAddress, setNationalAddress] = useState('');
    const [city, setCity] = useState('');
    const [district, setDistrict] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');

    // Org Chart State
    const [manager, setManager] = useState<Employee | null>(null);
    const [subordinates, setSubordinates] = useState<Employee[]>([]);

    useEffect(() => {
        const fetchOrgRelations = async () => {
            if (!currentUser) return;

            // Fetch Manager
            if (currentUser.managerId) {
                const mgr = await getEmployeeById(currentUser.managerId);
                setManager(mgr || null);
            } else {
                setManager(null);
            }

            // Fetch Subordinates (Recursive)
            const allEmployees = await getEmployees();

            const getAllDescendants = (managerId: string, allEmps: Employee[]): Employee[] => {
                const directReports = allEmps.filter(e => e.managerId === managerId);
                let descendants = [...directReports];

                directReports.forEach(report => {
                    const subDescendants = getAllDescendants(report.id, allEmps);
                    descendants = [...descendants, ...subDescendants];
                });

                return descendants;
            };

            const subs = getAllDescendants(currentUser.id, allEmployees);
            setSubordinates(subs);
        };
        fetchOrgRelations();
    }, [currentUser]);

    useEffect(() => {
        if (currentUser) {
            setPhoneNumber(currentUser.phoneNumber || '');
            setNationalAddress(currentUser.nationalAddress || '');
            setCity(currentUser.city || '');
            setDistrict(currentUser.district || '');
            setPreviewUrl(currentUser.avatarUrl || null);
        }
    }, [currentUser]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser) return;
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('phoneNumber', phoneNumber);
            formData.append('nationalAddress', nationalAddress);
            formData.append('city', city);
            formData.append('district', district);
            if (selectedFile) formData.append('avatar', selectedFile);

            await updateMyProfile(currentUser.id, formData);
            await loadUser();
            setSuccessMsg(t('msg_profile_updated'));
            if (selectedFile) setSelectedFile(null);
            setTimeout(() => setSuccessMsg(''), 3000);
        } catch (error) {
            console.error("Failed to update profile", error);
        } finally {
            setLoading(false);
        }
    };

    if (!currentUser) return <div className="p-10 flex justify-center"><ArrowPathIcon className="w-8 h-8 animate-spin text-emerald-500" /></div>;

    // Dynamic Data for Lists
    const leaveBalances = [
        { type: 'leave_annual', days: 30, color: 'bg-emerald-500' },
        { type: 'leave_sick', days: 15, color: 'bg-blue-500' },
        { type: 'leave_unpaid', days: 0, color: 'bg-slate-400' }
    ];

    const basicSalary = currentUser.contract?.basicSalary || 0;
    const housing = currentUser.contract?.housingAllowance || 0;
    const transport = currentUser.contract?.transportAllowance || 0;
    const other = currentUser.contract?.otherAllowance || 0;
    const totalSalary = basicSalary + housing + transport + other;

    const salaryComponents = [
        { label: 'lbl_basic_salary', value: `${basicSalary.toLocaleString()} SAR` },
        { label: 'lbl_housing', value: `${housing.toLocaleString()} SAR` },
        { label: 'lbl_transport', value: `${transport.toLocaleString()} SAR` },
        { label: 'lbl_other_allowance', value: `${other.toLocaleString()} SAR` }
    ];

    // Infer contract end date (e.g., 2 years from join date) for demo purposes
    const joinDateObj = new Date(currentUser.joinDate);
    const contractEndDate = new Date(joinDateObj);
    contractEndDate.setFullYear(contractEndDate.getFullYear() + 2);

    // Probation often 3 months
    const probationDate = new Date(joinDateObj);
    probationDate.setMonth(probationDate.getMonth() + 3);

    const contractDetails = {
        startDate: currentUser.joinDate,
        endDate: contractEndDate.toISOString().split('T')[0],
        type: 'Full Time', // Default as per types
        status: 'Active',
        probationEnd: probationDate.toISOString().split('T')[0]
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6 pb-12 font-sans">
            {/* Header Section */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="h-32 bg-gradient-to-r from-slate-200 to-slate-100 dark:from-slate-700 dark:to-slate-800 relative">
                    {/* Cover Photo Placeholder */}
                </div>
                <div className="px-6 pb-6 relative">
                    <div className="flex flex-col md:flex-row items-end -mt-12 mb-4 space-y-4 md:space-y-0">
                        {/* Avatar */}
                        <div className="relative group mx-auto md:mx-0">
                            <div className="w-32 h-32 rounded-full border-4 border-white dark:border-slate-800 shadow-md bg-white overflow-hidden">
                                {previewUrl ? (
                                    <img src={previewUrl} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <UserCircleIcon className="w-full h-full text-slate-300 p-2" />
                                )}
                            </div>
                            {/* Upload Trigger */}
                            <label className="absolute bottom-1 right-1 bg-emerald-500 p-2 rounded-full text-white cursor-pointer hover:bg-emerald-600 shadow-sm">
                                <CameraIcon className="w-4 h-4" />
                                <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                            </label>
                        </div>

                        <div className="md:ltr:ml-6 md:rtl:mr-6 flex-1 text-center md:text-start">
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{currentUser.fullName}</h2>
                            <p className="text-slate-500 dark:text-slate-400 font-medium">{currentUser.position} • {currentUser.department}</p>
                            <div className="flex items-center justify-center md:justify-start gap-4 mt-2 text-sm text-slate-500">
                                <span className="flex items-center"><MapPinIcon className="w-4 h-4 mr-1 rtl:ml-1" /> Riyadh, KSA</span>
                                <span className="flex items-center"><BuildingOfficeIcon className="w-4 h-4 mr-1 rtl:ml-1" /> {currentUser.companyId}</span>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold shadow-sm hover:bg-emerald-700">{t('request_leave')}</button>
                            <button className="px-4 py-2 border border-slate-300 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-700">{t('settings')}</button>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex border-b border-slate-200 dark:border-slate-700 space-x-6 rtl:space-x-reverse overflow-x-auto">
                        {['Overview', 'Personal Info', 'Job Info', 'Documents', 'Assets'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab.toLowerCase().replace(' ', ''))}
                                className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === tab.toLowerCase().replace(' ', '')
                                    ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                                    : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                                    }`}
                            >
                                {t(tab.toLowerCase().replace(' ', '_') as any) || tab}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Dashboard Content */}
            {activeTab === 'overview' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* LEFT COLUMN */}
                    <div className="space-y-6">
                        {/* Deductions & Benefits (Visual Mock) */}
                        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                            <h3 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center">
                                <ChartBarIcon className="w-5 h-5 mr-2 text-slate-400" />
                                {t('deductions_benefits')}
                            </h3>
                            <div className="flex items-end space-x-4 rtl:space-x-reverse h-32 px-4 pb-2 border-b border-slate-100 dark:border-slate-700">
                                <div className="w-1/4 bg-amber-400 rounded-t-md h-[60%]" title={t('benefits')}></div>
                                <div className="w-1/4 bg-blue-500 rounded-t-md h-[80%]" title={t('deductions')}></div>
                                <div className="w-1/4 bg-emerald-500 rounded-t-md h-[40%]" title={t('allowances')}></div>
                                <div className="w-1/4 bg-slate-300 rounded-t-md h-[20%]" title={t('other')}></div>
                            </div>
                            <div className="flex justify-between text-xs text-slate-500 mt-2">
                                <span>{t('benefits')}</span>
                                <span>{t('deductions')}</span>
                                <span>{t('allowances')}</span>
                                <span>{t('other')}</span>
                            </div>
                        </div>

                        {/* Leaves List */}
                        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold text-slate-800 dark:text-white flex items-center">
                                    <CalendarIcon className="w-5 h-5 mr-2 text-slate-400" />
                                    {t('leaves_balance')}
                                </h3>
                                <span className="text-xs text-emerald-600 font-medium cursor-pointer">{t('view_history')}</span>
                            </div>
                            <div className="space-y-4">
                                {leaveBalances.map((leave, idx) => (
                                    <div key={idx} className="bg-slate-50 dark:bg-slate-700/50 p-3 rounded-lg flex justify-between items-center">
                                        <div className="flex items-center">
                                            <div className={`w-2 h-8 rounded-full ${leave.color} mr-3 rtl:ml-3`}></div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{t(leave.type as any)}</p>
                                                <p className="text-xs text-slate-500">{leave.days} {t('days_available')}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-lg font-bold text-slate-800 dark:text-white">{leave.days}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Salary Breakdown */}
                        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold text-slate-800 dark:text-white flex items-center">
                                    <BanknotesIcon className="w-5 h-5 mr-2 text-slate-400" />
                                    {t('salary_breakdown')}
                                </h3>
                            </div>
                            <div className="space-y-0 text-sm">
                                {salaryComponents.map((item, idx) => (
                                    <div key={idx} className={`flex justify-between py-3 ${idx !== 0 ? 'border-t border-slate-100 dark:border-slate-700' : ''}`}>
                                        <span className="text-slate-500">{t(item.label as any)}</span>
                                        <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{item.value}</span>
                                    </div>
                                ))}
                                <div className="flex justify-between py-3 border-t-2 border-slate-100 dark:border-slate-600 mt-2 bg-slate-50 dark:bg-slate-700/30 -mx-5 px-5">
                                    <span className="font-bold text-slate-800 dark:text-white">{t('total_salary')}</span>
                                    <span className="font-mono font-bold text-emerald-600">{totalSalary.toLocaleString()} SAR</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Basic Details Box */}
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="font-bold text-slate-800 dark:text-white">{t('basic_details')}</h3>
                                <button onClick={() => setActiveTab('personalinfo')} className="text-xs text-emerald-600 hover:text-emerald-700 border border-emerald-200 px-3 py-1 rounded">{t('edit')}</button>
                            </div>
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                                <div>
                                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">{t('employee_id')}</p>
                                    <p className="font-medium text-slate-700 dark:text-slate-200">{currentUser.id}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">{t('join_date')}</p>
                                    <p className="font-medium text-slate-700 dark:text-slate-200">{currentUser.joinDate}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">{t('lbl_email')}</p>
                                    <p className="font-medium text-slate-700 dark:text-slate-200 truncate">{currentUser.email}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">{t('lbl_phone')}</p>
                                    <p className="font-medium text-slate-700 dark:text-slate-200">{currentUser.phoneNumber || '-'}</p>
                                </div>
                                <div className="col-span-2">
                                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">{t('lbl_national_address')}</p>
                                    <p className="font-medium text-slate-700 dark:text-slate-200">
                                        {currentUser.nationalAddress || '-'}, {currentUser.city || '-'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Contract Details */}
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="font-bold text-slate-800 dark:text-white">{t('lbl_contract_details')}</h3>
                                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded">{t('valid')}</span>
                            </div>
                            <div className="border border-slate-200 dark:border-slate-600 rounded-lg p-4">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div>
                                        <p className="text-xs text-slate-400 mb-1">{t('contract_type')}</p>
                                        <p className="font-bold text-slate-700 dark:text-slate-300">{contractDetails.type}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-400 mb-1">{t('start_date')}</p>
                                        <p className="font-bold text-slate-700 dark:text-slate-300">{contractDetails.startDate}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-400 mb-1">{t('end_date')}</p>
                                        <p className="font-bold text-slate-700 dark:text-slate-300">{contractDetails.endDate}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-400 mb-1">{t('probation')}</p>
                                        <p className="font-bold text-slate-700 dark:text-slate-300">{t('probation_ended')} {contractDetails.probationEnd}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Organization Hierarchy (Visual Mock) */}
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 min-h-[200px]">
                            <h3 className="font-bold text-slate-800 dark:text-white mb-6">{t('org_hierarchy_title')}</h3>

                            <div className="flex flex-col items-center">
                                {/* Manager */}
                                {manager ? (
                                    <div className="flex flex-col items-center">
                                        <div className="w-12 h-12 rounded-full border-2 border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden">
                                            {manager.avatarUrl ? <img src={manager.avatarUrl} className="w-full h-full object-cover" /> : <UserCircleIcon className="w-8 h-8 text-slate-400" />}
                                        </div>
                                        <p className="text-xs font-bold mt-1 text-slate-700">{manager.fullName} ({t('manager_role')})</p>
                                        <div className="h-6 w-px bg-slate-300 my-1"></div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center mb-4 text-slate-400">
                                        <span className="text-xs italic">Top Level</span>
                                        <div className="h-6 w-px bg-slate-300 my-1"></div>
                                    </div>
                                )}

                                {/* Current User */}
                                <div className="flex flex-col items-center p-3 border border-emerald-200 bg-emerald-50 rounded-lg mb-2 relative z-10 w-48 shadow-md">
                                    <div className="w-10 h-10 rounded-full border-2 border-white shadow-sm overflow-hidden bg-slate-200">
                                        {previewUrl ? <img src={previewUrl} className="w-full h-full object-cover" /> : <UserCircleIcon className="w-full h-full text-slate-400" />}
                                    </div>
                                    <p className="text-sm font-bold mt-1 text-emerald-800 text-center">{currentUser.fullName}</p>
                                    <p className="text-[10px] text-emerald-600">{currentUser.position}</p>
                                </div>

                                {/* Subordinates Line */}
                                {subordinates.length > 0 && (
                                    <>
                                        <div className="h-6 w-px bg-slate-300 mb-1"></div>
                                        {subordinates.length > 1 && (
                                            <>
                                                <div className="w-2/3 border-t border-slate-300"></div>
                                                <div className="flex justify-between w-2/3 pt-1">
                                                    {/* Vertical lines connecting to horizontal bar - approximate for simple tree */}
                                                    {subordinates.map((_, idx) => (
                                                        <div key={idx} className={`h-3 w-px bg-slate-300 ${idx === 0 || idx === subordinates.length - 1 ? 'visible' : 'invisible'}`}></div>
                                                    ))}
                                                </div>
                                            </>
                                        )}
                                        {/* Single subordinate vertical line extension if only 1 */}
                                        {subordinates.length === 1 && <div className="h-3 w-px bg-slate-300"></div>}

                                        <div className="flex gap-4 mt-4 justify-center flex-wrap px-4">
                                            {subordinates.map(sub => (
                                                <div key={sub.id} className="flex flex-col items-center p-2 border border-slate-200 bg-white dark:bg-slate-700/50 rounded-lg w-28 shadow-sm hover:shadow-md transition-shadow">
                                                    <div className="w-10 h-10 rounded-full border border-slate-100 dark:border-slate-600 bg-slate-50 flex items-center justify-center overflow-hidden mb-2">
                                                        {sub.avatarUrl ? <img src={sub.avatarUrl} className="w-full h-full object-cover" /> : <span className="text-xs text-slate-500 font-bold">{sub.fullName.charAt(0)}</span>}
                                                    </div>
                                                    <p className="text-[10px] font-bold text-slate-700 dark:text-slate-200 text-center leading-tight w-full break-words mb-0.5">{sub.fullName}</p>
                                                    <p className="text-[9px] text-slate-400 text-center truncate w-full">{sub.position}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                )}
                                {subordinates.length === 0 && (
                                    <p className="text-xs text-slate-400 mt-4 italic">No direct reports</p>
                                )}
                            </div>
                        </div>

                    </div>
                </div>
            )}

            {/* Edit Form Tab (Restored Previous Functionality) */}
            {activeTab === 'personalinfo' && (
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                    <h3 className="font-bold text-slate-800 dark:text-white mb-6">{t('edit_personal_details')}</h3>
                    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
                        {successMsg && (
                            <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-700 flex items-center">
                                <CheckCircleIcon className="w-5 h-5 mr-2" />
                                {successMsg}
                            </div>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-slate-700 mb-1">{t('lbl_phone')}</label>
                                <div className="relative">
                                    <PhoneIcon className="absolute left-3 top-2.5 h-5 w-5 text-slate-400 rtl:right-3 rtl:left-auto" />
                                    <input
                                        type="text"
                                        value={phoneNumber}
                                        onChange={(e) => setPhoneNumber(e.target.value)}
                                        className="pl-10 rtl:pr-10 w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                                    />
                                </div>
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-slate-700 mb-1">{t('lbl_national_address')}</label>
                                <div className="relative">
                                    <MapPinIcon className="absolute left-3 top-2.5 h-5 w-5 text-slate-400 rtl:right-3 rtl:left-auto" />
                                    <input
                                        type="text"
                                        value={nationalAddress}
                                        onChange={(e) => setNationalAddress(e.target.value)}
                                        className="pl-10 rtl:pr-10 w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">{t('lbl_city')}</label>
                                <input
                                    type="text"
                                    value={city}
                                    onChange={(e) => setCity(e.target.value)}
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">{t('lbl_district')}</label>
                                <input
                                    type="text"
                                    value={district}
                                    onChange={(e) => setDistrict(e.target.value)}
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end pt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-6 py-2 rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-700 shadow-md flex items-center disabled:opacity-70"
                            >
                                {loading ? <ArrowPathIcon className="w-4 h-4 animate-spin mr-2" /> : null}
                                {t('btn_save_changes')}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};