import React, { useState, useRef } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Page } from '../types';
import { LockClosedIcon, XMarkIcon, CalendarIcon, BellAlertIcon } from '@heroicons/react/24/outline';

interface PrivateProps {
    onNavigate?: (page: Page) => void;
}

interface BoardItem {
    id: string;
    type: 'image' | 'text' | 'document' | 'map';
    x: number;
    y: number;
    rotation: number;
    content?: string;
    title?: string;
    color?: string;
    pinColor?: string;
    imgSrc?: string;
    dueDate?: string;
}

const INITIAL_ITEMS: BoardItem[] = [
    { id: '1', type: 'image', x: 25, y: 20, rotation: -2, pinColor: 'bg-red-600', imgSrc: '/moon_texture.png', title: 'TOP SECRET', content: 'Target Unidentified' },
    { id: '2', type: 'document', x: 55, y: 15, rotation: 3, pinColor: 'bg-yellow-500', title: 'Payload Manifest', content: 'WARN: Unauthorized access detected in sector 7.' },
    { id: '3', type: 'text', x: 15, y: 55, rotation: -6, pinColor: 'bg-blue-500', color: 'bg-yellow-300', content: 'Who is the mole?' },
    { id: '4', type: 'map', x: 65, y: 60, rotation: 1, pinColor: 'bg-green-600', content: 'Grid ref: A-113' }
];

const NOTE_COLORS = [
    'bg-yellow-200',
    'bg-blue-200',
    'bg-green-200',
    'bg-red-200',
    'bg-orange-200',
    'bg-purple-200',
    'bg-pink-200'
];

