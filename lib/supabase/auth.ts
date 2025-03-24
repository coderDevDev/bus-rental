import { createClient } from '@supabase/supabase-js';
import type { Session } from '@supabase/supabase-js';
import { redirect } from 'next/navigation';
import type { Role } from '@/types';

// Update the supabase client initialization in auth.ts:
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Add this check after the client creation:
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables in auth.ts');
}

export async function signUp(
  email: string,
  password: string,
  role: Role = 'passenger',
  name: string
) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        role,
        name
      }
    }
  });

  if (error) {
    throw new Error(error.message);
  }

  // Create user profile in the database
  if (data.user) {
    const { error: profileError } = await supabase.from('users').insert({
      id: data.user.id,
      email: data.user.email!,
      role,
      name
    });

    if (profileError) {
      throw new Error(profileError.message);
    }

    // If the role is conductor, create a conductor profile
    if (role === 'conductor') {
      const conductorId = `CON-${new Date().getFullYear()}-${Math.floor(
        Math.random() * 1000
      )
        .toString()
        .padStart(3, '0')}`;

      const { error: conductorError } = await supabase
        .from('conductors')
        .insert({
          user_id: data.user.id,
          conductor_id: conductorId,
          license_number: '',
          phone: '',
          status: 'inactive',
          experience_years: 0
        });

      if (conductorError) {
        throw new Error(conductorError.message);
      }
    }
  }

  return data;
}

export async function signIn(email: string, password: string) {
  // Sign in with password
  const { data: authData, error: authError } =
    await supabase.auth.signInWithPassword({
      email,
      password
    });

  console.log({ authData });
  if (authError) {
    throw new Error(authError.message);
  }

  if (!authData.session || !authData.user) {
    throw new Error('Authentication failed');
  }

  // Get the user profile to ensure we have the correct role
  const { data: profileData, error: profileError } = await supabase
    .from('users')
    .select('role')
    .eq('email', email)
    .single();

  if (profileError) {
    throw new Error(profileError.message);
  }

  console.log({ profileData });
  // Update the user's metadata with the role from the profile
  const { error: updateError } = await supabase.auth.updateUser({
    data: { role: profileData.role }
  });

  if (updateError) {
    throw new Error(updateError.message);
  }

  // Refresh the session to get the updated metadata
  const { data: refreshedSession, error: refreshError } =
    await supabase.auth.refreshSession();

  if (refreshError) {
    throw new Error(refreshError.message);
  }

  // Return the final data
  return {
    session: refreshedSession.session,
    user: refreshedSession.user
  };
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw new Error(error.message);
  }

  redirect('/');
}

export async function getSession(): Promise<Session | null> {
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    throw new Error(error.message);
  }

  return data.session;
}

export async function getUserProfile() {
  const session = await getSession();

  if (!session) {
    return null;
  }

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', session.user.id)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function getRole(): Promise<Role | null> {
  const profile = await getUserProfile();
  return profile?.role || null;
}

export function redirectBasedOnRole(role: Role | null) {
  if (!role) {
    redirect('/sign-in');
  }

  switch (role) {
    case 'passenger':
      redirect('/dashboard');
    case 'conductor':
      redirect('/conductor');
    case 'admin':
      redirect('/admin');
    default:
      redirect('/');
  }
}
