import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useNotifications } from '../contexts/NotificationsContext';
import { useAuth } from '../contexts/AuthContext';
import { ServiceRequest, RequestType, RequestStatus, UserRole } from '../types';
import { getRequests, createRequest, updateRequestStatus } from '../services/mockService';
import {
    PlusIcon,
    CheckCircleIcon,
    XCircleIcon,
    ClockIcon,
    BriefcaseIcon,
    ComputerDesktopIcon,
    FingerPrintIcon,
    DocumentTextIcon,
    XMarkIcon,
    BanknotesIcon,
    ArrowRightOnRectangleIcon,
    UserMinusIcon,
    ShieldCheckIcon
} from '@heroicons/react/24/outline';

export const Requests: React.FC = () => {
    const { t } = useLanguage();
    const { currentUser } = useAuth();
    const { addNotification } = useNotifications();

    const [requests, setRequests] = useState<ServiceRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');

    // Modal State
    const [showModal, setShowModal] = useState(false);
    const [newRequestType, setNewRequestType] = useState<RequestType>(RequestType.LEAVE);

    // Form State
    const [formData, setFormData] = useState<any>({});

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const data = await getRequests();
            setRequests(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
        const interval = setInterval(fetchRequests, 1000 * 30); // Poll every 30s
        return () => clearInterval(interval);
    }, []);

    const handleCreateSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser) return;

        await createRequest(currentUser.id, currentUser.fullName, newRequestType, formData);
        addNotification({
            title: t('req_new'),
            message: t('req_center'), // Using generic title for now or "Request Created"
            type: 'success'
        });
        setShowModal(false);
        setFormData({});
        fetchRequests(); // Refresh
    };

    const handleStatusUpdate = async (id: string, status: RequestStatus) => {
        if (!currentUser) return;
        await updateRequestStatus(id, status, currentUser.id);
        addNotification({
            title: t('req_center'),
            message: `${t('status')}: ${status}`,
            type: status === RequestStatus.APPROVED ? 'success' : 'info'
        });
        fetchRequests(); // Refresh
    };

    // Filter Logic
    const filteredRequests = requests.filter(r => {
        if (activeTab === 'ALL') return true;
        if (activeTab === 'PENDING') return r.status === RequestStatus.PENDING_MANAGER || r.status === RequestStatus.PENDING_GM || r.status === RequestStatus.PENDING_HR;
        return r.status === activeTab;
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-black dark:text-white">{t('req_center')}</h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">{t('req_subtitle')}</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center space-x-2 rtl:space-x-reverse px-4 py-2 bg-emerald-600 rounded-lg text-sm font-medium text-white hover:bg-emerald-700 shadow-sm transition-colors"
                >
                    <PlusIcon className="w-5 h-5" />
                    <span>{t('req_new')}</span>
                </button>
            </div>

            {/* Tabs */}
            <div className="border-b border-slate-200 dark:border-slate-700 overflow-x-auto">
                <nav className="-mb-px flex space-x-8 rtl:space-x-reverse min-w-max" aria-label="Tabs">
                    {[
                        { id: 'ALL', name: t('req_tab_all') },
                        { id: 'PENDING', name: t('req_tab_pending') },
                        { id: 'APPROVED', name: t('req_tab_approved') },
                        { id: 'REJECTED', name: t('req_tab_rejected') },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`
                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors
                ${activeTab === tab.id
                                    ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                                    : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 hover:border-slate-300'}
              `}
                        >
                            {tab.name}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Request Grid */}
            {loading ? (
                <div className="flex justify-center p-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
                </div>
            ) : filteredRequests.length === 0 ? (
                <div className="text-center p-12 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                    <p className="text-slate-500">{t('no_requests_found') || "No requests found."}</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredRequests.map((req) => (
                        <RequestCard
                            key={req.id}
                            request={req}
                            currentUser={currentUser}
                            onApprove={() => handleStatusUpdate(req.id, RequestStatus.APPROVED)}
                            onReject={() => handleStatusUpdate(req.id, RequestStatus.REJECTED)}
                            t={t}
                        />
                    ))}
                </div>
            )}

            {/* New Request Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200 dark:border-slate-700 max-h-[90vh] overflow-y-auto">
                        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
                            <h3 className="font-bold text-lg text-black dark:text-white">{t('req_modal_title')}</h3>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                                <XMarkIcon className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateSubmit} className="p-6 space-y-4">
                            {/* Request Type Selector */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('req_type')}</label>
                                <select
                                    value={newRequestType}
                                    onChange={(e) => {
                                        setNewRequestType(e.target.value as RequestType);
                                        setFormData({}); // Reset form data
                                    }}
                                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-black dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
                                >
                                    <option value={RequestType.LEAVE}>{t('req_type_vacation') || "Vacation"}</option>
                                    <option value={RequestType.ASSET}>{t('req_type_asset')}</option>
                                    <option value={RequestType.LOAN}>{t('req_type_loan')}</option>
                                    <option value={RequestType.PUNCH_CORRECTION}>{t('req_type_punch')}</option>
                                    <option value={RequestType.CLEARANCE}>{t('req_type_clearance')}</option>
                                    <option value={RequestType.RESIGNATION}>{t('req_type_resignation')}</option>
                                    <option value={RequestType.CONTRACT_NON_RENEWAL}>{t('req_type_contract_non_renewal')}</option>
                                    <option value={RequestType.AUTHORIZATION}>{t('req_type_authorization')}</option>
                                    <option value={RequestType.LETTER}>{t('req_type_letter')}</option>
                                    <option value={RequestType.PERMISSION}>{t('req_type_permission')}</option>
                                </select>
                            </div>

                            {/* --- DYNAMIC FORM FIELDS --- */}

                            {/* 1. VACATION (LEAVE) */}
                            {newRequestType === RequestType.LEAVE && (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('req_leave_type_label')}</label>
                                        <select
                                            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-black dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
                                            onChange={e => setFormData({ ...formData, leaveType: e.target.value })}
                                            required
                                        >
                                            <option value="">{t('org_opt_choose')}</option>
                                            <option value={t('leave_annual')}>{t('leave_annual')}</option>
                                            <option value={t('leave_sick')}>{t('leave_sick')}</option>
                                            <option value={t('leave_unpaid')}>{t('leave_unpaid')}</option>
                                            <option value={t('leave_marriage')}>{t('leave_marriage')}</option>
                                            <option value={t('leave_bereavement')}>{t('leave_bereavement')}</option>
                                        </select>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('req_start_date')}</label>
                                            <input required type="date" className="w-full px-3 py-2 border border-slate-300 rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white text-black" onChange={e => setFormData({ ...formData, startDate: e.target.value })} />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('req_end_date')}</label>
                                            <input required type="date" className="w-full px-3 py-2 border border-slate-300 rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white text-black" onChange={e => setFormData({ ...formData, endDate: e.target.value })} />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('req_reason')}</label>
                                        <textarea className="w-full px-3 py-2 border border-slate-300 rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white text-black" rows={2} onChange={e => setFormData({ ...formData, reason: e.target.value })}></textarea>
                                    </div>
                                </>
                            )}

                            {/* 2. ASSETS */}
                            {newRequestType === RequestType.ASSET && (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('req_item_name')}</label>
                                        <input required type="text" placeholder="e.g. Laptop, Mobile" className="w-full px-3 py-2 border border-slate-300 rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white text-black" onChange={e => setFormData({ ...formData, itemName: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('req_serial_number') || "Serial Number (Optional)"}</label>
                                        <input type="text" className="w-full px-3 py-2 border border-slate-300 rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white text-black" onChange={e => setFormData({ ...formData, serialNumber: e.target.value })} />
                                    </div>
                                </>
                            )}

                            {/* 3. LOAN */}
                            {newRequestType === RequestType.LOAN && (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('req_amount')}</label>
                                        <input required type="number" min="0" className="w-full px-3 py-2 border border-slate-300 rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white text-black" onChange={e => setFormData({ ...formData, amount: parseFloat(e.target.value) })} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('req_reason')}</label>
                                        <input required type="text" className="w-full px-3 py-2 border border-slate-300 rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white text-black" onChange={e => setFormData({ ...formData, reason: e.target.value })} />
                                    </div>
                                </>
                            )}

                            {/* 4. PUNCH CORRECTION */}
                            {newRequestType === RequestType.PUNCH_CORRECTION && (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('req_date_label')}</label>
                                        <input required type="date" className="w-full px-3 py-2 border border-slate-300 rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white text-black" onChange={e => setFormData({ ...formData, date: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('req_reason')}</label>
                                        <textarea required className="w-full px-3 py-2 border border-slate-300 rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white text-black" placeholder="Explain why correction is needed..." onChange={e => setFormData({ ...formData, reason: e.target.value })}></textarea>
                                    </div>
                                </>
                            )}

                            {/* 5. CLEARANCE */}
                            {newRequestType === RequestType.CLEARANCE && (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('req_last_working_day')}</label>
                                        <input required type="date" className="w-full px-3 py-2 border border-slate-300 rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white text-black" onChange={e => setFormData({ ...formData, lastWorkingDay: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('req_notes')}</label>
                                        <textarea className="w-full px-3 py-2 border border-slate-300 rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white text-black" onChange={e => setFormData({ ...formData, notes: e.target.value })}></textarea>
                                    </div>
                                </>
                            )}

                            {/* 6. RESIGNATION */}
                            {newRequestType === RequestType.RESIGNATION && (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('req_resignation_date')}</label>
                                        <input required type="date" className="w-full px-3 py-2 border border-slate-300 rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white text-black" onChange={e => setFormData({ ...formData, resignationDate: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('req_reason')}</label>
                                        <textarea required className="w-full px-3 py-2 border border-slate-300 rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white text-black" onChange={e => setFormData({ ...formData, reason: e.target.value })}></textarea>
                                    </div>
                                </>
                            )}

                            {/* 7. CONTRACT NON-RENEWAL */}
                            {newRequestType === RequestType.CONTRACT_NON_RENEWAL && (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('req_requested_date')}</label>
                                        <input required type="date" className="w-full px-3 py-2 border border-slate-300 rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white text-black" onChange={e => setFormData({ ...formData, requestedDate: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('req_reason')}</label>
                                        <textarea required className="w-full px-3 py-2 border border-slate-300 rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white text-black" onChange={e => setFormData({ ...formData, reason: e.target.value })}></textarea>
                                    </div>
                                </>
                            )}

                            {/* 8. AUTHORIZATION */}
                            {newRequestType === RequestType.AUTHORIZATION && (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('req_delegate_name')}</label>
                                        <input required type="text" className="w-full px-3 py-2 border border-slate-300 rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white text-black" onChange={e => setFormData({ ...formData, delegateName: e.target.value })} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('req_start_date')}</label>
                                            <input required type="date" className="w-full px-3 py-2 border border-slate-300 rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white text-black" onChange={e => setFormData({ ...formData, startDate: e.target.value })} />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('req_end_date')}</label>
                                            <input required type="date" className="w-full px-3 py-2 border border-slate-300 rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white text-black" onChange={e => setFormData({ ...formData, endDate: e.target.value })} />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('req_reason')}</label>
                                        <input required type="text" className="w-full px-3 py-2 border border-slate-300 rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white text-black" onChange={e => setFormData({ ...formData, reason: e.target.value })} />
                                    </div>
                                </>
                            )}

                            {/* 9. LETTER */}
                            {newRequestType === RequestType.LETTER && (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('req_letter_type')}</label>
                                        <input required type="text" placeholder="e.g. Salary Certificate" className="w-full px-3 py-2 border border-slate-300 rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white text-black" onChange={e => setFormData({ ...formData, letterType: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('req_purpose')}</label>
                                        <input required type="text" placeholder="e.g. To whom it may concern / Bank" className="w-full px-3 py-2 border border-slate-300 rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white text-black" onChange={e => setFormData({ ...formData, purpose: e.target.value })} />
                                    </div>
                                </>
                            )}

                            {/* 10. PERMISSION */}
                            {newRequestType === RequestType.PERMISSION && (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('req_date_label')}</label>
                                        <input required type="date" className="w-full px-3 py-2 border border-slate-300 rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white text-black" onChange={e => setFormData({ ...formData, date: e.target.value })} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('req_start_time')}</label>
                                            <input required type="time" className="w-full px-3 py-2 border border-slate-300 rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white text-black" onChange={e => setFormData({ ...formData, startTime: e.target.value })} />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('req_end_time')}</label>
                                            <input required type="time" className="w-full px-3 py-2 border border-slate-300 rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white text-black" onChange={e => setFormData({ ...formData, endTime: e.target.value })} />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('req_reason')}</label>
                                        <input required type="text" className="w-full px-3 py-2 border border-slate-300 rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white text-black" onChange={e => setFormData({ ...formData, reason: e.target.value })} />
                                    </div>
                                </>
                            )}

                            <div className="pt-4 flex justify-end space-x-3 rtl:space-x-reverse">
                                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:border-slate-600 dark:hover:bg-slate-700">
                                    {t('req_cancel')}
                                </button>
                                <button type="submit" className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 shadow-sm">
                                    {t('req_submit')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

// --- Request Card Component ---
const RequestCard: React.FC<{
    request: ServiceRequest,
    currentUser: any,
    onApprove: () => void,
    onReject: () => void,
    t: any
}> = ({ request, currentUser, onApprove, onReject, t }) => {

    const getIcon = (type: RequestType) => {
        switch (type) {
            case RequestType.LEAVE: return <BriefcaseIcon className="w-6 h-6 text-blue-500" />;
            case RequestType.ASSET: return <ComputerDesktopIcon className="w-6 h-6 text-purple-500" />;
            case RequestType.LOAN: return <BanknotesIcon className="w-6 h-6 text-green-500" />;
            case RequestType.PUNCH_CORRECTION: return <FingerPrintIcon className="w-6 h-6 text-orange-500" />;
            case RequestType.CLEARANCE: return <ArrowRightOnRectangleIcon className="w-6 h-6 text-red-500" />;
            case RequestType.RESIGNATION: return <UserMinusIcon className="w-6 h-6 text-red-600" />;
            case RequestType.CONTRACT_NON_RENEWAL: return <DocumentTextIcon className="w-6 h-6 text-gray-500" />;
            case RequestType.AUTHORIZATION: return <ShieldCheckIcon className="w-6 h-6 text-indigo-500" />;
            case RequestType.LETTER: return <DocumentTextIcon className="w-6 h-6 text-slate-500" />;
            case RequestType.PERMISSION: return <ClockIcon className="w-6 h-6 text-yellow-500" />;
            default: return <ClockIcon className="w-6 h-6 text-slate-500" />;
        }
    };

    const getRequestTypeLabel = (type: RequestType) => {
        switch (type) {
            case RequestType.LEAVE: return t('req_type_vacation');
            case RequestType.ASSET: return t('req_type_asset');
            case RequestType.LOAN: return t('req_type_loan');
            case RequestType.PUNCH_CORRECTION: return t('req_type_punch');
            case RequestType.CLEARANCE: return t('req_type_clearance');
            case RequestType.RESIGNATION: return t('req_type_resignation');
            case RequestType.CONTRACT_NON_RENEWAL: return t('req_type_contract_non_renewal');
            case RequestType.AUTHORIZATION: return t('req_type_authorization');
            case RequestType.LETTER: return t('req_type_letter');
            case RequestType.PERMISSION: return t('req_type_permission');
            default: return (type as string).replace('_', ' ');
        }
    };

    const getStatusBadge = (status: RequestStatus) => {
        switch (status) {
            case RequestStatus.APPROVED:
                return <span className="px-2 py-1 text-xs font-bold rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">{t('req_status_approved')}</span>;
            case RequestStatus.REJECTED:
                return <span className="px-2 py-1 text-xs font-bold rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">{t('req_tab_rejected')}</span>;
            case RequestStatus.PENDING_MANAGER:
                return <span className="px-2 py-1 text-xs font-bold rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">{t('req_status_pending_manager')}</span>;
            case RequestStatus.PENDING_GM:
                return <span className="px-2 py-1 text-xs font-bold rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">{t('req_status_pending_gm')}</span>;
            case RequestStatus.PENDING_HR:
                return <span className="px-2 py-1 text-xs font-bold rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">{t('req_status_pending_hr')}</span>;
            default:
                return null;
        }
    };

    const renderDetails = () => {
        const d = request.details;
        switch (request.type) {
            case RequestType.LEAVE:
                return (
                    <div className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                        <p><span className="font-semibold">{t('req_leave_type_label')}:</span> {d.leaveType}</p>
                        <p><span className="font-semibold">{t('req_start_date')}:</span> {d.startDate}</p>
                        <p><span className="font-semibold">{t('req_end_date')}:</span> {d.endDate}</p>
                    </div>
                );
            case RequestType.ASSET:
                return (
                    <div className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                        <p><span className="font-semibold">{t('req_item_name')}:</span> {d.itemName}</p>
                        {d.serialNumber && <p><span className="font-semibold">{t('req_serial_number')}:</span> {d.serialNumber}</p>}
                    </div>
                );
            case RequestType.LOAN:
                return (
                    <div className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                        <p><span className="font-semibold">{t('req_amount')}:</span> {d.amount}</p>
                        <p><span className="font-semibold">{t('req_reason')}:</span> {d.reason}</p>
                    </div>
                )
            case RequestType.PUNCH_CORRECTION:
                return (
                    <div className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                        <p><span className="font-semibold">{t('req_date_label')}:</span> {d.date}</p>
                        <p><span className="font-semibold">{t('req_reason')}:</span> {d.reason}</p>
                    </div>
                );
            case RequestType.CLEARANCE:
                return (
                    <div className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                        <p><span className="font-semibold">{t('req_last_working_day')}:</span> {d.lastWorkingDay}</p>
                        <p>{d.notes}</p>
                    </div>
                );
            case RequestType.RESIGNATION:
                return (
                    <div className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                        <p><span className="font-semibold">{t('req_resignation_date')}:</span> {d.resignationDate}</p>
                        <p>{d.reason}</p>
                    </div>
                );
            case RequestType.CONTRACT_NON_RENEWAL:
                return (
                    <div className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                        <p><span className="font-semibold">{t('req_requested_date')}:</span> {d.requestedDate}</p>
                        <p>{d.reason}</p>
                    </div>
                );
            case RequestType.AUTHORIZATION:
                return (
                    <div className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                        <p><span className="font-semibold">{t('req_delegate_name')}:</span> {d.delegateName}</p>
                        <p>{d.startDate} - {d.endDate}</p>
                    </div>
                );
            case RequestType.LETTER:
                return (
                    <div className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                        <p><span className="font-semibold">{t('req_letter_type')}:</span> {d.letterType}</p>
                        <p>{d.purpose}</p>
                    </div>
                );
            case RequestType.PERMISSION:
                return (
                    <div className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                        <p><span className="font-semibold">{t('req_date_label')}:</span> {d.date}</p>
                        <p>{d.startTime} - {d.endTime}</p>
                        <p>{d.reason}</p>
                    </div>
                );
            default:
                return <p className="mt-2 text-sm text-slate-500">No details.</p>;
        }
    };

    const canApprove = () => {
        if (!currentUser) return false;

        // 1. SELF-APPROVAL PREVENTION
        if (request.userId === currentUser.id) return false;

        // 2. ROLE-BASED WORKFLOW
        switch (request.status) {
            case RequestStatus.PENDING_MANAGER:
                // Only Dept Managers (or CEO acting as manager)
                return currentUser.role === UserRole.DEPT_MANAGER || currentUser.role === UserRole.MANAGER;

            case RequestStatus.PENDING_GM:
                // Only General Manager (CEO)
                return currentUser.role === UserRole.MANAGER;

            case RequestStatus.PENDING_HR:
                // Only HR (Admin)
                return currentUser.role === UserRole.ADMIN;

            default:
                return false;
        }
    };

    const isPending = canApprove();

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-5 flex flex-col hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                    <div className={`p-2 rounded-lg 
                        ${request.type === RequestType.RESIGNATION ? 'bg-red-50 text-red-600' :
                            request.type === RequestType.LEAVE ? 'bg-blue-50 text-blue-600' : 'bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
                        {getIcon(request.type)}
                    </div>
                    <div>
                        <h4 className="font-bold text-black dark:text-white">{getRequestTypeLabel(request.type)}</h4>
                        <p className="text-xs text-slate-500">{new Date(request.createdAt).toLocaleDateString()}</p>
                    </div>
                </div>
                {getStatusBadge(request.status)}
            </div>

            <div className="mt-4 border-t border-slate-100 dark:border-slate-700 pt-3 flex-1">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{t('req_label_requester')}</p>
                <p className="text-sm font-medium text-black dark:text-white mb-3">{request.userName}</p>

                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t('req_label_details')}</p>
                {renderDetails()}
            </div>

            {/* Approval Actions (Simulated Role) */}
            {isPending && (
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700 flex space-x-3 rtl:space-x-reverse">
                    <button
                        onClick={onApprove}
                        className="flex-1 py-2 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-sm font-medium transition-colors flex justify-center items-center"
                    >
                        <CheckCircleIcon className="w-4 h-4 mr-1 rtl:ml-1" />
                        {t('req_approve')}
                    </button>
                    <button
                        onClick={onReject}
                        className="flex-1 py-2 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 text-sm font-medium transition-colors flex justify-center items-center"
                    >
                        <XCircleIcon className="w-4 h-4 mr-1 rtl:ml-1" />
                        {t('req_reject')}
                    </button>
                </div>
            )}
        </div>
    );
};