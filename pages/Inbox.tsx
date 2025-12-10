import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { InboxIcon, PaperAirplaneIcon, UserCircleIcon, MagnifyingGlassIcon, PaperClipIcon, XMarkIcon, DocumentIcon, PhotoIcon, ArrowDownTrayIcon, ArrowsPointingOutIcon, FaceSmileIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import { getEmployees } from '../services/mockService';
import { Employee, Group } from '../types';
import EmojiPicker, { EmojiClickData, Theme } from 'emoji-picker-react';

interface Message {
    text: string;
    isMe: boolean;
    time: string;
    attachment?: {
        type: 'image' | 'video' | 'pdf' | 'file';
        url: string;
        name: string;
    };
}

type ChatSession =
    | { type: 'employee'; data: Employee }
    | { type: 'group'; data: Group };

export const Inbox: React.FC = () => {
    const { t } = useLanguage();
    const [employees, setEmployees] = useState<Employee[]>([]);

    // Chat Selection State
    const [selectedChat, setSelectedChat] = useState<ChatSession | null>(null);
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null); // Kept for backward compat if needed, but primarily using selectedChat

    // Group State
    const [groups, setGroups] = useState<Group[]>([]);
    const [showGroupModal, setShowGroupModal] = useState(false);
    const [newGroupData, setNewGroupData] = useState({ name: '', limit: 5 });
    const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]); // New state for selection
    const [memberSearchTerm, setMemberSearchTerm] = useState('');

    const [searchTerm, setSearchTerm] = useState('');
    const [messageInput, setMessageInput] = useState('');

    // File Upload State
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Emoji Picker State
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);

    // Mock Messages State
    const [messages, setMessages] = useState<Record<string, Message[]>>({});

    // Lightbox State
    const [fullscreenMedia, setFullscreenMedia] = useState<{ url: string; type: 'image' | 'video' | 'pdf' } | null>(null);

    useEffect(() => {
        getEmployees().then(data => setEmployees(data));
    }, []);

    const filteredEmployees = employees.filter(emp =>
        emp.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.department.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleCreateGroup = (e: React.FormEvent) => {
        e.preventDefault();
        const newGroup: Group = {
            id: `GROUP-${Date.now()}`,
            name: newGroupData.name,
            limit: selectedMemberIds.length + 1, // +1 for self
            members: selectedMemberIds.length + 1, // Self + selected
            memberIds: selectedMemberIds,
            isTemporary: true
        };
        setGroups([...groups, newGroup]);
        setNewGroupData({ name: '', limit: 5 });
        setSelectedMemberIds([]);
        setMemberSearchTerm('');
        setShowGroupModal(false);
        setSelectedChat({ type: 'group', data: newGroup });
        setSelectedEmployee(null);
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const onEmojiClick = (emojiData: EmojiClickData) => {
        setMessageInput(prev => prev + emojiData.emoji);
        // setShowEmojiPicker(false); // Keep open for multiple emojis
    };

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if ((!messageInput.trim() && !selectedFile) || !selectedChat) return;

        let attachment: Message['attachment'] = undefined;
        if (selectedFile) {
            let type: Message['attachment']['type'] = 'file';
            if (selectedFile.type.startsWith('image/')) type = 'image';
            else if (selectedFile.type.startsWith('video/')) type = 'video';
            else if (selectedFile.type === 'application/pdf') type = 'pdf';

            attachment = {
                type,
                url: URL.createObjectURL(selectedFile),
                name: selectedFile.name
            };
        }

        const newMessage: Message = {
            text: messageInput,
            isMe: true,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            attachment
        };

        const chatId = selectedChat.type === 'employee' ? (selectedChat.data as Employee).id : (selectedChat.data as Group).id;

        setMessages(prev => ({
            ...prev,
            [chatId]: [...(prev[chatId] || []), newMessage]
        }));

        setMessageInput('');
        setSelectedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';

        // Simulate Reply only for 1:1 chats for now
        if (selectedChat.type === 'employee') {
            setTimeout(() => {
                const reply: Message = { text: "Received! Will take a look.", isMe: false, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
                setMessages(prev => ({
                    ...prev,
                    [chatId]: [...(prev[chatId] || []), reply]
                }));
            }, 1500);
        }
    };

    const handleEndConversation = () => {
        if (!selectedChat) return;

        if (selectedChat.type === 'group') {
            // Remove the group
            setGroups(prev => prev.filter(g => g.id !== (selectedChat.data as Group).id));
        }

        // For both employee and group, deselect the chat
        setSelectedChat(null);
        setSelectedEmployee(null);
    };

    const handleDownload = (url: string, filename: string) => {
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    const currentMessages = selectedChat ? (messages[selectedChat.data.id] || []) : [];

    return (
        <div className="space-y-6 animate-fadeIn h-[calc(100vh-140px)] flex flex-col">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold text-black dark:text-white">{t('inbox')}</h2>
                <p className="text-slate-500 text-sm">{t('inbox_desc')}</p>
            </div>

            <div className="flex flex-1 gap-6 min-h-0">
                {/* Sidebar - Employee & Group List */}
                <div className="w-80 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col overflow-hidden transition-colors">
                    <div className="p-4 border-b border-slate-100 dark:border-slate-700 space-y-4">
                        <button
                            onClick={() => setShowGroupModal(true)}
                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-4 rounded-lg transition-colors shadow-sm flex justify-center items-center gap-2"
                        >
                            <UserGroupIcon className="w-5 h-5" />
                            {t('chat_create_group')}
                        </button>
                        <div className="relative">
                            <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 rtl:right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder={t('search_employees')}
                                className="w-full pl-10 rtl:pr-10 rtl:pl-4 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:border-emerald-500 transition-colors dark:text-white"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="overflow-y-auto flex-1 p-2 space-y-1 custom-scrollbar">
                        {/* Groups Section */}
                        {groups.length > 0 && (
                            <div className="mb-4">
                                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 mb-2">{t('chat_create_group')}</p>
                                {groups.map(group => (
                                    <button
                                        key={group.id}
                                        onClick={() => { setSelectedChat({ type: 'group', data: group }); setSelectedEmployee(null); }}
                                        className={`w-full flex items-center space-x-3 rtl:space-x-reverse px-3 py-3 rounded-lg transition-all ${selectedChat?.type === 'group' && selectedChat.data.id === group.id ? 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800' : 'hover:bg-slate-50 dark:hover:bg-slate-700/50 border border-transparent'}`}
                                    >
                                        <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                                            <UserGroupIcon className="w-6 h-6" />
                                        </div>
                                        <div className="flex-1 min-w-0 text-start">
                                            <h4 className={`text-sm font-semibold truncate ${selectedChat?.type === 'group' && selectedChat.data.id === group.id ? 'text-emerald-900 dark:text-emerald-300' : 'text-slate-900 dark:text-white'}`}>{group.name}</h4>
                                            <p className="text-xs text-slate-500 truncate">{group.members} / {group.limit} Members</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Employees Section */}
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 mb-2">{t('request_type_employees') || 'Employees'}</p>
                        {filteredEmployees.map(emp => (
                            <button
                                key={emp.id}
                                onClick={() => { setSelectedChat({ type: 'employee', data: emp }); setSelectedEmployee(emp); }}
                                className={`w-full flex items-center space-x-3 rtl:space-x-reverse px-3 py-3 rounded-lg transition-all ${selectedChat?.type === 'employee' && selectedChat.data.id === emp.id ? 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800' : 'hover:bg-slate-50 dark:hover:bg-slate-700/50 border border-transparent'}`}
                            >
                                {emp.avatarUrl ? (
                                    <img src={emp.avatarUrl} alt={emp.fullName} className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-600" />
                                ) : (
                                    <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-500">
                                        <UserCircleIcon className="w-6 h-6" />
                                    </div>
                                )}
                                <div className="flex-1 min-w-0 text-start">
                                    <h4 className={`text-sm font-semibold truncate ${selectedChat?.type === 'employee' && selectedChat.data.id === emp.id ? 'text-emerald-900 dark:text-emerald-300' : 'text-slate-900 dark:text-white'}`}>{emp.fullName}</h4>
                                    <p className="text-xs text-slate-500 truncate">{emp.position}</p>
                                </div>
                                {selectedChat?.type === 'employee' && selectedChat.data.id === emp.id && <div className="w-2 h-2 rounded-full bg-emerald-500"></div>}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Chat Area */}
                <div className="flex-1 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden transition-colors flex flex-col relative">
                    {selectedChat ? (
                        <>
                            {/* Chat Header */}
                            <div className="p-4 border-b border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 flex items-center justify-between sticky top-0 z-10">
                                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                                    {selectedChat.type === 'employee' ? (
                                        <div className="relative">
                                            <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 font-bold overflow-hidden">
                                                {(selectedChat.data as Employee).avatarUrl ? (
                                                    <img src={(selectedChat.data as Employee).avatarUrl} alt={(selectedChat.data as Employee).fullName} className="w-full h-full object-cover" />
                                                ) : (
                                                    (selectedChat.data as Employee).fullName.charAt(0)
                                                )}
                                            </div>
                                            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-slate-800 rounded-full"></span>
                                        </div>
                                    ) : (
                                        <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                                            <UserGroupIcon className="w-6 h-6" />
                                        </div>
                                    )}

                                    <div>
                                        <h3 className="font-bold text-black dark:text-white">
                                            {selectedChat.type === 'employee' ? (selectedChat.data as Employee).fullName : (selectedChat.data as Group).name}
                                        </h3>
                                        {selectedChat.type === 'employee' ? (
                                            <div className="flex items-center space-x-1 rtl:space-x-reverse">
                                                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                                <span className="text-xs text-slate-500">{t('online')}</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center space-x-1 rtl:space-x-reverse">
                                                <span className="text-xs text-slate-500">
                                                    Temporarily Active • {(selectedChat.data as Group).members} / {(selectedChat.data as Group).limit} members
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                {selectedChat.type === 'group' && (
                                    <button
                                        onClick={handleEndConversation}
                                        className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                                    >
                                        {t('end_conversation')}
                                    </button>
                                )}
                            </div>

                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/30 dark:bg-black/20 custom-scrollbar">

                                <div className="flex justify-center my-4">
                                    <span className="bg-slate-100 dark:bg-slate-700/50 text-slate-500 text-xs px-3 py-1 rounded-full">{t('today')}</span>
                                </div>

                                {currentMessages.length === 0 && (
                                    <div className="text-center text-slate-400 mt-10">
                                        <p>{t('start_conversation')} {selectedChat.type === 'employee' ? (selectedChat.data as Employee).fullName.split(' ')[0] : (selectedChat.data as Group).name} 👋</p>
                                        {selectedChat.type === 'group' && (
                                            <p className="text-xs mt-2 text-amber-500">This temporary group will be deleted when empty.</p>
                                        )}
                                    </div>
                                )}

                                {currentMessages.map((msg, idx) => (
                                    <div key={idx} className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[70%] rounded-2xl p-2 text-sm shadow-sm ${msg.isMe
                                            ? 'bg-emerald-600 text-white rounded-br-none'
                                            : 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 rounded-bl-none border border-slate-100 dark:border-slate-600'
                                            }`}>
                                            {/* Attachment Rendering */}
                                            {msg.attachment && (
                                                <div className="mb-2 rounded-lg overflow-hidden group relative">
                                                    {msg.attachment.type === 'image' && (
                                                        <div className="relative cursor-pointer" onClick={() => setFullscreenMedia({ url: msg.attachment!.url, type: 'image' })}>
                                                            <img src={msg.attachment.url} alt="attachment" className="max-w-full max-h-60 object-cover rounded-lg" />
                                                            <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                                <ArrowsPointingOutIcon className="w-8 h-8 text-white drop-shadow-lg" />
                                                            </div>
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); handleDownload(msg.attachment!.url, msg.attachment!.name); }}
                                                                className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-black/70 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                                                title={t('download')}
                                                            >
                                                                <ArrowDownTrayIcon className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    )}
                                                    {msg.attachment.type === 'video' && (
                                                        <div className="relative group">
                                                            <video src={msg.attachment.url} controls className="max-w-full max-h-60 rounded-lg" />
                                                            <button
                                                                onClick={() => setFullscreenMedia({ url: msg.attachment!.url, type: 'video' })}
                                                                className="absolute top-2 left-2 p-1.5 bg-black/50 hover:bg-black/70 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                                                title={t('expand')}
                                                            >
                                                                <ArrowsPointingOutIcon className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    )}
                                                    {msg.attachment.type === 'pdf' && (
                                                        <div className="relative group rounded-lg overflow-hidden border border-slate-200 dark:border-slate-600 bg-white">
                                                            <iframe src={msg.attachment.url} className="w-full h-60 border-0 pointer-events-none" title="PDF Preview" />
                                                            <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer" onClick={() => setFullscreenMedia({ url: msg.attachment!.url, type: 'pdf' })}>
                                                                <ArrowsPointingOutIcon className="w-8 h-8 text-slate-800 drop-shadow-lg bg-white/50 rounded-full p-1" />
                                                            </div>
                                                            <div className="absolute top-0 w-full bg-slate-50 dark:bg-slate-800 p-2 flex items-center justify-between border-b border-slate-200 dark:border-slate-600">
                                                                <div className="flex items-center space-x-2 overflow-hidden">
                                                                    <DocumentIcon className="w-4 h-4 text-red-500" />
                                                                    <span className="text-xs text-slate-700 dark:text-slate-200 truncate">{msg.attachment.name}</span>
                                                                </div>
                                                                <button
                                                                    onClick={(e) => { e.stopPropagation(); handleDownload(msg.attachment!.url, msg.attachment!.name); }}
                                                                    className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors text-slate-600 dark:text-slate-300"
                                                                    title={t('download')}
                                                                >
                                                                    <ArrowDownTrayIcon className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}
                                                    {msg.attachment.type === 'file' && (
                                                        <div className="flex items-center justify-between space-x-2 bg-black/10 dark:bg-white/10 p-3 rounded-lg">
                                                            <div className="flex items-center space-x-2 overflow-hidden">
                                                                <DocumentIcon className="w-5 h-5 flex-shrink-0" />
                                                                <span className="underline truncate text-xs">{msg.attachment.name}</span>
                                                            </div>
                                                            <button
                                                                onClick={() => handleDownload(msg.attachment!.url, msg.attachment!.name)}
                                                                className="p-1 hover:bg-black/10 dark:hover:bg-white/10 rounded transition-colors"
                                                                title={t('download')}
                                                            >
                                                                <ArrowDownTrayIcon className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {msg.text && <p className="px-2">{msg.text}</p>}
                                            <p className={`text-[10px] mt-1 text-end px-2 ${msg.isMe ? 'text-emerald-100' : 'text-slate-400'}`}>{msg.time}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Input Area */}
                            <div className="p-4 bg-white dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700 relative">
                                {/* Emoji Picker Popover */}
                                {showEmojiPicker && (
                                    <div className="absolute bottom-full right-4 mb-2 z-20 shadow-xl rounded-lg overflow-hidden animate-fadeIn">
                                        {/* @ts-ignore */}
                                        <EmojiPicker onEmojiClick={onEmojiClick} theme={Theme.AUTO} />
                                    </div>
                                )}

                                {/* File Preview */}
                                {selectedFile && (
                                    <div className="mb-2 p-2 bg-slate-50 dark:bg-slate-900 rounded-lg flex items-center justify-between border border-slate-100 dark:border-slate-700">
                                        <div className="flex items-center space-x-2">
                                            {selectedFile.type.startsWith('image/') ? (
                                                <PhotoIcon className="w-5 h-5 text-emerald-500" />
                                            ) : selectedFile.type === 'application/pdf' ? (
                                                <DocumentIcon className="w-5 h-5 text-red-500" />
                                            ) : (
                                                <DocumentIcon className="w-5 h-5 text-blue-500" />
                                            )}
                                            <span className="text-xs text-slate-600 dark:text-slate-300 truncate max-w-[200px]">{selectedFile.name}</span>
                                        </div>
                                        <button onClick={() => setSelectedFile(null)} className="text-slate-400 hover:text-red-500">
                                            <XMarkIcon className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}

                                <form onSubmit={handleSendMessage} className="flex space-x-2 rtl:space-x-reverse items-center">
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        hidden
                                        onChange={handleFileSelect}
                                        accept="image/*,video/*,application/pdf,.doc,.docx"
                                    />

                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors"
                                        title={t('attach_file')}
                                    >
                                        <PaperClipIcon className="w-6 h-6" />
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                        className={`p-2 rounded-full transition-colors ${showEmojiPicker ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20' : 'text-slate-400 hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                                        title={t('add_emoji')}
                                    >
                                        <FaceSmileIcon className="w-6 h-6" />
                                    </button>

                                    <input
                                        type="text"
                                        value={messageInput}
                                        onChange={(e) => setMessageInput(e.target.value)}
                                        onClick={() => setShowEmojiPicker(false)} // Close picker when typing
                                        placeholder={t('type_message')}
                                        className="flex-1 bg-slate-100 dark:bg-slate-900 border-0 rounded-full px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500 dark:text-white focus:outline-none transition-all"
                                    />
                                    <button
                                        type="submit"
                                        disabled={!messageInput.trim() && !selectedFile}
                                        className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white p-3 rounded-full transition-colors shadow-sm"
                                    >
                                        <PaperAirplaneIcon className="w-5 h-5 rtl:-rotate-90" />
                                    </button>
                                </form>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                            <InboxIcon className="w-16 h-16 mb-4 opacity-20" />
                            <p className="text-lg font-medium text-slate-500 dark:text-slate-400">{t('select_employee_to_chat')}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Fullscreen Media Modal */}
            {fullscreenMedia && (
                <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn" onClick={() => setFullscreenMedia(null)}>
                    <button className="absolute top-4 right-4 text-white hover:text-emerald-500 transition-colors bg-white/10 rounded-full p-2">
                        <XMarkIcon className="w-8 h-8" />
                    </button>

                    <div className="relative max-w-5xl max-h-[90vh] w-full flex items-center justify-center h-full" onClick={e => e.stopPropagation()}>
                        {fullscreenMedia.type === 'image' && (
                            <img src={fullscreenMedia.url} alt={t('fullscreen')} className="max-w-full max-h-[90vh] rounded-lg shadow-2xl" />
                        )}
                        {fullscreenMedia.type === 'video' && (
                            <video src={fullscreenMedia.url} controls autoPlay className="max-w-full max-h-[90vh] rounded-lg shadow-2xl" />
                        )}
                        {fullscreenMedia.type === 'pdf' && (
                            <iframe src={fullscreenMedia.url} className="w-full h-[85vh] bg-white rounded-lg shadow-2xl border-0" title="Fullscreen PDF" />
                        )}
                    </div>
                </div>
            )}
            {/* Group Creation Modal */}
            {showGroupModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden border border-slate-200 dark:border-slate-700 animate-fadeIn flex flex-col max-h-[80vh]">
                        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50 flex-shrink-0">
                            <h3 className="font-bold text-lg text-black dark:text-white">{t('chat_create_group')}</h3>
                            <button onClick={() => setShowGroupModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                                <XMarkIcon className="w-6 h-6" />
                            </button>
                        </div>
                        <form onSubmit={handleCreateGroup} className="p-6 space-y-4 flex flex-col flex-1 overflow-hidden">
                            <div className="flex-shrink-0">
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('chat_group_name')}</label>
                                <input
                                    required
                                    type="text"
                                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-black dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
                                    value={newGroupData.name}
                                    onChange={e => setNewGroupData({ ...newGroupData, name: e.target.value })}
                                />
                            </div>



                            <div className="flex-1 overflow-hidden flex flex-col">
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{t('chat_select_members')} ({selectedMemberIds.length})</label>

                                <div className="mb-2 relative">
                                    <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 rtl:right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="text"
                                        placeholder={t('search_employees')}
                                        className="w-full pl-9 rtl:pr-9 rtl:pl-3 pr-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-colors"
                                        value={memberSearchTerm}
                                        onChange={e => setMemberSearchTerm(e.target.value)}
                                    />
                                </div>

                                <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-y-auto flex-1 custom-scrollbar">
                                    {employees
                                        .filter(emp => emp.fullName.toLowerCase().includes(memberSearchTerm.toLowerCase()))
                                        .map(emp => (
                                            <label key={emp.id} className="flex items-center space-x-3 rtl:space-x-reverse px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer border-b border-slate-100 dark:border-slate-700/50 last:border-0">
                                                <input
                                                    type="checkbox"
                                                    className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                                                    checked={selectedMemberIds.includes(emp.id)}
                                                    onChange={e => {
                                                        if (e.target.checked) {
                                                            setSelectedMemberIds([...selectedMemberIds, emp.id]);
                                                        } else {
                                                            setSelectedMemberIds(selectedMemberIds.filter(id => id !== emp.id));
                                                        }
                                                    }}
                                                />
                                                {emp.avatarUrl ? (
                                                    <img src={emp.avatarUrl} alt={emp.fullName} className="w-8 h-8 rounded-full object-cover" />
                                                ) : (
                                                    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-500">
                                                        <UserCircleIcon className="w-5 h-5" />
                                                    </div>
                                                )}
                                                <span className="text-sm text-slate-700 dark:text-slate-200">{emp.fullName}</span>
                                            </label>
                                        ))}
                                </div>
                            </div>

                            <button type="submit" className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors flex-shrink-0">
                                {t('chat_create')}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
