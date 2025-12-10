import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { Page } from '../types';
import { Employee } from '../types';
import { updateMyProfile } from '../services/mockService';
import {
    UserCircleIcon,
    CameraIcon,
    MapPinIcon,
    PhoneIcon,
    BriefcaseIcon,
    CheckCircleIcon,
    ArrowPathIcon
} from '@heroicons/react/24/outline';

interface ProfileProps {
    onNavigate: (page: Page) => void;
}

export const Profile: React.FC<ProfileProps> = ({ onNavigate }) => {
    const { t } = useLanguage();
    const { currentUser, loadUser } = useAuth(); // Use loadUser

    // State
    const [phoneNumber, setPhoneNumber] = useState('');
    const [nationalAddress, setNationalAddress] = useState('');
    const [city, setCity] = useState('');
    const [district, setDistrict] = useState('');

    // Image State
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    // UI State
    const [loading, setLoading] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');

    // Sync state with Current User when it loads
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
            // Create local preview immediately
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser) return;

        setLoading(true);
        setSuccessMsg('');

        try {
            const formData = new FormData();

            // Append text fields
            formData.append('phoneNumber', phoneNumber);
            formData.append('nationalAddress', nationalAddress);
            formData.append('city', city);
            formData.append('district', district);

            // Append file ONLY if selected
            if (selectedFile) {
                formData.append('avatar', selectedFile);
            }

            // Call API
            await updateMyProfile(currentUser.id, formData);

            // CRITICAL: Fetch fresh user data from DB to update global context (Sidebar, etc.)
            await loadUser();

            setSuccessMsg(t('msg_profile_updated'));

            // If file was uploaded, reset selected file
            if (selectedFile) {
                setSelectedFile(null);
            }

            setTimeout(() => setSuccessMsg(''), 3000);

        } catch (error) {
            console.error("Failed to update profile", error);
        } finally {
            setLoading(false);
        }
    };

    if (!currentUser) return <div className="p-10 flex justify-center"><ArrowPathIcon className="w-8 h-8 animate-spin text-emerald-500" /></div>;

    return (
        <div className="max-w-5xl mx-auto space-y-6 pb-12">
            <div>
                <h2 className="text-3xl font-bold text-black dark:text-white">{t('profile_title')}</h2>
                <p className="text-slate-500 mt-2">{t('profile_subtitle')}</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Column: Avatar & Basic Info */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col items-center text-center">
                        <div className="relative group cursor-pointer mb-4">
                            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-slate-100 shadow-inner bg-slate-50">
                                {previewUrl ? (
                                    // Cache Breaking Logic: Add timestamp to force reload if URL is same
                                    <img
                                        src={`${previewUrl}${previewUrl.startsWith('blob') ? '' : `?t=${new Date().getTime()}`}`}
                                        alt="Profile"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                                        <UserCircleIcon className="w-20 h-20" />
                                    </div>
                                )}
                            </div>
                            {/* Hover Overlay for Upload */}
                            <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <CameraIcon className="w-8 h-8 text-white" />
                            </div>
                            {/* Hidden Input */}
                            <input
                                type="file"
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                accept="image/*"
                                onChange={handleFileChange}
                            />
                        </div>

                        <h3 className="text-xl font-bold text-black dark:text-white">{currentUser?.fullName}</h3>
                        <p className="text-sm text-emerald-600 font-medium mb-1">{currentUser?.position}</p>
                        <p className="text-xs text-slate-400">{currentUser?.department}</p>

                        <div className="mt-6 w-full pt-6 border-t border-slate-100 flex justify-between px-4">
                            <div className="text-center">
                                <p className="text-xs text-slate-400 uppercase">{t('joined')}</p>
                                <p className="font-medium text-slate-700">{currentUser?.joinDate}</p>
                            </div>
                            <div className="text-center">
                                <p className="text-xs text-slate-400 uppercase">{t('id_status')}</p>
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                    {t('status_active')}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Read-only Work Info */}
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                        <h4 className="font-bold text-slate-800 mb-4 flex items-center">
                            <BriefcaseIcon className="w-5 h-5 mr-2 text-slate-400" />
                            {t('employment_details')}
                        </h4>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-slate-500">{t('employee_id')}</span>
                                <span className="font-mono text-slate-700">{currentUser?.id}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">{t('company_id')}</span>
                                <span className="font-mono text-slate-700">{currentUser?.companyId}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">{t('lbl_email')}</span>
                                <span className="text-slate-700">{currentUser?.email}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Edit Form */}
                <div className="lg:col-span-2">
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
                            <h3 className="font-bold text-slate-800 dark:text-white">{t('edit_personal_details')}</h3>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
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
                                        <div className="absolute inset-y-0 left-0 rtl:right-0 rtl:left-auto pl-3 rtl:pr-3 flex items-center pointer-events-none">
                                            <PhoneIcon className="h-5 w-5 text-slate-400" />
                                        </div>
                                        <input
                                            type="text"
                                            value={phoneNumber}
                                            onChange={(e) => setPhoneNumber(e.target.value)}
                                            placeholder="+966 5X XXX XXXX"
                                            dir="ltr"
                                            className="pl-10 rtl:pr-10 w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-black dark:bg-slate-700 dark:text-white dark:border-slate-600"
                                        />
                                    </div>
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-slate-700 mb-1">{t('lbl_national_address')}</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 rtl:right-0 rtl:left-auto pl-3 rtl:pr-3 flex items-center pointer-events-none">
                                            <MapPinIcon className="h-5 w-5 text-slate-400" />
                                        </div>
                                        <input
                                            type="text"
                                            value={nationalAddress}
                                            onChange={(e) => setNationalAddress(e.target.value)}
                                            placeholder="Building 1234, King Fahd Road"
                                            className="pl-10 rtl:pr-10 w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-black dark:bg-slate-700 dark:text-white dark:border-slate-600"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">{t('lbl_city')}</label>
                                    <input
                                        type="text"
                                        value={city}
                                        onChange={(e) => setCity(e.target.value)}
                                        placeholder="Riyadh"
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-black dark:bg-slate-700 dark:text-white dark:border-slate-600"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">{t('lbl_district')}</label>
                                    <input
                                        type="text"
                                        value={district}
                                        onChange={(e) => setDistrict(e.target.value)}
                                        placeholder="Al Olaya"
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-black dark:bg-slate-700 dark:text-white dark:border-slate-600"
                                    />
                                </div>
                            </div>

                            <div className="pt-6 border-t border-slate-100 flex justify-end">
                                <button
                                    type="button"
                                    onClick={() => onNavigate(Page.DASHBOARD)}
                                    className="px-6 py-2 mr-3 rtl:ml-3 rtl:mr-0 rounded-lg border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 transition-colors"
                                >
                                    {t('btn_cancel')}
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-6 py-2 rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-700 shadow-md transition-colors flex items-center disabled:opacity-70"
                                >
                                    {loading && <ArrowPathIcon className="w-4 h-4 animate-spin mr-2 rtl:ml-2" />}
                                    {loading ? t('msg_saving') : t('btn_save_changes')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};