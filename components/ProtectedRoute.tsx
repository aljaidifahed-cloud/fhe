import React from 'react';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, fallback }) => {
  const { isAuthenticated, isLoading } = useAuth();

  // 1. Show Loading State (Spinner / Splash)
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center relative z-20">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin"></div>
          <p className="text-emerald-400 mt-4 text-sm font-medium animate-pulse">Initializing HRMS...</p>
        </div>
      </div>
    );
  }

  // 2. If not authenticated, show the fallback (Login/Landing)
  if (!isAuthenticated) {
    return <>{fallback}</>;
  }

  // 3. Render the protected content
  return <>{children}</>;
};