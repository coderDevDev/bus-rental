'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import type { Role } from '@/types';
import { User } from '@supabase/supabase-js';

interface UserMetadata {
  name?: string;
  role?: string;
  // Add other metadata fields you expect
}

interface AuthUser extends User {
  user_metadata: UserMetadata;
}

export function useAuth() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get the current session
    const getSession = async () => {
      const {
        data: { session }
      } = await supabase.auth.getSession();

      if (session) {
        setUser(session.user as AuthUser);
        setRole((session.user.user_metadata.role as Role) || null);
      } else {
        setUser(null);
        setRole(null);
      }

      setLoading(false);
    };

    getSession();

    // Listen for auth state changes
    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setUser(session.user as AuthUser);
        setRole((session.user.user_metadata.role as Role) || null);
      } else {
        setUser(null);
        setRole(null);
      }

      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  return {
    user: user as AuthUser | null,
    role,
    loading,
    signOut,
    isAuthenticated: !!user,
    isPassenger: role === 'passenger',
    isConductor: role === 'conductor',
    isAdmin: role === 'admin'
  };
}
