import React, { useState } from 'react';
import { Bars3Icon } from '@heroicons/react/24/outline'; // New Import
import { MoonLogo } from './components/MoonLogo'; // New Import
import { hasPermission } from './utils/rbac'; // Import Helper
import { Permission } from './types'; // Import Types
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { Employees } from './pages/Employees';
import { Payroll } from './pages/Payroll';
import { Attendance } from './pages/Attendance';
import { Architecture } from './pages/Architecture';
import { AddEmployee } from './pages/AddEmployee';
import { EditEmployee } from './pages/EditEmployee';
import { Profile } from './pages/Profile';
import { Requests } from './pages/Requests';
import { OrgChart } from './pages/OrgChart';
import { Private } from './pages/Private'; // New Import
import { Permissions } from './pages/Permissions';
import { Inbox } from './pages/Inbox';
import { WarningsCommitments } from './pages/WarningsCommitments';
import { MyWarnings } from './pages/MyWarnings'; // New Import
import { HiredLabor } from './pages/HiredLabor'; // New Import
import { Login } from './pages/Login';
import { Landing } from './pages/Landing';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { YouTubeBackground } from './components/YouTubeBackground';
import { ErrorBoundary } from './components/ErrorBoundary';

import { Page } from './types';

// Inner App Component to consume AuthContext
const AppContent: React.FC = () => {
  const { login, logout, isLoading } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [currentPage, setCurrentPage] = useState<Page>(Page.DASHBOARD);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // New State
  const { currentUser } = useAuth(); // Ensure we have currentUser

  // Enforce Permissions on Routing
  React.useEffect(() => {
    if (!currentUser) return;
    if (currentUser.id === '10001') return; // Admin bypass

    const alwaysAllowed = [Page.DASHBOARD, Page.PROFILE];

    // Check generic pages
    if (alwaysAllowed.includes(currentPage)) return;
    if (currentPage === Page.REQUESTS || currentPage === Page.INBOX) return;
    if (currentPage === Page.MY_WARNINGS) return;

    // Check Specific Permissions
    let allowed = false;
    const permissions = currentUser.permissions;

    switch (currentPage) {
      case Page.EMPLOYEES: allowed = hasPermission(permissions, Permission.VIEW_ALL_EMPLOYEES) || hasPermission(permissions, Permission.MANAGE_DEPT_EMPLOYEES); break;
      case Page.ORG_CHART: allowed = hasPermission(permissions, Permission.VIEW_ORG_CHART); break;
      case Page.PAYROLL: allowed = hasPermission(permissions, Permission.MANAGE_PAYROLL) || hasPermission(permissions, Permission.VIEW_SALARIES); break;
      case Page.PERMISSIONS: allowed = hasPermission(permissions, Permission.MANAGE_ALL_EMPLOYEES); break; // Only admins
      case Page.WARNINGS_COMMITMENTS: allowed = hasPermission(permissions, Permission.MANAGE_WARNINGS); break;
      case Page.ADD_EMPLOYEE:
      case Page.EDIT_EMPLOYEE:
        // Needs proper permission
        allowed = hasPermission(permissions, Permission.MANAGE_ALL_EMPLOYEES) || hasPermission(permissions, Permission.MANAGE_DEPT_EMPLOYEES);
        break;
      case Page.ATTENDANCE: allowed = true; break; // Everyone for now?
      default: allowed = true; // Unknown pages allowed for safety or deny? Let's say deny if not listed.
        // Actually, let's keep it robust. If not in list, maybe it's new.
        // But for security, better deny.
        // Let's check if it's one of the other pages.
        if ([Page.ARCHITECTURE, Page.PRIVATE].includes(currentPage)) allowed = false;
        break;
    }

    if (!allowed) {
      console.warn(`Access Denied to ${currentPage} for ${currentUser.id}`);
      setCurrentPage(Page.DASHBOARD);
    }

  }, [currentPage, currentUser]);

  // 1. BLOCKING LOADING STATE
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin"></div>
          <p className="text-emerald-400 mt-6 text-sm font-medium animate-pulse tracking-wider">LOADING SYSTEM...</p>
        </div>
      </div>
    );
  }

  const handleLoginSuccess = (userId: string) => {
    login(userId); // Updates Context & LocalStorage
  };

  const handleLogout = () => {
    logout(); // Clears Context & LocalStorage
    setShowLogin(false);
    setCurrentPage(Page.DASHBOARD);
  };

  const handleEditEmployee = (id: string) => {
    setSelectedEmployeeId(id);
    setCurrentPage(Page.EDIT_EMPLOYEE);
  };

  // Define the Unauthenticated View (Landing or Login)
  const UnauthenticatedView = showLogin ? (
    <Login onLogin={handleLoginSuccess} onBack={() => setShowLogin(false)} />
  ) : (
    <Landing onLoginClick={() => setShowLogin(true)} />
  );

  return (
    <ErrorBoundary>
      <div className="relative min-h-screen overflow-hidden text-black dark:text-white transition-colors duration-300">
        {/* Global Galaxy Background */}
        <YouTubeBackground />

        {/* Content Layer */}
        <div className="relative z-10 h-screen flex flex-col transition-all duration-300">
          <ProtectedRoute fallback={UnauthenticatedView}>

            {/* Mobile Header */}
            <header className="md:hidden bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-white/10 p-4 flex items-center justify-between z-20 sticky top-0">
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <div className="w-8 h-8">
                  <MoonLogo className="w-full h-full" />
                </div>
                <h1 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-cyan-600 dark:from-emerald-400 dark:to-cyan-400">
                  MOON HR
                </h1>
              </div>
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 transition-colors"
              >
                <Bars3Icon className="w-6 h-6" />
              </button>
            </header>

            <div className="flex flex-1 overflow-hidden">
              <Sidebar
                currentPage={currentPage}
                onNavigate={(page) => {
                  setCurrentPage(page);
                  setIsSidebarOpen(false); // Close sidebar on nav
                }}
                onLogout={handleLogout}
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
              />
              {/* Glassmorphism Effect for Main Content Area */}
              <main className="flex-1 overflow-y-auto bg-slate-50/20 dark:bg-slate-950/20 backdrop-blur-sm p-4 md:p-8 transition-colors duration-300 w-full">
                <div className="max-w-7xl mx-auto h-full flex flex-col">
                  <div key={currentPage} className="animate-page-enter h-full">
                    {(() => {
                      switch (currentPage) {
                        case Page.DASHBOARD:
                          return <Dashboard onNavigate={setCurrentPage} />;
                        case Page.EMPLOYEES:
                          return <Employees onNavigate={setCurrentPage} onEdit={handleEditEmployee} />;
                        case Page.ADD_EMPLOYEE:
                          return <AddEmployee onNavigate={setCurrentPage} />;
                        case Page.EDIT_EMPLOYEE:
                          return selectedEmployeeId ? (
                            <EditEmployee
                              id={selectedEmployeeId}
                              onNavigate={setCurrentPage}
                            />
                          ) : <Employees onNavigate={setCurrentPage} onEdit={handleEditEmployee} />;
                        case Page.PAYROLL:
                          return <Payroll />;
                        case Page.ATTENDANCE:
                          return <Attendance />;
                        case Page.REQUESTS:
                          return <Requests />;
                        case Page.ORG_CHART:
                          return <OrgChart onNavigate={setCurrentPage} />;
                        case Page.PRIVATE: // New Route
                          return <Private />;
                        case Page.ARCHITECTURE:
                          return <Architecture />;
                        case Page.PROFILE:
                          return <Profile onNavigate={setCurrentPage} />;
                        case Page.PERMISSIONS:
                          return <Permissions />;
                        case Page.INBOX: // New Route
                          return <Inbox />;
                        case Page.WARNINGS_COMMITMENTS:
                          return <WarningsCommitments />;
                        case Page.MY_WARNINGS:
                          return <MyWarnings />;
                        case Page.HIRED_LABOR:
                          return <HiredLabor onNavigate={setCurrentPage} />;
                        default:
                          return <Dashboard onNavigate={setCurrentPage} />;
                      }
                    })()}
                  </div>
                </div>
              </main>
            </div>
          </ProtectedRoute>
        </div>
      </div>
    </ErrorBoundary>
  );
};

import { NotificationsProvider } from './contexts/NotificationsContext';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <NotificationsProvider>
        <AppContent />
      </NotificationsProvider>
    </AuthProvider>
  );
};

export default App;