export const Private: React.FC<PrivateProps> = () => {
    const { t } = useLanguage();
    const [items, setItems] = React.useState<BoardItem[]>(() => {
        const saved = localStorage.getItem('detective_board_items');
        return saved ? JSON.parse(saved) : INITIAL_ITEMS;
    });
    const [draggingId, setDraggingId] = React.useState<string | null>(null);
    const boardRef = React.useRef<HTMLDivElement>(null);

    // Persistence
    React.useEffect(() => {
        localStorage.setItem('detective_board_items', JSON.stringify(items));
    }, [items]);

    // Check for approaching deadlines (optional notification)
    React.useEffect(() => {
        const checkDeadlines = () => {
            if (Notification.permission !== 'granted') {
                Notification.requestPermission();
            }

            const now = new Date();
            const twoDaysInMs = 48 * 60 * 60 * 1000;

            items.forEach(item => {
                if (item.dueDate) {
                    const due = new Date(item.dueDate);
                    const diff = due.getTime() - now.getTime();

                    if (diff > 0 && diff < twoDaysInMs) {
                        // Trigger browser notification if supported and granted
                        if (Notification.permission === 'granted') {
                            // Simple throttle to avoid spam
                            console.log(`Deadline approaching for note: ${item.content}`);
                        }
                    }
                }
            });
        };

        const interval = setInterval(checkDeadlines, 60000);
        checkDeadlines();
        return () => clearInterval(interval);
    }, [items]);

    const handleBoardClick = (e: React.MouseEvent) => {
        // Create new note on direct click (not dragging or clicking existing item)
        if (draggingId || (e.target as HTMLElement).closest('.board-item')) return;

        if (boardRef.current) {
            const rect = boardRef.current.getBoundingClientRect();
            const xPercent = ((e.clientX - rect.left) / rect.width) * 100;
            const yPercent = ((e.clientY - rect.top) / rect.height) * 100;

            const newItem: BoardItem = {
                id: Date.now().toString(),
                type: 'text',
                x: xPercent,
                y: yPercent,
                rotation: Math.random() * 10 - 5,
                color: NOTE_COLORS[Math.floor(Math.random() * NOTE_COLORS.length)],
                pinColor: 'bg-red-500',
                content: 'New Clue...'
            };
            setItems(prev => [...prev, newItem]);
        }
    };

    const handleMouseDown = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setDraggingId(id);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (draggingId && boardRef.current) {
            const rect = boardRef.current.getBoundingClientRect();
            const xPercent = ((e.clientX - rect.left) / rect.width) * 100;
            const yPercent = ((e.clientY - rect.top) / rect.height) * 100;

            setItems(prev => prev.map(item =>
                item.id === draggingId
                    ? { ...item, x: Math.max(0, Math.min(100, xPercent)), y: Math.max(0, Math.min(100, yPercent)) }
                    : item
            ));
        }
    };

    const handleMouseUp = () => {
        setDraggingId(null);
    };

    const handleDelete = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setItems(prev => prev.filter(item => item.id !== id));
    };

    return (
        <div className="space-y-6 animate-in fade-in zoom-in duration-300" onMouseUp={handleMouseUp} onMouseMove={handleMouseMove}>
            <div className="flex items-center space-x-4 rtl:space-x-reverse">
                <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl shadow-sm">
                    <LockClosedIcon className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-black dark:text-white">{t('private_section')}</h1>
                    <p className="text-slate-500 dark:text-slate-400">Secure Vault Area</p>
                </div>
            </div>

            {/* Detective Blackboard Container */}
            <div
                ref={boardRef}
                onClick={handleBoardClick}
                className="relative mx-auto w-full max-w-[1400px] aspect-video bg-[#2a2a2a] rounded-xl overflow-hidden shadow-2xl border-[16px] border-[#5c4033] box-content cursor-crosshair select-none"
            >
                {/* Board Texture */}
                <div className="absolute inset-0 opacity-20 pointer-events-none"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}>
                </div>



                {/* --- ITEMS ON THE BOARD --- */}
                {items.map(item => (
                    <div
                        key={item.id}
                        onMouseDown={(e) => handleMouseDown(item.id, e)}
                        className={`board-item group absolute p-4 shadow-xl z-20 cursor-move hover:scale-105 transition-transform duration-100 ${item.type === 'text' ? `${item.color || 'bg-yellow-300'} w-40 h-40 flex items-center justify-center text-center` :
                            item.type === 'image' ? 'bg-white w-64' :
                                item.type === 'document' ? 'bg-[#fdfbf7] w-56' :
                                    'bg-white w-72'
                            }`}
                        style={{
                            top: `${item.y}%`,
                            left: `${item.x}%`,
                            transform: `translate(-50%, -50%) rotate(${item.rotation}deg)`
                        }}
                    >
                        {/* Pin */}
                        <div className={`absolute -top-3 left-1/2 transform -translate-x-1/2 w-4 h-4 rounded-full shadow-md border border-black/20 ${item.pinColor || 'bg-red-600'}`}></div>

                        {/* Delete Button (visible on hover) */}
                        <button
                            onClick={(e) => handleDelete(item.id, e)}
                            className="absolute -top-3 -right-3 w-6 h-6 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-red-600 z-30"
                            title="Remove Note"
                        >
                            <XMarkIcon className="w-full h-full" />
                        </button>

                        {/* Content Rendering */}
                        {item.type === 'image' && (
                            <>
                                <div className="w-full h-48 bg-slate-200 mb-2 overflow-hidden filter grayscale contrast-125 pointer-events-none">
                                    <img src={item.imgSrc} alt="Evidence" className="w-full h-full object-cover" />
                                </div>
                                <div className="font-mono text-center text-red-700 font-bold border-2 border-red-700 p-1 rotate-1 pointer-events-none">
                                    {item.title}
                                </div>
                                <p className="font-handwriting text-center mt-2 text-sm text-slate-800 pointer-events-none">{item.content}</p>
                            </>
                        )}

                        {item.type === 'document' && (
                            <>
                                <h4 className="font-bold text-slate-800 border-b border-slate-300 pb-1 mb-2 pointer-events-none">{item.title}</h4>
                                <div className="space-y-1 pointer-events-none">
                                    <div className="h-2 w-full bg-slate-200 rounded"></div>
                                    <div className="h-2 w-3/4 bg-slate-200 rounded"></div>
                                    <div className="h-2 w-5/6 bg-slate-200 rounded"></div>
                                </div>
                                <div className="mt-4 text-xs font-mono text-slate-500 pointer-events-none">{item.content}</div>
                            </>
                        )}

                        {item.type === 'text' && (
                            <div className="flex flex-col h-full">
                                <textarea
                                    className="flex-1 font-semibold text-lg bg-transparent w-full resize-none outline-none text-slate-800 text-center cursor-text"
                                    style={{ fontFamily: 'comic sans ms, cursive' }}
                                    value={item.content}
                                    onChange={(e) => setItems(prev => prev.map(i => i.id === item.id ? { ...i, content: e.target.value } : i))}
                                    onMouseDown={(e) => e.stopPropagation()}
                                    placeholder="Type a clue..."
                                />
                                {/* Date Picker */}
                                <div className="mt-2 pt-2 border-t border-black/10 flex items-center justify-between group/date">
                                    <div className="flex items-center space-x-1">
                                        {item.dueDate && new Date(item.dueDate).getTime() - new Date().getTime() < 172800000 && new Date(item.dueDate).getTime() > new Date().getTime() && (
                                            <BellAlertIcon className="w-4 h-4 text-red-600 animate-pulse" title="Due Soon!" />
                                        )}
                                        <CalendarIcon
                                            className="w-4 h-4 text-slate-600 opacity-50 group-hover/date:opacity-100 cursor-pointer hover:text-blue-600 hover:scale-110 transition-all"
                                            onMouseDown={(e) => e.stopPropagation()}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                const navigateContainer = e.currentTarget.closest('.group\\/date');
                                                const input = navigateContainer?.querySelector('input[type="datetime-local"]');
                                                if (input && 'showPicker' in input) {
                                                    (input as any).showPicker();
                                                } else if (input) {
                                                    (input as HTMLElement).focus();
                                                }
                                            }}
                                            title="Set Due Date"
                                        />
                                    </div>
                                    <input
                                        type="datetime-local"
                                        className="bg-transparent text-[10px] text-slate-600 outline-none w-32 cursor-pointer"
                                        value={item.dueDate || ''}
                                        onChange={(e) => setItems(prev => prev.map(i => i.id === item.id ? { ...i, dueDate: e.target.value } : i))}
                                        onMouseDown={(e) => e.stopPropagation()}
                                        onClick={(e) => e.stopPropagation()}
                                    />
                                </div>
                            </div>
                        )}

                        {item.type === 'map' && (
                            <>
                                <div className="border border-slate-200 p-1 pointer-events-none">
                                    <div className="grid grid-cols-4 gap-1 opacity-60">
                                        {[...Array(16)].map((_, i) => (
                                            <div key={i} className={`h-8 bg-slate-${(i % 3 + 1) * 200}`}></div>
                                        ))}
                                    </div>
                                </div>
                                <p className="text-xs text-right mt-1 font-mono text-slate-400 pointer-events-none">{item.content}</p>
                            </>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};
