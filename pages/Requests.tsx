import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { ServiceRequest, RequestType, RequestStatus } from '../types';
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
    XMarkIcon
} from '@heroicons/react/24/outline';

export const Requests: React.FC = () => {
    const { t, language } = useLanguage();
    const { currentUser } = useAuth();

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
    }, []);

    const handleCreateSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser) return;

        await createRequest(currentUser.id, currentUser.fullName, newRequestType, formData);
        setShowModal(false);
        setFormData({});
        fetchRequests(); // Refresh
    };

    const handleStatusUpdate = async (id: string, status: RequestStatus) => {
        if (!currentUser) return;
        await updateRequestStatus(id, status, currentUser.id);
        fetchRequests(); // Refresh
    };

    // Filter Logic
    const filteredRequests = requests.filter(r => {
        if (activeTab === 'ALL') return true;
        if (activeTab === 'PENDING') return r.status === RequestStatus.PENDING_MANAGER || r.status === RequestStatus.PENDING_HR;
        return r.status === activeTab;
    });

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
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
            <div className="border-b border-slate-200 dark:border-slate-700">
                <nav className="-mb-px flex space-x-8 rtl:space-x-reverse" aria-label="Tabs">
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
                    <p className="text-slate-500">No requests found.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredRequests.map((req) => (
                        <RequestCard
                            key={req.id}
                            request={req}
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
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200 dark:border-slate-700">
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
                                        setFormData({}); // Reset form data on type change
                                    }}
                                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-black dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
                                >
                                    <option value={RequestType.LEAVE}>{t('req_type_leave')}</option>
                                    <option value={RequestType.ASSET}>{t('req_type_asset')}</option>
                                    <option value={RequestType.PUNCH_CORRECTION}>{t('req_type_punch')}</option>
                                </select>
                            </div>

                            {/* Dynamic Fields based on Type */}
                            {newRequestType === RequestType.LEAVE && (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('req_leave_type_label')}</label>
                                        <select
                                            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-black dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
                                            onChange={e => setFormData({ ...formData, leaveType: e.target.value })}
                                            defaultValue=""
                                        >
                                            <option value="" disabled>{t('org_opt_choose')}</option>
                                            <option value={t('leave_sick')}>{t('leave_sick')}</option>
                                            <option value={t('leave_annual')}>{t('leave_annual')}</option>
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
                                        <textarea className="w-full px-3 py-2 border border-slate-300 rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white text-black" rows={3} onChange={e => setFormData({ ...formData, reason: e.target.value })}></textarea>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('req_attachment')}</label>
                                        <input
                                            type="file"
                                            className="w-full text-sm text-slate-500 dark:text-slate-400
                                                file:mr-4 file:rtl:mr-0 file:rtl:ml-4 file:py-2 file:px-4
                                                file:rounded-full file:border-0
                                                file:text-sm file:font-semibold
                                                file:bg-emerald-50 file:text-emerald-700
                                                hover:file:bg-emerald-100
                                                dark:file:bg-slate-700 dark:file:text-emerald-400"
                                            onChange={e => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    const reader = new FileReader();
                                                    reader.onloadend = () => {
                                                        const result = reader.result as string;
                                                        setFormData({ ...formData, attachmentUrl: result });
                                                    };
                                                    reader.readAsDataURL(file);
                                                }
                                            }}
                                        />
                                    </div>
                                </>
                            )}

                            {newRequestType === RequestType.ASSET && (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('req_item_name')}</label>
                                        <input required type="text" placeholder="e.g. MacBook Pro" className="w-full px-3 py-2 border border-slate-300 rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white text-black" onChange={e => setFormData({ ...formData, itemName: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('req_justification')}</label>
                                        <input required type="text" placeholder="e.g. Current laptop is broken" className="w-full px-3 py-2 border border-slate-300 rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white text-black" onChange={e => setFormData({ ...formData, justification: e.target.value })} />
                                    </div>
                                </>
                            )}

                            {newRequestType === RequestType.PUNCH_CORRECTION && (
                                <>
                                    <div>
                                        <div className="flex justify-between items-center mb-1">
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{t('req_punch_type_label')}</label>
                                            <a
                                                href="/attendance"
                                                target="_blank"
                                                className="text-xs text-emerald-600 hover:text-emerald-700 underline"
                                            >
                                                {t('req_view_attendance')}
                                            </a>
                                        </div>
                                        <select
                                            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-black dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
                                            onChange={e => setFormData({ ...formData, punchType: e.target.value })}
                                            defaultValue=""
                                        >
                                            <option value="" disabled>{t('org_opt_choose')}</option>
                                            <option value="IN">{t('req_punch_in')}</option>
                                            <option value="OUT">{t('req_punch_out')}</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('req_date_label')}</label>
                                        <input required type="date" className="w-full px-3 py-2 border border-slate-300 rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white text-black" onChange={e => setFormData({ ...formData, date: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('req_correct_time')}</label>
                                        <input required type="time" className="w-full px-3 py-2 border border-slate-300 rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white text-black" onChange={e => setFormData({ ...formData, correctTime: e.target.value })} />
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
    onApprove: () => void,
    onReject: () => void,
    t: any
}> = ({ request, onApprove, onReject, t }) => {

    // Icon Mapping
    const getIcon = (type: RequestType) => {
        switch (type) {
            case RequestType.LEAVE: return <BriefcaseIcon className="w-6 h-6 text-blue-500" />;
            case RequestType.ASSET: return <ComputerDesktopIcon className="w-6 h-6 text-purple-500" />;
            case RequestType.PUNCH_CORRECTION: return <FingerPrintIcon className="w-6 h-6 text-orange-500" />;
            case RequestType.LETTER: return <DocumentTextIcon className="w-6 h-6 text-slate-500" />;
            default: return <ClockIcon className="w-6 h-6 text-slate-500" />;
        }
    };

    // Helper for Request Type Label
    const getRequestTypeLabel = (type: RequestType) => {
        switch (type) {
            case RequestType.LEAVE: return t('req_type_leave');
            case RequestType.ASSET: return t('req_type_asset');
            case RequestType.PUNCH_CORRECTION: return t('req_type_punch');
            case RequestType.LETTER: return t('req_type_letter');
            case RequestType.LOAN: return t('req_type_loan');
            default: return type.replace('_', ' ');
        }
    };

    // Status Badge Logic
    const getStatusBadge = (status: RequestStatus) => {
        switch (status) {
            case RequestStatus.APPROVED:
                return <span className="px-2 py-1 text-xs font-bold rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">{t('req_tab_approved')}</span>;
            case RequestStatus.REJECTED:
                return <span className="px-2 py-1 text-xs font-bold rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">{t('req_tab_rejected')}</span>;
            case RequestStatus.PENDING_MANAGER:
            case RequestStatus.PENDING_HR:
                return <span className="px-2 py-1 text-xs font-bold rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">{t('req_tab_pending')}</span>;
            default:
                return null;
        }
    };

    // Dynamic Details Renderer (The JSONB Magic)
    const renderDetails = () => {
        switch (request.type) {
            case RequestType.LEAVE:
                return (
                    <div className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                        <p><span className="font-semibold">{t('req_leave_type_label')}:</span> {request.details.leaveType}</p>
                        <p><span className="font-semibold">{t('req_start_date')}:</span> {request.details.startDate}</p>
                        <p><span className="font-semibold">{t('req_end_date')}:</span> {request.details.endDate}</p>
                        {request.details.attachmentUrl && (
                            <p className="mt-1">
                                <a
                                    href={request.details.attachmentUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-emerald-600 hover:text-emerald-500 font-medium underline flex items-center gap-1"
                                >
                                    {t('req_preview_attachment')}
                                </a>
                            </p>
                        )}
                    </div>
                );
            case RequestType.ASSET:
                return (
                    <div className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                        <p><span className="font-semibold">Item:</span> {request.details.itemName}</p>
                        <p><span className="font-semibold">Reason:</span> {request.details.justification}</p>
                    </div>
                );
            case RequestType.PUNCH_CORRECTION:
                return (
                    <div className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                        <p><span className="font-semibold">{t('req_punch_type_label')}:</span> {request.details.punchType === 'IN' ? t('req_punch_in') : t('req_punch_out')}</p>
                        <p><span className="font-semibold">{t('req_date_label')}:</span> {request.details.date}</p>
                        <p><span className="font-semibold">{t('req_correct_time')}:</span> {request.details.correctTime}</p>
                    </div>
                );
            case RequestType.LETTER:
                return (
                    <div className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                        <p><span className="font-semibold">Letter:</span> {request.details.letterType}</p>
                        <p><span className="font-semibold">To:</span> {request.details.addressee}</p>
                    </div>
                );
            default:
                return <p className="mt-2 text-sm text-slate-500">No details.</p>;
        }
    };

    const isPending = request.status === RequestStatus.PENDING_MANAGER || request.status === RequestStatus.PENDING_HR;

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-5 flex flex-col hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                    <div className="p-2 bg-slate-50 dark:bg-slate-700 rounded-lg">
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