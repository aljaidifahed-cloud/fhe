import React from 'react';
import { Page, Permission } from '../types';
import { hasPermission } from '../utils/rbac'; // Import Helper
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { ThemeToggle } from './ThemeToggle';
import {
  HomeIcon,
  UsersIcon,
  BanknotesIcon,
  ServerStackIcon,
  GlobeAltIcon,
  ClockIcon,
  ArrowLeftStartOnRectangleIcon,
  InboxStackIcon,
  InboxIcon,
  ShareIcon,
  PaperClipIcon,
  ShieldCheckIcon,
  Bars3Icon,
  ExclamationTriangleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { MoonLogo } from './MoonLogo';

interface SidebarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  onLogout: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentPage, onNavigate, onLogout, isOpen, onClose }) => {
  const { t, language, setLanguage } = useLanguage();
  const { currentUser } = useAuth();

  const [isCollapsed, setIsCollapsed] = React.useState(() => {
    return localStorage.getItem('sidebar_collapsed') === 'true';
  });

  const toggleSidebar = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem('sidebar_collapsed', String(newState));
  };

  const menuItems = [
    { id: Page.DASHBOARD, label: t('dashboard'), icon: HomeIcon },
    { id: Page.EMPLOYEES, label: t('employees'), icon: UsersIcon },
    { id: Page.ORG_CHART, label: t('org_chart'), icon: ShareIcon },
    { id: Page.REQUESTS, label: t('requests'), icon: InboxStackIcon },
    { id: Page.INBOX, label: t('inbox') || 'Inbox', icon: InboxIcon },
    { id: Page.ATTENDANCE, label: t('attendance'), icon: ClockIcon },
    { id: Page.PAYROLL, label: t('payroll'), icon: BanknotesIcon },
    { id: Page.PRIVATE, label: t('private_section'), icon: PaperClipIcon },
    { id: Page.PERMISSIONS, label: t('permissions'), icon: ShieldCheckIcon },
    { id: Page.WARNINGS_COMMITMENTS, label: t('warnings_commitments'), icon: ExclamationTriangleIcon },
    { id: Page.MY_WARNINGS, label: t('my_warnings'), icon: ShieldCheckIcon },
    { id: Page.ARCHITECTURE, label: t('architecture'), icon: ServerStackIcon },
  ];

  // Filter Menu Items
  // Admin (Fahad, 10001) sees everything
  // Others see only what they have permission for (plus Dashboard/Profile)
  const filteredMenuItems = menuItems.filter(item => {
    // Always Allowed
    if (item.id === Page.DASHBOARD || item.id === Page.PROFILE) return true;
    if (item.id === Page.REQUESTS || item.id === Page.INBOX) return true; // Everyone can see generic requests (view filtered inside)
    if (item.id === Page.MY_WARNINGS) return true;

    // Specific Mapping
    const permissions = currentUser?.permissions;
    switch (item.id) {
      case Page.EMPLOYEES: return hasPermission(permissions, Permission.VIEW_ALL_EMPLOYEES) || hasPermission(permissions, Permission.MANAGE_DEPT_EMPLOYEES);
      case Page.ORG_CHART: return hasPermission(permissions, Permission.VIEW_ORG_CHART);
      case Page.PAYROLL: return hasPermission(permissions, Permission.MANAGE_PAYROLL) || hasPermission(permissions, Permission.VIEW_SALARIES);
      case Page.PERMISSIONS: return hasPermission(permissions, Permission.MANAGE_ALL_EMPLOYEES); // Or specific permission
      case Page.WARNINGS_COMMITMENTS: return hasPermission(permissions, Permission.MANAGE_WARNINGS);
      case Page.PRIVATE: return false; // Placeholder
      case Page.ARCHITECTURE: return false; // Placeholder
      default: return true;
    }
  });

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ar' : 'en');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
          onClick={onClose}
        />
      )}

      <aside className={`
        fixed md:static inset-y-0 left-0 z-50
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        ${isCollapsed ? 'w-20' : 'w-64'} 
        bg-white/90 dark:bg-slate-900/90 backdrop-blur-md text-black dark:text-white 
        flex flex-col shadow-xl flex-shrink-0 border-r border-slate-200 dark:border-white/5 
        transition-all duration-300
      `}>
        <div className="p-4 border-b border-slate-200 dark:border-white/10 flex items-center justify-between">
          <div className={`overflow-hidden transition-all duration-300 ${isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <div className="w-8 h-8 flex-shrink-0">
                <MoonLogo className="w-full h-full" />
              </div>
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-cyan-600 dark:from-emerald-400 dark:to-cyan-400 whitespace-nowrap animate-float-text">
                MOON HR
              </h1>
            </div>
          </div>
          <button onClick={toggleSidebar} className="hidden md:block p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 transition-colors">
            <Bars3Icon className="w-6 h-6" />
          </button>
          <button onClick={onClose} className="md:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 transition-colors">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>
        {!isCollapsed && (
          <div className="px-6 pb-2">
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 whitespace-nowrap overflow-hidden">{t('enterprise_edition')}</p>
          </div>
        )}

        <nav className="flex-1 p-3 space-y-2 overflow-y-auto overflow-x-hidden">
          {filteredMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center ${isCollapsed ? 'justify-center px-0' : 'space-x-3 rtl:space-x-reverse px-4'} py-3 rounded-lg transition-all duration-200 group ${isActive
                  ? 'bg-emerald-600 text-white shadow-lg'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-black dark:hover:text-white'
                  }`}
                title={isCollapsed ? item.label : ''}
              >
                <Icon className={`w-6 h-6 flex-shrink-0 transition-transform duration-200 ${isActive ? '' : 'group-hover:scale-110'}`} />
                {!isCollapsed && (
                  <span className={`font-medium text-sm whitespace-nowrap transition-transform duration-200 ltr:origin-left rtl:origin-right ${isActive ? '' : 'group-hover:scale-110 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 group-hover:drop-shadow-md'}`}>
                    {item.label}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-200 dark:border-white/10 space-y-3">
          {/* Settings Row: Language + Theme */}
          <div className={`flex ${isCollapsed ? 'flex-col space-y-2' : 'space-x-2 rtl:space-x-reverse'}`}>
            {/* Language Switcher */}
            <button
              onClick={toggleLanguage}
              className={`flex items-center justify-center p-2 rounded bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors border border-slate-200 dark:border-white/10 ${isCollapsed ? 'w-full' : 'flex-1'}`}
              title={language === 'en' ? 'Switch to Arabic' : 'Switch to English'}
            >
              <GlobeAltIcon className="w-5 h-5 text-slate-500 dark:text-slate-400" />
              {!isCollapsed && (
                <span className="ml-2 text-sm text-slate-700 dark:text-slate-300">
                  {language === 'en' ? 'En' : 'عربي'}
                </span>
              )}
            </button>

            {/* Theme Toggle */}
            <div className={isCollapsed ? 'flex justify-center' : ''}>
              <ThemeToggle />
            </div>
          </div>

          {/* User Info - Clickable for Profile */}
          <button
            onClick={() => onNavigate(Page.PROFILE)}
            className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3 rtl:space-x-reverse'} bg-slate-100 dark:bg-white/5 rounded-lg p-2 border border-slate-200 dark:border-white/10 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors`}
            title={!isCollapsed ? '' : (currentUser?.fullName || 'Profile')}
          >
            {/* Avatar Logic */}
            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-xs font-bold shrink-0 overflow-hidden border border-white/20 text-white">
              {currentUser?.avatarUrl ? (
                <img src={currentUser.avatarUrl} alt="User" className="w-full h-full object-cover" />
              ) : (
                <span>{currentUser ? getInitials(currentUser.fullName) : 'G'}</span>
              )}
            </div>

            {!isCollapsed && (
              <div className="flex-1 min-w-0 text-left rtl:text-right">
                <p className="text-sm font-medium truncate text-slate-700 dark:text-white">
                  {currentUser?.fullName || 'Guest User'}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  {currentUser?.id || '---'}
                </p>
              </div>
            )}
          </button>

          {/* Logout Button */}
          <button
            onClick={onLogout}
            className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'space-x-2 rtl:space-x-reverse'} justify-center px-4 py-2 rounded-lg text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-300 transition-all duration-200 border border-transparent hover:border-red-200 dark:hover:border-red-500/20`}
            title={isCollapsed ? t('logout') : ''}
          >
            <ArrowLeftStartOnRectangleIcon className="w-5 h-5 rtl:rotate-180" />
            {!isCollapsed && <span className="font-medium text-sm">{t('logout')}</span>}
          </button>
        </div>
      </aside>
    </>
  );
};