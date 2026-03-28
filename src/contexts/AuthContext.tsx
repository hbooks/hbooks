import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { User as SupabaseUser } from '@supabase/supabase-js';

interface User {
  id: string;
  email: string;
  username: string;
  tag: 'member' | 'non-member';
  isAdmin?: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, username: string, password: string) => Promise<void>;
  checkIdentifier: (identifier: string) => Promise<{ found: boolean; email: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchUserProfile = useCallback(async (authUser: SupabaseUser) => {
    // Timeout after 5 seconds
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Profile fetch timed out')), 5000)
    );

    const fetchPromise = supabase
      .from('profiles')
      .select('username, tag')
      .eq('id', authUser.id)
      .single();

    try {
      const result = await Promise.race([fetchPromise, timeoutPromise]) as any;
      const { data: profile, error } = result;
      if (error) throw error;

      setUser({
        id: authUser.id,
        email: authUser.email!,
        username: profile.username,
        tag: profile.tag,
        isAdmin: authUser.email === 'admin@hpbooks.uk',
      });
    } catch (err) {
      console.error('Profile fetch error or timeout:', err);
      const username = authUser.user_metadata?.username || authUser.email?.split('@')[0] || 'user';
      setUser({
        id: authUser.id,
        email: authUser.email!,
        username,
        tag: 'non-member',
        isAdmin: authUser.email === 'admin@hpbooks.uk',
      });
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await fetchUserProfile(session.user);
      }
    };
    init();

    const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        await fetchUserProfile(session.user);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
    });

    return () => listener?.subscription.unsubscribe();
  }, [fetchUserProfile]);

  const checkIdentifier = useCallback(async (identifier: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/check-identifier`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ identifier }),
        }
      );
      if (!res.ok) throw new Error('Network error');
      return await res.json();
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signup = useCallback(async (email: string, username: string, password: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { username } },
      });
      if (error) throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const value = useMemo(() => ({
    user,
    isLoading,
    login,
    signup,
    checkIdentifier,
    logout,
  }), [user, isLoading, login, signup, checkIdentifier, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
