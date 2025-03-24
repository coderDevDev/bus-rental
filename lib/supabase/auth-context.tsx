'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from './client';

type UserRole = 'admin' | 'conductor' | 'passenger';

type UserWithRole = User & {
  role?: UserRole;
};

type AuthContextType = {
  user: UserWithRole | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ role: UserRole }>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserWithRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const {
          data: { session }
        } = await supabase.auth.getSession();
        console.log('Initial session:', session);

        if (session?.user) {
          // Fetch user role from the database
          const { data: userData, error: roleError } = await supabase
            .from('users')
            .select('role')
            .eq('id', session.user.id)
            .single();

          console.log('User data from DB:', userData);

          if (roleError) {
            console.error('Error fetching user role:', roleError);
          }

          setUser(
            userData
              ? { ...session.user, role: userData.role as UserRole }
              : null
          );
        } else {
          setUser(null);
        }

        const {
          data: { subscription }
        } = supabase.auth.onAuthStateChange(async (_event, session) => {
          console.log('Auth state changed:', _event, session);

          if (session?.user) {
            const { data: userData, error: roleError } = await supabase
              .from('users')
              .select('role')
              .eq('id', session.user.id)
              .single();

            if (roleError) {
              console.error('Error fetching user role:', roleError);
            }

            setUser(
              userData
                ? { ...session.user, role: userData.role as UserRole }
                : null
            );
          } else {
            setUser(null);
          }
        });

        return () => subscription.unsubscribe();
      } finally {
        setLoading(false);
        setInitialized(true);
      }
    };

    initializeAuth();
  }, []);

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password
    });
    if (error) throw error;
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log('1. Starting sign in process...', { email });

      // First sign in with Supabase Auth
      const { data: authData, error: signInError } =
        await supabase.auth.signInWithPassword({
          email,
          password
        });

      console.log('2. Auth response:', { authData, signInError });

      if (signInError) {
        console.error('3a. Sign in error:', signInError);
        throw signInError;
      }

      if (!authData.user) {
        console.error('3b. No user data returned');
        throw new Error('No user data returned');
      }

      console.log('3. Auth successful, fetching user role...');

      // Then fetch the user role from our users table
      const { data: userData, error: roleError } = await supabase
        .from('users')
        .select('*') // Select all columns to see what we get
        .eq('email', email)
        .single();

      console.log('4. User query result:', { userData, roleError });

      if (roleError) {
        console.error('5a. Role fetch error:', roleError);
        throw roleError;
      }

      if (!userData?.role) {
        console.error('5b. User role not found in data:', userData);
        throw new Error('User role not found');
      }

      console.log('5. Setting user with role:', userData.role);
      const role = userData.role as UserRole;
      setUser({ ...authData.user, role });

      console.log('6. Sign in complete, returning role:', role);
      return { role };
    } catch (error) {
      console.error('Sign in process error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  // Don't render anything until we've initialized
  if (!initialized) {
    return null;
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
