import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { Page } from '../types';
import { updateMyProfile, getEmployeeById, getEmployees, updateEmployee } from '../services/mockService';
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
    ChartBarIcon,
    EyeIcon,
    ArrowDownTrayIcon,
    XMarkIcon,
    ArchiveBoxIcon,
    PlusIcon,
    PencilSquareIcon, // New
    TrashIcon // New
} from '@heroicons/react/24/outline';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell
} from 'recharts';
import { calculatePayroll } from '../utils/payrollUtils';

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
    const [showLeaveDetails, setShowLeaveDetails] = useState(false);

    // Asset State
    const [showAssetModal, setShowAssetModal] = useState(false);
    const [editingAssetId, setEditingAssetId] = useState<string | null>(null);
    const [newAsset, setNewAsset] = useState<{ name: string, type: string, serialNumber: string, dateAssigned: string, notes: string }>({
        name: '', type: 'Electronics', serialNumber: '', dateAssigned: new Date().toISOString().split('T')[0], notes: ''
    });

    const handleAddAsset = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser) return;

        let updatedAssets;

        if (editingAssetId) {
            // Update existing
            updatedAssets = (currentUser.assets || []).map(a =>
                a.id === editingAssetId
                    ? { ...a, ...newAsset }
                    : a
            );
        } else {
            // Create new
            const assetObj: any = {
                id: `ast-${Date.now()}`,
                ...newAsset,
                status: 'Active'
            };
            updatedAssets = [...(currentUser.assets || []), assetObj];
        }

        try {
            await updateEmployee(currentUser.id, { assets: updatedAssets });
            await loadUser();

            setShowAssetModal(false);
            setEditingAssetId(null);
            setNewAsset({ name: '', type: 'Electronics', serialNumber: '', dateAssigned: new Date().toISOString().split('T')[0], notes: '' });
        } catch (error) {
            console.error("Failed to save asset", error);
            alert("Failed to save item");
        }
    };

    const handleDeleteAsset = async (assetId: string) => {
        if (!currentUser || !window.confirm(t('confirm_delete_asset'))) return;

        const updatedAssets = (currentUser.assets || []).filter(a => a.id !== assetId);
        try {
            await updateEmployee(currentUser.id, { assets: updatedAssets });
            await loadUser();
        } catch (error) {
            console.error("Failed to delete asset", error);
            alert("Failed to delete item");
        }
    };

    const openEditModal = (asset: any) => {
        setNewAsset({
            name: asset.name,
            type: asset.type,
            serialNumber: asset.serialNumber || '',
            dateAssigned: asset.dateAssigned,
            notes: asset.notes || ''
        });
        setEditingAssetId(asset.id);
        setShowAssetModal(true);
    };

    const openAddModal = () => {
        setNewAsset({ name: '', type: 'Electronics', serialNumber: '', dateAssigned: new Date().toISOString().split('T')[0], notes: '' });
        setEditingAssetId(null);
        setShowAssetModal(true);
    }; // New State for Leave Details Modal
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');

    // Org Chart State
    const [managersChain, setManagersChain] = useState<Employee[]>([]);
    const [subordinates, setSubordinates] = useState<Employee[]>([]);

    useEffect(() => {
        const fetchOrgRelations = async () => {
            if (!currentUser) return;

            const allEmployees = await getEmployees();

            // Build Manager Chain (Upward)
            const chain: Employee[] = [];
            let currentMgrId = currentUser.managerId;
            let safety = 0;
            while (currentMgrId && safety < 50) {
                const mgr = allEmployees.find(e => e.id === currentMgrId);
                if (mgr) {
                    chain.unshift(mgr);
                    currentMgrId = mgr.managerId;
                } else {
                    break;
                }
                safety++;
            }
            setManagersChain(chain);

            const buildTree = (managerId: string, allEmps: Employee[]): any[] => {
                // Find direct reports
                const directReports = allEmps.filter(e => e.managerId === managerId);

                // For each direct report, recursively find their reports
                return directReports.map(emp => ({
                    ...emp,
                    children: buildTree(emp.id, allEmps)
                }));
            };

            const subordinateTree = buildTree(currentUser.id, allEmployees);
            setSubordinates(subordinateTree);
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
        { type: 'leave_annual', days: 30, total: 30, taken: 0, color: 'bg-emerald-500' },
        { type: 'leave_sick', days: 15, total: 15, taken: 0, color: 'bg-blue-500' },
        { type: 'leave_unpaid', days: 0, total: 0, taken: 0, color: 'bg-slate-400' }
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
                            <button onClick={() => onNavigate(Page.REQUESTS)} className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold shadow-sm hover:bg-emerald-700">{t('request_leave')}</button>
                            <button onClick={() => onNavigate(Page.PERMISSIONS)} className="px-4 py-2 border border-slate-300 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-700">{t('settings')}</button>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex border-b border-slate-200 dark:border-slate-700 space-x-6 rtl:space-x-reverse overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
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
            {/* Job Info Content */}
            {activeTab === 'jobinfo' && (
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                    <h3 className="font-bold text-slate-800 dark:text-white mb-6 flex items-center">
                        <BriefcaseIcon className="w-5 h-5 mr-2 text-slate-400" />
                        {t('job_info') || 'Job Information'}
                    </h3>
                    <div className="space-y-6 max-w-3xl">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">{t('lbl_department') || 'Department'}</p>
                                <p className="font-medium text-slate-700 dark:text-slate-200 text-lg">{currentUser.department}</p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">{t('lbl_job_title') || 'Job Title'}</p>
                                <p className="font-medium text-slate-700 dark:text-slate-200 text-lg">{currentUser.position}</p>
                            </div>
                        </div>

                        <div className="border-t border-slate-100 dark:border-slate-700 pt-6">
                            <p className="text-xs text-slate-400 uppercase tracking-wider mb-2">{t('lbl_job_summary') || 'Job Summary'}</p>
                            <div className="bg-slate-50 dark:bg-slate-700/30 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                                {currentUser.jobSummary ? (
                                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm">
                                        {currentUser.jobSummary}
                                    </p>
                                ) : (
                                    <p className="text-slate-400 italic text-sm">No job summary available.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Documents Content */}
            {activeTab === 'documents' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[
                        { title: 'Employment Contract', key: 'employmentContract', url: currentUser.employmentContractUrl },
                        { title: 'Bank Account', key: 'bankAccount', url: currentUser.bankAccountUrl },
                        { title: 'National ID / Residence Permit', key: 'nationalId', url: currentUser.nationalIdUrl }
                    ].map((doc, idx) => (
                        <div key={idx} className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col items-center relative group">
                            {/* Card Content ... same as before */}
                            <div className="w-full h-32 bg-slate-100 dark:bg-slate-900 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
                                {doc.url ? (
                                    <div className="text-center">
                                        <BriefcaseIcon className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                                        <span className="text-xs text-emerald-600 font-medium">Document Uploaded</span>
                                    </div>
                                ) : (
                                    <ArrowDownTrayIcon className="w-8 h-8 text-slate-300" />
                                )}
                            </div>
                            <h4 className="font-semibold text-slate-800 dark:text-white mb-4 text-center">{doc.title}</h4>

                            {/* Actions Overlay */}
                            <div className="absolute inset-0 bg-slate-900/50 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-[1px]">
                                {doc.url && (
                                    <>
                                        <button
                                            onClick={() => window.open(doc.url, '_blank')}
                                            className="p-2 bg-white text-emerald-600 rounded-full hover:bg-emerald-50 transition-colors"
                                            title="View"
                                        >
                                            <EyeIcon className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => {
                                                const link = document.createElement('a');
                                                link.href = doc.url!;
                                                link.download = `${doc.title.replace(/\s+/g, '_')}.png`;
                                                link.click();
                                            }}
                                            className="p-2 bg-white text-emerald-600 rounded-full hover:bg-emerald-50 transition-colors"
                                            title="Save"
                                        >
                                            <ArrowDownTrayIcon className="w-5 h-5" />
                                        </button>
                                    </>
                                )}
                            </div>

                            <label className="text-sm text-emerald-600 hover:text-emerald-700 font-medium cursor-pointer border border-emerald-200 px-3 py-1 rounded inline-flex items-center mt-auto z-10 bg-white/80 dark:bg-slate-800">
                                <ArrowPathIcon className="w-3 h-3 mr-1" />
                                {doc.url ? 'Change File' : 'Upload File'}
                                <input
                                    type="file"
                                    className="hidden"
                                    accept="image/*,application/pdf"
                                    onChange={async (e) => {
                                        const file = e.target.files?.[0];
                                        if (!file) return;

                                        setLoading(true);
                                        try {
                                            const formData = new FormData();
                                            formData.append(doc.key, file);
                                            await updateMyProfile(currentUser.id, formData);
                                            await loadUser();
                                            // Optional: Success feedback could be improved
                                            alert(`${doc.title} updated successfully`);
                                        } catch (err) {
                                            console.error("Upload failed", err);
                                            alert("Failed to upload document");
                                        } finally {
                                            setLoading(false);
                                        }
                                    }}
                                />
                            </label>
                        </div>
                    ))}
                </div>
            )}
            {/* Assets Content */}
            {activeTab === 'assets' && (
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-slate-800 dark:text-white flex items-center">
                            <ArchiveBoxIcon className="w-5 h-5 mr-2 text-slate-400" />
                            {t('assets') || 'Custody & Assets'}
                        </h3>
                        {/* Only show Add button if authorized - assuming everyone for this demo or check role */}
                        <button
                            onClick={openAddModal}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center transition-colors shadow-sm"
                        >
                            <PlusIcon className="w-4 h-4 mr-2 rtl:ml-2" />
                            {t('add_item') || 'Add Item'}
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-200 dark:border-slate-700">
                                    <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('item_name') || 'Item Name'}</th>
                                    <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('type') || 'Type'}</th>
                                    <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('serial_number') || 'Serial Number'}</th>
                                    <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('date_assigned') || 'Date Assigned'}</th>
                                    <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('status') || 'Status'}</th>
                                    <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">{t('actions') || 'Actions'}</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm">
                                {currentUser.assets && currentUser.assets.length > 0 ? (
                                    currentUser.assets.map((asset: any) => (
                                        <tr key={asset.id} className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                            <td className="py-3 px-4 font-medium text-slate-800 dark:text-slate-200">{asset.name}</td>
                                            <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{t(`asset_${asset.type.toLowerCase()}` as any)}</td>
                                            <td className="py-3 px-4 font-mono text-slate-500 text-xs">{asset.serialNumber || '-'}</td>
                                            <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{asset.dateAssigned}</td>
                                            <td className="py-3 px-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-bold ${asset.status === 'Active' ? 'bg-emerald-100 text-emerald-700' :
                                                        asset.status === 'Returned' ? 'bg-slate-100 text-slate-700' :
                                                            'bg-red-100 text-red-700'
                                                    }`}>
                                                    {t(asset.status.toLowerCase() as any) || asset.status}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-right flex justify-end gap-2">
                                                <button
                                                    onClick={() => openEditModal(asset)}
                                                    className="p-1 text-slate-400 hover:text-emerald-600 transition-colors"
                                                    title={t('edit_item')}
                                                >
                                                    <PencilSquareIcon className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteAsset(asset.id)}
                                                    className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                                                    title={t('delete') || 'Delete'}
                                                >
                                                    <TrashIcon className="w-5 h-5" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="py-8 text-center text-slate-400 italic">
                                            {t('no_assets') || 'No custody items assigned.'}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Overview Content */}
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
                            <div className="h-64 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={(() => {
                                            const payroll = calculatePayroll(currentUser);
                                            return [
                                                { name: t('benefits'), value: payroll.basicSalary, color: '#fbbf24' },
                                                { name: t('deductions'), value: payroll.gosiDeductionEmployee, color: '#3b82f6' },
                                                { name: t('allowances'), value: currentUser.contract.housingAllowance + currentUser.contract.transportAllowance, color: '#10b981' },
                                                { name: t('other'), value: currentUser.contract.otherAllowance, color: '#cbd5e1' }
                                            ];
                                        })()}
                                        margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                        <XAxis
                                            dataKey="name"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: '#64748b', fontSize: 12 }}
                                            dy={10}
                                        />
                                        <YAxis
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: '#64748b', fontSize: 12 }}
                                            tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                                        />
                                        <Tooltip
                                            cursor={{ fill: 'transparent' }}
                                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px' }}
                                            formatter={(value: number) => [`${value.toLocaleString()} SAR`, '']}
                                            labelStyle={{ color: '#64748b', marginBottom: '4px' }}
                                        />
                                        <Bar dataKey="value" radius={[6, 6, 0, 0]} animationDuration={1500}>
                                            {[
                                                { name: t('benefits'), value: basicSalary, color: '#fbbf24' },
                                                { name: t('deductions'), value: Math.round(basicSalary * 0.0975), color: '#3b82f6' },
                                                { name: t('allowances'), value: housing + transport, color: '#10b981' },
                                                { name: t('other'), value: other, color: '#cbd5e1' }
                                            ].map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Leaves List */}
                        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold text-slate-800 dark:text-white flex items-center">
                                    <CalendarIcon className="w-5 h-5 mr-2 text-slate-400" />
                                    {t('leaves_balance')}
                                </h3>
                                <span onClick={() => setShowLeaveDetails(true)} className="text-xs text-emerald-600 font-medium cursor-pointer hover:underline">{t('view_history')}</span>
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
                                {/* Managers Chain (Upward) */}
                                {managersChain.length > 0 ? (
                                    managersChain.map((mgr, index) => (
                                        <div key={mgr.id} className="flex flex-col items-center">
                                            <div className="flex flex-col items-center p-2 border border-slate-200 bg-white dark:bg-slate-700/50 rounded-lg w-28 shadow-sm hover:shadow-md transition-shadow">
                                                <div className="w-10 h-10 rounded-full border border-slate-100 dark:border-slate-600 bg-slate-50 flex items-center justify-center overflow-hidden mb-2">
                                                    {mgr.avatarUrl ? <img src={mgr.avatarUrl} className="w-full h-full object-cover" /> : <UserCircleIcon className="w-8 h-8 text-slate-400" />}
                                                </div>
                                                <p className="text-[10px] font-bold text-slate-700 dark:text-slate-200 text-center leading-tight w-full break-words mb-0.5">{mgr.fullName}</p>
                                                <p className="text-[9px] text-slate-400 text-center truncate w-full">{mgr.position}</p>
                                            </div>
                                            {/* Line connecting to next item (either next manager or current user) */}
                                            <div className="h-6 w-px bg-slate-300"></div>
                                        </div>
                                    ))
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

                                {/* Subordinates Tree */}
                                {subordinates.length > 0 && (
                                    <>
                                        <div className="h-6 w-px bg-slate-300 mb-1"></div>
                                        <div className="w-full overflow-x-auto pb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
                                            <div className="flex justify-center min-w-max px-4">
                                                {subordinates.map((sub: any) => (
                                                    <div key={sub.id} className="flex flex-col items-center mx-2">
                                                        {/* Node Card */}
                                                        <div className="relative flex flex-col items-center">
                                                            {/* Vertical Line from top */}
                                                            <div className="h-4 w-px bg-slate-300 absolute -top-4 left-1/2 transform -translate-x-1/2"></div>

                                                            <div className="flex flex-col items-center p-2 border border-slate-200 bg-white dark:bg-slate-700/50 rounded-lg w-28 shadow-sm hover:shadow-md transition-shadow z-10 relative">
                                                                <div className="w-10 h-10 rounded-full border border-slate-100 dark:border-slate-600 bg-slate-50 flex items-center justify-center overflow-hidden mb-2">
                                                                    {sub.avatarUrl ? <img src={sub.avatarUrl} className="w-full h-full object-cover" /> : <span className="text-xs text-slate-500 font-bold">{sub.fullName.charAt(0)}</span>}
                                                                </div>
                                                                <p className="text-[10px] font-bold text-slate-700 dark:text-slate-200 text-center leading-tight w-full break-words mb-0.5">{sub.fullName}</p>
                                                                <p className="text-[9px] text-slate-400 text-center truncate w-full">{sub.position}</p>
                                                            </div>
                                                        </div>

                                                        {/* Children */}
                                                        {sub.children && sub.children.length > 0 && (
                                                            <div className="flex flex-col items-center mt-4 relative">
                                                                {/* Line down from parent */}
                                                                <div className="h-4 w-px bg-slate-300 absolute -top-4 left-1/2 transform -translate-x-1/2"></div>

                                                                {/* Horizontal Line covering children */}
                                                                {sub.children.length > 1 && (
                                                                    <div className="absolute top-0 h-px bg-slate-300 w-[calc(100%-4rem)]"></div>
                                                                )}

                                                                <div className="flex items-start gap-4 pt-4">
                                                                    {sub.children.map((child: any) => (
                                                                        <div key={child.id} className="flex flex-col items-center relative">
                                                                            {/* Vertical line to child */}
                                                                            {sub.children.length > 1 && <div className="absolute -top-4 h-4 w-px bg-slate-300"></div>}

                                                                            <div className="flex flex-col items-center p-2 border border-slate-200 bg-white dark:bg-slate-700/50 rounded-lg w-28 shadow-sm hover:shadow-md transition-shadow">
                                                                                <div className="w-10 h-10 rounded-full border border-slate-100 dark:border-slate-600 bg-slate-50 flex items-center justify-center overflow-hidden mb-2">
                                                                                    {child.avatarUrl ? <img src={child.avatarUrl} className="w-full h-full object-cover" /> : <span className="text-xs text-slate-500 font-bold">{child.fullName.charAt(0)}</span>}
                                                                                </div>
                                                                                <p className="text-[10px] font-bold text-slate-700 dark:text-slate-200 text-center leading-tight w-full break-words mb-0.5">{child.fullName}</p>
                                                                                <p className="text-[9px] text-slate-400 text-center truncate w-full">{child.position}</p>
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
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
                                        className="pl-10 rtl:pr-10 w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-black"
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
                                        className="pl-10 rtl:pr-10 w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-black"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">{t('lbl_city')}</label>
                                <input
                                    type="text"
                                    value={city}
                                    onChange={(e) => setCity(e.target.value)}
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-black"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">{t('lbl_district')}</label>
                                <input
                                    type="text"
                                    value={district}
                                    onChange={(e) => setDistrict(e.target.value)}
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-black"
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

            {/* Leave Details Modal */}
            {showLeaveDetails && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm" onClick={() => setShowLeaveDetails(false)}>
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-200 dark:border-slate-700" onClick={e => e.stopPropagation()}>
                        <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center">
                                <CalendarIcon className="w-6 h-6 mr-2 text-emerald-500" />
                                {t('leave_details') || 'Leave Balance Details'}
                            </h3>
                            <button onClick={() => setShowLeaveDetails(false)} className="text-slate-400 hover:text-red-500 transition-colors">
                                <XMarkIcon className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            {leaveBalances.map((leave, idx) => (
                                <div key={idx} className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-xl flex justify-between items-center">
                                    <div>
                                        <p className="font-semibold text-slate-800 dark:text-white text-lg">{t(leave.type.toLowerCase().replace(' ', '_') as any) || leave.type}</p>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">{leave.total} {t('days_available')}</p>
                                    </div>
                                    <div className="text-right">
                                        <span className={`text-2xl font-bold ${leave.color === 'emerald' ? 'text-emerald-500' : leave.color === 'blue' ? 'text-blue-500' : 'text-slate-500'}`}>
                                            {leave.total - leave.taken}
                                        </span>
                                    </div>
                                </div>
                            ))}

                            {/* Expected Vacation Days Metric */}
                            <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/30 p-4 rounded-xl flex justify-between items-center">
                                <div>
                                    <p className="font-semibold text-emerald-800 dark:text-emerald-200 text-lg">{t('lbl_expected_vacation_days') || 'Expected Vacation Days'}</p>
                                    <p className="text-sm text-emerald-600/80 dark:text-emerald-400/80">End of Year Projection</p>
                                </div>
                                <div className="text-right">
                                    <span className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">42</span>
                                </div>
                            </div>
                        </div>
                        <div className="p-4 bg-slate-50 dark:bg-slate-900/50 text-center">
                            <button onClick={() => setShowLeaveDetails(false)} className="px-6 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors">
                                {t('close_modal') || 'Close'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Asset Modal */}
            {showAssetModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm" onClick={() => setShowAssetModal(false)}>
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-slate-200 dark:border-slate-700" onClick={e => e.stopPropagation()}>
                        <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
                            <h3 className="font-bold text-lg text-slate-800 dark:text-white">
                                {editingAssetId ? (t('edit_item') || 'Edit Item') : (t('add_asset') || 'Add Custody Item')}
                            </h3>
                            <button onClick={() => setShowAssetModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                                <XMarkIcon className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="p-6">
                            <form onSubmit={handleAddAsset} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('item_name') || 'Item Name'}</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                        value={newAsset.name}
                                        onChange={e => setNewAsset({ ...newAsset, name: e.target.value })}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('type') || 'Type'}</label>
                                        <select
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                            value={newAsset.type}
                                            onChange={e => setNewAsset({ ...newAsset, type: e.target.value })}
                                        >
                                            <option value="Electronics">{t('asset_electronics')}</option>
                                            <option value="Furniture">{t('asset_furniture')}</option>
                                            <option value="Vehicle">{t('asset_vehicle')}</option>
                                            <option value="Accessory">{t('asset_accessory')}</option>
                                            <option value="Other">{t('asset_other')}</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('date_assigned') || 'Date Assigned'}</label>
                                        <input
                                            type="date"
                                            required
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                            value={newAsset.dateAssigned}
                                            onChange={e => setNewAsset({ ...newAsset, dateAssigned: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('serial_number') || 'Serial Number'}</label>
                                    <input
                                        type="text"
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                        value={newAsset.serialNumber}
                                        onChange={e => setNewAsset({ ...newAsset, serialNumber: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('notes') || 'Notes'}</label>
                                    <textarea
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                        rows={3}
                                        value={newAsset.notes}
                                        onChange={e => setNewAsset({ ...newAsset, notes: e.target.value })}
                                    ></textarea>
                                </div>
                                <div className="pt-2">
                                    <button
                                        type="submit"
                                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded-lg shadow-md transition-colors"
                                    >
                                        {editingAssetId ? (t('update_item') || 'Update Item') : (t('save_item') || 'Save Item')}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};