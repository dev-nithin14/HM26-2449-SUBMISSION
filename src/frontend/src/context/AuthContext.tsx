import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole } from '../types';
import { authApi } from '../api/client';

const DEMO_SESSION_VERSION = '2';

const hasValidDemoSession = () => {
  return (
    (localStorage.getItem('rebuild_demo_authenticated') === 'true' &&
      localStorage.getItem('rebuild_demo_session_version') === DEMO_SESSION_VERSION) ||
    (sessionStorage.getItem('rebuild_demo_authenticated') === 'true' &&
      sessionStorage.getItem('rebuild_demo_session_version') === DEMO_SESSION_VERSION)
  );
};

interface AuthContextType {
  currentUser: UserProfile | null;
  activeRole: UserRole;
  availableUsers: UserProfile[];
  isLoading: boolean;
  isAuthenticated: boolean;
  loginDemo: (role: UserRole, rememberMe: boolean) => Promise<void>;
  logout: () => void;
  switchRole: (role: UserRole) => Promise<void>;
  switchUser: (userId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [activeRole, setActiveRole] = useState<UserRole>(() => {
    return (localStorage.getItem('rebuild_demo_role') as UserRole) || 'CITIZEN';
  });
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return hasValidDemoSession();
  });
  const [availableUsers, setAvailableUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function initAuth() {
      try {
        const users = await authApi.getUsers();
        setAvailableUsers(users);

        const savedRole = (localStorage.getItem('rebuild_demo_role') as UserRole) || 'CITIZEN';
        const savedUserId = localStorage.getItem('rebuild_demo_user_id');

        let matched = isAuthenticated ? users.find((u) => u.id === savedUserId) : undefined;
        if (isAuthenticated && !matched) {
          matched = users.find((u) => u.role === savedRole) || users[0];
        }

        if (matched && isAuthenticated) {
          setCurrentUser(matched);
          setActiveRole(matched.role);
          localStorage.setItem('rebuild_demo_role', matched.role);
          localStorage.setItem('rebuild_demo_user_id', matched.id);
        }
      } catch (err) {
        console.warn('Failed to fetch demo users from backend, using fallback demo state', err);
        const fallback: UserProfile = {
          id: 'usr-cit-01',
          email: 'citizen@rebuildmysore.org',
          name: 'Aarav Sharma',
          role: 'CITIZEN',
          organization: 'Resident, Kuvempunagar'
        };
        if (isAuthenticated) {
          setCurrentUser(fallback);
        }
      } finally {
        setIsLoading(false);
      }
    }
    initAuth();
  }, []);

  const loginDemo = async (role: UserRole, rememberMe: boolean) => {
    await switchRole(role);
    setIsAuthenticated(true);
    const storage = rememberMe ? localStorage : sessionStorage;
    const otherStorage = rememberMe ? sessionStorage : localStorage;
    storage.setItem('rebuild_demo_authenticated', 'true');
    storage.setItem('rebuild_demo_session_version', DEMO_SESSION_VERSION);
    otherStorage.removeItem('rebuild_demo_authenticated');
    otherStorage.removeItem('rebuild_demo_session_version');
  };

  const logout = () => {
    setCurrentUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('rebuild_demo_authenticated');
    localStorage.removeItem('rebuild_demo_session_version');
    localStorage.removeItem('rebuild_demo_role');
    localStorage.removeItem('rebuild_demo_user_id');
    sessionStorage.removeItem('rebuild_demo_authenticated');
    sessionStorage.removeItem('rebuild_demo_session_version');
  };

  const switchRole = async (newRole: UserRole) => {
    setIsLoading(true);
    try {
      const match = availableUsers.find((u) => u.role === newRole);
      if (match) {
        setCurrentUser(match);
        setActiveRole(newRole);
        localStorage.setItem('rebuild_demo_role', newRole);
        localStorage.setItem('rebuild_demo_user_id', match.id);
      } else {
        const updated = await authApi.switchUser(newRole);
        setCurrentUser(updated);
        setActiveRole(newRole);
        localStorage.setItem('rebuild_demo_role', newRole);
        localStorage.setItem('rebuild_demo_user_id', updated.id);
      }
    } catch (err) {
      console.error('Failed to switch role', err);
    } finally {
      setIsLoading(false);
    }
  };

  const switchUser = async (userId: string) => {
    setIsLoading(true);
    try {
      const match = availableUsers.find((u) => u.id === userId);
      if (match) {
        setCurrentUser(match);
        setActiveRole(match.role);
        localStorage.setItem('rebuild_demo_role', match.role);
        localStorage.setItem('rebuild_demo_user_id', match.id);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        activeRole,
        availableUsers,
        isLoading,
        isAuthenticated,
        loginDemo,
        logout,
        switchRole,
        switchUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
