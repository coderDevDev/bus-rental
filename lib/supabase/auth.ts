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
  metadata: {
    name: string;
    phone: string;
    address: string;
    birthdate: string;
    gender: 'male' | 'female' | 'other';
    avatar_url?: string;
  }
) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        role,
        ...metadata // Include all metadata fields
      }
    }
  });

  if (error) {
    throw new Error(error.message);
  }

  // Create user profile in the database with additional fields
  if (data.user) {
    const { error: profileError } = await supabase.from('users').insert({
      id: data.user.id,
      email: data.user.email!,
      role,
      name: metadata.name,
      phone: metadata.phone,
      address: metadata.address,
      birthdate: metadata.birthdate,
      gender: metadata.gender,
      avatar_url: metadata.avatar_url,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
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
          name: metadata.name,
          phone: metadata.phone,
          address: metadata.address,
          birthdate: metadata.birthdate,
          status: 'inactive',
          experience_years: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (conductorError) {
        throw new Error(conductorError.message);
      }
    }

    // For passengers, create a passenger profile
    // if (role === 'passenger') {
    //   const passengerId = `PAS-${new Date().getFullYear()}-${Math.floor(
    //     Math.random() * 1000
    //   )
    //     .toString()
    //     .padStart(3, '0')}`;

    //   const { error: passengerError } = await supabase
    //     .from('passengers')
    //     .insert({
    //       user_id: data.user.id,
    //       passenger_id: passengerId,
    //       name: metadata.name,
    //       phone: metadata.phone,
    //       address: metadata.address,
    //       birthdate: metadata.birthdate,
    //       status: 'active',
    //       created_at: new Date().toISOString(),
    //       updated_at: new Date().toISOString()
    //     });

    //   if (passengerError) {
    //     throw new Error(passengerError.message);
    //   }
    // }
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

/**
 * Request a password reset email for the specified email address
 */
export async function resetPasswordForEmail(email: string): Promise<void> {
  // Get the full origin URL
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const redirectUrl = `${origin}/reset-password`;

  console.log('Sending reset email with redirect to:', redirectUrl);

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: redirectUrl
  });

  if (error) {
    console.error('Error sending password reset email:', error);
    throw new Error(error.message);
  }
}

/**
 * Update the user's password with a valid reset token
 */
export async function updatePassword(
  accessToken: string,
  newPassword: string
): Promise<void> {
  try {
    console.log(
      'Updating password with token:',
      accessToken ? 'Token present' : 'No token'
    );

    // This approach doesn't require setting the session first
    // Instead, we directly use the updateUser API with the token
    const { data, error } = await supabase.auth.updateUser(
      {
        password: newPassword
      },
      {
        // Pass the access token in the options
        accessToken: accessToken
      }
    );

    if (error) {
      console.error('Error updating password:', error);
      throw new Error(error.message);
    }

    console.log('Password updated successfully:', data);
  } catch (error) {
    console.error('Password update error:', error);
    throw error;
  }
}
