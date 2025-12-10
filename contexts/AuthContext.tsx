import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Employee } from '../types';
import { getEmployeeById } from '../services/mockService';
import { getDefaultPermissions } from '../utils/rbac'; // Import RBAC

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  currentUser: Employee | null;
  login: (userId: string) => Promise<void>;
  logout: () => void;
  loadUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // 1. GLOBAL LOADING STATE: Default to TRUE to prevent premature rendering
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<Employee | null>(null);

  // Function to Fetch Fresh User Data
  const loadUser = async () => {
    try {
      const storedToken = localStorage.getItem('auth_token');
      const storedUserId = localStorage.getItem('auth_user_id');
      console.log("[Auth] Checking token:", storedToken, "User ID:", storedUserId);

      if (storedToken === 'valid_token' && storedUserId) {
        // Fetch user details from DB (Mock Service)
        const user = await getEmployeeById(storedUserId);
        console.log("[Auth] User fetch result:", user);

        if (user) {
          // --- RBAC INJECTION ---
          // Dynamically assign permissions based on role
          const computedPermissions = getDefaultPermissions(user.role);
          const userWithPermissions = {
            ...user,
            permissions: computedPermissions
          };

          setCurrentUser(userWithPermissions);
          setIsAuthenticated(true);
        } else {
          console.warn("[Auth] Token valid but user not found. Logging out.");
          doLogout();
        }
      } else {
        // No token, ensure we are logged out
        doLogout();
      }
    } catch (error) {
      console.error("[Auth] Check failed", error);
      doLogout();
    }
  };

  const doLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user_id');
    setCurrentUser(null);
    setIsAuthenticated(false);
  };

  // INITIALIZATION EFFECT
  useEffect(() => {
    const initAuth = async () => {
      // Ensure loading is true before starting
      setIsLoading(true);
      await loadUser();
      // ONLY set loading to false after check is complete
      setIsLoading(false);
    };
    initAuth();
  }, []);

  const login = async (userId: string) => {
    setIsLoading(true);
    localStorage.setItem('auth_token', 'valid_token');
    localStorage.setItem('auth_user_id', userId);
    await loadUser();
    setIsLoading(false);
  };

  const logout = () => {
    doLogout();
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, currentUser, login, logout, loadUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};