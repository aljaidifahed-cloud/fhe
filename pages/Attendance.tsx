import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { MapPinIcon, ClockIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { OvertimeCalculator } from '../components/OvertimeCalculator';
import { TimesheetUploader } from '../components/TimesheetUploader';

export const Attendance: React.FC = () => {
    const { t, language } = useLanguage();
    const [time, setTime] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [viewDate, setViewDate] = useState<Date>(new Date()); // For navigating months

    // Expanded Mock Logs for Calendar Demo
    const [logs, setLogs] = useState([
        { id: 1, date: '2025-10-25', time: '08:55 AM', type: 'IN', verified: true, statusType: 'ON_TIME' },
        { id: 2, date: '2025-10-25', time: '05:00 PM', type: 'OUT', verified: true, statusType: 'NONE' },
        { id: 3, date: '2025-10-24', time: '09:15 AM', type: 'IN', verified: true, statusType: 'LATE', lateMinutes: 15 },
        { id: 4, date: '2025-10-24', time: '05:30 PM', type: 'OUT', verified: true, statusType: 'NONE' },
        { id: 5, date: '2025-10-23', time: '08:50 AM', type: 'IN', verified: true, statusType: 'ON_TIME' },
        { id: 6, date: '2025-10-23', time: '05:05 PM', type: 'OUT', verified: true, statusType: 'NONE' },
        // Add current date for demo if not already selected
        { id: 7, date: new Date().toISOString().split('T')[0], time: '09:00 AM', type: 'IN', verified: true, statusType: 'ON_TIME' },
        { id: 8, date: new Date().toISOString().split('T')[0], time: '05:00 PM', type: 'OUT', verified: true, statusType: 'NONE' }
    ]);

    // --- Geolocation State ---
    interface SavedLocation {
        id: string;
        name: string;
        lat: number;
        lng: number;
        radius: number;
    }

    const [savedLocations, setSavedLocations] = useState<SavedLocation[]>(() => {
        try {
            const saved = localStorage.getItem('attendance_locations');
            return saved ? JSON.parse(saved) : [{
                id: 'default',
                name: 'Main Office',
                lat: 24.725902,
                lng: 46.726207,
                radius: 500
            }];
        } catch (e) {
            return [{ id: 'default', name: 'Main Office', lat: 24.725902, lng: 46.726207, radius: 500 }];
        }
    });

    const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [currentDistance, setCurrentDistance] = useState<number | null>(null); // To nearest valid location
    const [locationError, setLocationError] = useState<string | null>(null);
    const [isDevBypass, setIsDevBypass] = useState(false);

    // New Location Form State
    const [newLocName, setNewLocName] = useState('');
    const [newLocUrl, setNewLocUrl] = useState('');
    const [newLocRadius, setNewLocRadius] = useState(500);

    // Simulation State
    const [isCheckedIn, setIsCheckedIn] = useState(false);

    // Helper to extract Lat/Lng from Google Maps URL
    const parseMapsUrl = (url: string) => {
        const atRegex = /@(-?\d+\.\d+),(-?\d+\.\d+)/;
        const atMatch = url.match(atRegex);
        if (atMatch) return { lat: parseFloat(atMatch[1]), lng: parseFloat(atMatch[2]) };

        const queryRegex = /(?:q|query)=(-?\d+\.\d+),(-?\d+\.\d+)/;
        const queryMatch = url.match(queryRegex);
        if (queryMatch) return { lat: parseFloat(queryMatch[1]), lng: parseFloat(queryMatch[2]) };

        const llRegex = /(?:ll)=(-?\d+\.\d+),(-?\d+\.\d+)/;
        const llMatch = url.match(llRegex);
        if (llMatch) return { lat: parseFloat(llMatch[1]), lng: parseFloat(llMatch[2]) };

        return null;
    };

    // Haversine formula
    const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
        const R = 6371e3; // metres
        const φ1 = lat1 * Math.PI / 180;
        const φ2 = lat2 * Math.PI / 180;
        const Δφ = (lat2 - lat1) * Math.PI / 180;
        const Δλ = (lon2 - lon1) * Math.PI / 180;

        const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c;
    };

    // Derived state
    const isWithinRange = isDevBypass || savedLocations.some(loc => {
        if (!userLocation) return false;
        const dist = calculateDistance(userLocation.lat, userLocation.lng, loc.lat, loc.lng);
        return dist <= loc.radius;
    });

    // Save locations to local storage
    useEffect(() => {
        localStorage.setItem('attendance_locations', JSON.stringify(savedLocations));
    }, [savedLocations]);

    // Live Clock
    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const handleAddLocation = () => {
        const coords = parseMapsUrl(newLocUrl);
        if (!coords && !userLocation) {
            alert("Please provide a valid Google Maps URL or wait for GPS to set current location.");
            return;
        }

        const finalCoords = coords || userLocation!;

        const newLocation: SavedLocation = {
            id: Date.now().toString(),
            name: newLocName || `Location ${savedLocations.length + 1}`,
            lat: finalCoords.lat,
            lng: finalCoords.lng,
            radius: newLocRadius
        };

        setSavedLocations([...savedLocations, newLocation]);
        setNewLocName('');
        setNewLocUrl('');
        setNewLocRadius(500);
    };

    const handleDeleteLocation = (id: string) => {
        if (confirm('Are you sure you want to delete this location?')) {
            setSavedLocations(savedLocations.filter(loc => loc.id !== id));
        }
    };

    useEffect(() => {
        if (!navigator.geolocation) {
            setLocationError('Geolocation is not supported by your browser');
            return;
        }

        const watchId = navigator.geolocation.watchPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                setUserLocation({ lat: latitude, lng: longitude });
                setLocationError(null);
            },
            (error) => {
                setLocationError(error.message);
            },
            {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 0
            }
        );

        return () => navigator.geolocation.clearWatch(watchId);
    }, []);

    // Update nearest distance for UI status
    useEffect(() => {
        if (userLocation && savedLocations.length > 0) {
            let minDistance = Infinity;
            savedLocations.forEach(loc => {
                const dist = calculateDistance(userLocation.lat, userLocation.lng, loc.lat, loc.lng);
                if (dist < minDistance) minDistance = dist;
            });
            setCurrentDistance(minDistance === Infinity ? null : minDistance);
        } else {
            setCurrentDistance(null);
        }
    }, [userLocation, savedLocations]);

    const handleCheckAction = () => {
        if (!isWithinRange) {
            alert(t('error_outside_range') || "You are outside the allowed range to clock in/out.");
            return;
        }

        const type = isCheckedIn ? 'OUT' : 'IN';
        const todayStr = new Date().toLocaleDateString('en-CA');
        const newLog = {
            id: logs.length + 1,
            date: todayStr,
            time: new Date().toLocaleTimeString(language === 'ar' ? 'ar-SA' : 'en-US', { hour: '2-digit', minute: '2-digit' }),
            type,
            verified: true,
            statusType: type === 'IN' ? 'ON_TIME' : 'NONE'
        };
        setLogs([newLog, ...logs]);
        setIsCheckedIn(!isCheckedIn);
        setSelectedDate(new Date());
    };

    // Calendar Helper Functions
    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        return new Date(year, month + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (date: Date) => {
        return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    };

    const daysInMonth = getDaysInMonth(viewDate);
    const firstDay = getFirstDayOfMonth(viewDate);

    // Generate Calendar Grid
    const calendarDays = [];
    // Padding for empty days
    for (let i = 0; i < firstDay; i++) {
        calendarDays.push(null);
    }
    // Actual days
    for (let i = 1; i <= daysInMonth; i++) {
        calendarDays.push(new Date(viewDate.getFullYear(), viewDate.getMonth(), i));
    }

    // Filter Logs for Selected Date
    const selectedDateLogs = logs.filter(log => {
        const logDate = new Date(log.date);
        return logDate.getDate() === selectedDate.getDate() &&
            logDate.getMonth() === selectedDate.getMonth() &&
            logDate.getFullYear() === selectedDate.getFullYear();
    }).sort((a, b) => a.time.localeCompare(b.time));

    const changeMonth = (offset: number) => {
        const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth() + offset, 1);
        setViewDate(newDate);
    };

    const hasLog = (date: Date) => {
        return logs.some(log => {
            const logD = new Date(log.date);
            return logD.getDate() === date.getDate() && logD.getMonth() === date.getMonth() && logD.getFullYear() === date.getFullYear();
        });
    };

    const isToday = (date: Date) => {
        const today = new Date();
        return date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
    };

    const isSelected = (date: Date) => {
        return date.getDate() === selectedDate.getDate() && date.getMonth() === selectedDate.getMonth() && date.getFullYear() === selectedDate.getFullYear();
    };

    // Calculate Day Summary
    const loginTime = selectedDateLogs.find(l => l.type === 'IN')?.time || '-';
    // Find last OUT log
    const logoutTime = selectedDateLogs.slice().reverse().find(l => l.type === 'OUT')?.time || '-';

    // Calculate Duration (Mock simplified)
    const workDuration = loginTime !== '-' && logoutTime !== '-' ? `8${t('suffix_hours')} 05${t('suffix_min')}` : '-';

    return (
        <div className="space-y-6 animate-fadeIn pb-10">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-black dark:text-white">{t('attendance_title')}</h2>
                    <p className="text-slate-500 text-sm">{t('attendance_subtitle')}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Panel: Clock In & Status */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Clock In/Out Panel */}
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center text-center space-y-6">
                        <div className="w-full">
                            <p className="text-sm text-slate-500 uppercase font-semibold tracking-wider">{t('current_time')}</p>
                            <div className="text-4xl font-bold text-black dark:text-white font-mono mt-2">
                                {time.toLocaleTimeString(language === 'ar' ? 'ar-SA' : 'en-US')}
                            </div>
                            <div className="text-sm text-slate-400 mt-1">
                                {time.toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                            </div>
                        </div>

                        <div className="w-48 h-48 rounded-full border-4 border-slate-100 flex items-center justify-center relative bg-slate-50">
                            <button
                                onClick={handleCheckAction}
                                disabled={!isWithinRange}
                                className={`w-40 h-40 rounded-full flex flex-col items-center justify-center shadow-lg transition-all transform active:scale-95 
                                    ${!isWithinRange
                                        ? 'bg-slate-400 cursor-not-allowed opacity-75'
                                        : (isCheckedIn ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-emerald-500 hover:bg-emerald-600 text-white')
                                    }`}
                            >
                                <ClockIcon className="w-10 h-10 mb-2" />
                                <span className="text-lg font-bold">
                                    {isCheckedIn ? t('clock_out') : t('clock_in')}
                                </span>
                            </button>
                        </div>
                        {/* Distance Indicator for User Feedback */}
                        <div className="text-xs font-mono text-slate-400">
                            {currentDistance !== null ? `~${Math.round(currentDistance)}m from nearest zone` : 'Locating...'}
                        </div>
                    </div>

                    {/* Location Status & Settings */}
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 space-y-4">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="font-bold text-black dark:text-white">{t('location_status')}</h3>
                            <div className="flex items-center space-x-2 rtl:space-x-reverse">
                                <label className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Dev Bypass</label>
                                <input
                                    type="checkbox"
                                    checked={isDevBypass}
                                    onChange={(e) => setIsDevBypass(e.target.checked)}
                                    className="accent-emerald-500 w-4 h-4"
                                />
                            </div>
                        </div>

                        <div className="flex items-center space-x-4 rtl:space-x-reverse">
                            <div className={`p-3 rounded-full ${isWithinRange ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                                {isWithinRange ? <CheckCircleIcon className="w-6 h-6" /> : <XCircleIcon className="w-6 h-6" />}
                            </div>
                            <div className="flex-1">
                                <p className={`font-bold ${isWithinRange ? 'text-emerald-700' : 'text-red-700'}`}>
                                    {isWithinRange ? t('inside_range') : t('outside_range')}
                                </p>
                                <p className="text-xs text-slate-500 mt-1">
                                    {savedLocations.length > 0 ? `${savedLocations.length} Active Zones` : 'No Zones Configured'}
                                </p>
                            </div>
                        </div>

                        {/* Admin/Settings Section */}
                        <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-700">
                            <details className="text-xs">
                                <summary className="cursor-pointer text-slate-400 hover:text-emerald-500 font-medium mb-2 transition-colors">
                                    Conf. Location Settings
                                </summary>
                                <div className="space-y-4 pt-2">
                                    {/* Add New Location Form */}
                                    <div className="bg-slate-50 dark:bg-slate-700/50 p-3 rounded border border-slate-100 dark:border-slate-600">
                                        <p className="font-bold mb-2 text-slate-600 dark:text-slate-300">Add New Workplace</p>
                                        <div className="space-y-2">
                                            <input
                                                className="w-full bg-white dark:bg-slate-600 border border-slate-200 dark:border-slate-500 rounded px-2 py-1"
                                                placeholder="Location Name (e.g. Branch A)"
                                                value={newLocName}
                                                onChange={e => setNewLocName(e.target.value)}
                                            />
                                            <input
                                                className="w-full bg-white dark:bg-slate-600 border border-slate-200 dark:border-slate-500 rounded px-2 py-1"
                                                placeholder="Google Maps URL"
                                                value={newLocUrl}
                                                onChange={e => setNewLocUrl(e.target.value)}
                                            />
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="number"
                                                    className="w-20 bg-white dark:bg-slate-600 border border-slate-200 dark:border-slate-500 rounded px-2 py-1"
                                                    placeholder="Radius"
                                                    value={newLocRadius}
                                                    onChange={e => setNewLocRadius(parseFloat(e.target.value))}
                                                />
                                                <span className="text-slate-500">meters</span>
                                                <div className="flex-1"></div>
                                                <button
                                                    onClick={handleAddLocation}
                                                    className="bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1 rounded transition-colors"
                                                >
                                                    Add
                                                </button>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    if (userLocation) {
                                                        const newLocation: SavedLocation = {
                                                            id: Date.now().toString(),
                                                            name: newLocName || `Current Loc ${savedLocations.length + 1}`,
                                                            lat: userLocation.lat,
                                                            lng: userLocation.lng,
                                                            radius: newLocRadius
                                                        };
                                                        setSavedLocations([...savedLocations, newLocation]);
                                                        setNewLocName('');
                                                    } else {
                                                        alert("Waiting for GPS...");
                                                    }
                                                }}
                                                className="text-emerald-600 hover:text-emerald-700 underline text-[10px]"
                                            >
                                                Use Current GPS Location
                                            </button>
                                        </div>
                                    </div>

                                    {/* Locations List */}
                                    <div className="space-y-2">
                                        {savedLocations.map(loc => {
                                            const dist = userLocation ? calculateDistance(userLocation.lat, userLocation.lng, loc.lat, loc.lng) : null;
                                            const isInside = dist !== null && dist <= loc.radius;

                                            return (
                                                <div key={loc.id} className="flex justify-between items-center bg-white dark:bg-slate-800 p-2 rounded border border-slate-100 dark:border-slate-600">
                                                    <div>
                                                        <p className="font-bold text-slate-700 dark:text-slate-200">{loc.name}</p>
                                                        <p className="text-[10px] text-slate-400">
                                                            {loc.lat.toFixed(4)}, {loc.lng.toFixed(4)} | R: {loc.radius}m
                                                        </p>
                                                        {dist !== null && (
                                                            <p className={`text-[10px] ${isInside ? 'text-emerald-500 font-bold' : 'text-slate-400'}`}>
                                                                {Math.round(dist)}m away {isInside ? '(Inside)' : ''}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <button
                                                        onClick={() => handleDeleteLocation(loc.id)}
                                                        className="text-red-400 hover:text-red-500 p-1"
                                                    >
                                                        <XCircleIcon className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </details>
                        </div>
                    </div>

                    {/* Overtime Calculator Tool */}
                    <OvertimeCalculator />

                </div>

                {/* Right Panel: Calendar & Logs */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Calendar Card */}
                    <div className="bg-[#1a2332] dark:bg-[#1a2332] rounded-xl shadow-lg border border-slate-700/50 overflow-hidden">
                        <div className="p-4 border-b border-white/5 flex justify-between items-center bg-[#1a2332]">
                            <div>
                                <h3 className="font-bold text-lg text-white">{t('attendance_calendar')}</h3>
                                <div className="text-xs text-slate-400 mt-0.5 flex items-center space-x-2 rtl:space-x-reverse">
                                    <span>
                                        {viewDate.toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', { month: 'long', year: 'numeric' })}
                                    </span>
                                    <span className="w-1 h-1 rounded-full bg-slate-600"></span>
                                    <span>
                                        {new Intl.DateTimeFormat('ar-SA-u-ca-islamic', { month: 'long', year: 'numeric' }).format(viewDate)}
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center space-x-2 rtl:space-x-reverse">
                                <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white transition-colors">←</button>
                                <button onClick={() => changeMonth(1)} className="p-2 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white transition-colors">→</button>
                            </div>
                        </div>

                        <div className="p-4 md:p-6">
                            {/* Days Header */}
                            <div className="grid grid-cols-7 mb-4 text-center">
                                {(['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const).map(day => (
                                    <div key={day} className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                                        {t(day)}
                                    </div>
                                ))}
                            </div>

                            {/* Calendar Grid */}
                            <div className="grid grid-cols-7 gap-2 md:gap-3">
                                {calendarDays.map((date, index) => {
                                    if (!date) return <div key={`empty-${index}`} className="h-16 md:h-24 rounded-xl bg-white/5 opacity-50"></div>;

                                    const hasActivity = hasLog(date);
                                    const active = isSelected(date);
                                    const today = isToday(date);

                                    // Get Hijri Day
                                    const hijriDay = new Intl.DateTimeFormat('ar-SA-u-ca-islamic', { day: 'numeric' }).format(date);

                                    return (
                                        <button
                                            key={date.toISOString()}
                                            onClick={() => setSelectedDate(date)}
                                            className={`h-16 md:h-24 rounded-xl flex flex-col items-center justify-between p-2 relative border transition-all group
                                                ${active
                                                    ? 'bg-emerald-600 text-white border-emerald-500 shadow-lg shadow-emerald-900/50 scale-[1.02] z-10'
                                                    : 'bg-[#252f3e] text-slate-300 border-transparent hover:bg-[#2d3848] hover:border-slate-600'
                                                }
                                                ${today && !active ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-[#1a2332]' : ''}
                                            `}
                                        >
                                            <span className={`text-lg md:text-2xl font-bold ${active ? 'text-white' : 'text-slate-200 group-hover:text-white transition-colors'}`}>
                                                {date.getDate()}
                                            </span>

                                            <span className={`text-[10px] ${active ? 'text-emerald-200' : 'text-slate-500'}`}>
                                                {hijriDay}
                                            </span>

                                            {hasActivity && !active && (
                                                <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Summary & Selected Day Logs */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/50">
                            <h3 className="font-bold text-black dark:text-white">
                                {t('recent_activity')} - {selectedDate.toLocaleDateString()}
                            </h3>
                            <span className="text-xs text-slate-500">
                                {selectedDateLogs.length} {t('records_count')}
                            </span>
                        </div>

                        {/* Google Map Embed */}
                        <div className="mt-6 h-64 bg-slate-100 rounded-lg relative overflow-hidden border border-slate-200 dark:border-slate-600">
                            <iframe
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d115934.39708785646!2d46.726207869389966!3d24.725902409741003!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3e2f03890d489399%3A0xba974d1c98e79fd5!2sRiyadh%20Saudi%20Arabia!5e0!3m2!1sen!2sae!4v1701234567890!5m2!1sen!2sae"
                                width="100%"
                                height="100%"
                                style={{ border: 0 }}
                                allowFullScreen
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                                title="Office Location"
                            ></iframe>
                        </div>
                        {/* Daily Summary Cards */}
                        <div className="grid grid-cols-3 gap-4 p-4 border-b border-slate-100 dark:border-slate-700">
                            <div className="text-center p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mb-1">{t('login_time')}</p>
                                <p className="text-lg font-bold text-emerald-700 dark:text-emerald-300">{loginTime}</p>
                            </div>
                            <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                                <p className="text-xs text-red-600 dark:text-red-400 font-medium mb-1">{t('logout_time')}</p>
                                <p className="text-lg font-bold text-red-700 dark:text-red-300">{logoutTime}</p>
                            </div>
                            <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                <p className="text-xs text-blue-600 dark:text-blue-400 font-medium mb-1">{t('duration')}</p>
                                <p className="text-lg font-bold text-blue-700 dark:text-blue-300">{workDuration}</p>
                            </div>
                        </div>

                        {selectedDateLogs.length === 0 ? (
                            <div className="p-8 text-center text-slate-500 dark:text-slate-400">
                                <ClockIcon className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                                <p>{t('no_attendance_records')}</p>
                            </div>
                        ) : (
                            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                                <thead className="bg-slate-50 dark:bg-slate-700/50">
                                    <tr>
                                        <th className="px-6 py-3 text-start text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">{t('col_time')}</th>
                                        <th className="px-6 py-3 text-start text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">{t('col_type')}</th>
                                        <th className="px-6 py-3 text-start text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">{t('col_location')}</th>
                                        <th className="px-6 py-3 text-start text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">{t('col_status')}</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                                    {selectedDateLogs.map((log) => (
                                        <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-black dark:text-white font-medium">
                                                {log.time}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-1 text-xs rounded font-bold ${log.type === 'IN'
                                                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                                                    : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                                                    }`}>
                                                    {log.type === 'IN' ? t('clock_in') : t('clock_out')}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                {log.verified ? (
                                                    <div className="flex items-center text-emerald-600 dark:text-emerald-400">
                                                        <CheckCircleIcon className="w-4 h-4 mr-1 rtl:ml-1" />
                                                        {t('verified')}
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center text-amber-600 dark:text-amber-400">
                                                        <XCircleIcon className="w-4 h-4 mr-1 rtl:ml-1" />
                                                        {t('remote')}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400 font-mono">
                                                {log.statusType === 'ON_TIME' && t('on_time')}
                                                {log.statusType === 'LATE' && `${t('status_late')} (${log.lateMinutes}${t('suffix_min')})`}
                                                {log.statusType === 'REMOTE' && t('remote')}
                                                {log.statusType === 'NONE' && '-'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>

                    {/* Monthly Preparation Upload */}
                    <TimesheetUploader />
                </div>
            </div>
        </div>
    );
};
