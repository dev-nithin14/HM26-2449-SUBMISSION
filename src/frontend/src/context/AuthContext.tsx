import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { UserProfile, UserRole } from '../types';
import { supabase } from '../lib/supabase';
import { authApi } from '../api/client';

interface SignUpParams {
  email: string;
  password: string;
  name: string;
  role: 'CITIZEN' | 'BUILDER';
  phone?: string;
  organization?: string;
}

interface AuthContextType {
  currentUser: UserProfile | null;
  activeRole: UserRole;
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ session: Session | null; user: User | null }>;
  signUp: (params: SignUpParams) => Promise<{ user: User | null; session: Session | null; emailConfirmationRequired: boolean }>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  // Backwards compatibility alias
  loginDemo?: (roleOrEmail: any, rememberMe?: boolean) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchUserProfile = useCallback(async (currentSession: Session): Promise<UserProfile | null> => {
    try {
      // Fetch user profile via backend REST API with Bearer token
      const profile = await authApi.getMe();
      return profile;
    } catch (apiErr) {
      console.warn('Could not load profile via /api/auth/me, falling back to direct profiles query:', apiErr);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', currentSession.user.id)
          .maybeSingle();

        if (error || !data) return null;
        return {
          id: data.id,
          email: data.email,
          name: data.name,
          role: data.role as UserRole,
          phone: data.phone || undefined,
          organization: data.organization || undefined,
          avatar_url: data.avatar_url || undefined,
          created_at: data.created_at,
          updated_at: data.updated_at
        };
      } catch (dbErr) {
        console.error('Failed to fetch user profile from database:', dbErr);
        return null;
      }
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!session) {
      setCurrentUser(null);
      return;
    }
    const profile = await fetchUserProfile(session);
    if (profile) {
      setCurrentUser(profile);
    }
  }, [session, fetchUserProfile]);

  useEffect(() => {
    let mounted = true;

    async function initSession() {
      try {
        const { data } = await supabase.auth.getSession();
        if (mounted) {
          setSession(data.session);
          if (data.session) {
            const profile = await fetchUserProfile(data.session);
            if (mounted) {
              setCurrentUser(profile);
            }
          }
        }
      } catch (err) {
        console.error('Error getting initial Supabase session:', err);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    initSession();

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      if (!mounted) return;
      setSession(newSession);

      if (newSession) {
        const profile = await fetchUserProfile(newSession);
        if (mounted) {
          setCurrentUser(profile);
          setIsLoading(false);
        }
      } else {
        if (mounted) {
          setCurrentUser(null);
          setIsLoading(false);
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchUserProfile]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password
      });

      if (error) {
        throw error;
      }

      setSession(data.session);
      if (data.session) {
        const profile = await fetchUserProfile(data.session);
        setCurrentUser(profile);
      }

      return { session: data.session, user: data.user };
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (params: SignUpParams) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: params.email.trim(),
        password: params.password,
        options: {
          data: {
            name: params.name.trim(),
            role: params.role,
            phone: params.phone?.trim() || null,
            organization: params.organization?.trim() || null
          }
        }
      });

      if (error) {
        throw error;
      }

      // Check if session was returned or email confirmation is required
      const emailConfirmationRequired = !data.session;

      if (data.session) {
        setSession(data.session);
        const profile = await fetchUserProfile(data.session);
        setCurrentUser(profile);
      }

      return {
        user: data.user,
        session: data.session,
        emailConfirmationRequired
      };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await supabase.auth.signOut();
      setSession(null);
      setCurrentUser(null);
      localStorage.removeItem('rebuild_demo_role');
      localStorage.removeItem('rebuild_demo_user_id');
      localStorage.removeItem('rebuild_demo_authenticated');
      localStorage.removeItem('rebuild_demo_session_version');
      sessionStorage.clear();
    } catch (err) {
      console.error('Error logging out from Supabase:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Backwards compatibility helper for tests/components
  const loginDemo = async (roleOrEmail: any) => {
    const seedPasswords: Record<string, string> = {
      'admin@rebuildmysore.gov.in': 'Admin@Mysuru2026!',
      'citizen@rebuildmysore.org': 'ReBuild@Mysuru2026!',
      'builder@rebuildmysore.org': 'ReBuild@Mysuru2026!',
      'collection@rebuildmysore.org': 'ReBuild@Mysuru2026!',
      'processing@rebuildmysore.org': 'ReBuild@Mysuru2026!'
    };
    const roleMap: Record<UserRole, string> = {
      ADMIN: 'admin@rebuildmysore.gov.in',
      CITIZEN: 'citizen@rebuildmysore.org',
      BUILDER: 'builder@rebuildmysore.org',
      COLLECTION_TEAM: 'collection@rebuildmysore.org',
      PROCESSING_TEAM: 'processing@rebuildmysore.org'
    };

    const targetEmail = roleMap[roleOrEmail as UserRole] || roleOrEmail;
    const targetPassword = seedPasswords[targetEmail] || 'ReBuild@Mysuru2026!';
    await login(targetEmail, targetPassword);
  };

  const activeRole: UserRole = currentUser?.role || 'CITIZEN';
  const isAuthenticated = !!session && !!currentUser;

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        activeRole,
        session,
        user: session?.user || null,
        isLoading,
        isAuthenticated,
        login,
        signUp,
        logout,
        refreshProfile,
        loginDemo
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
