import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

// Make sure environment variables are properly accessed
let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
let supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Log for debugging (remove in production)
console.log('Supabase URL:', supabaseUrl ? 'Found' : 'Missing');
console.log('Supabase Anon Key:', supabaseAnonKey ? 'Found' : 'Missing');

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

// In browser, we can directly use the values from window.ENV if available
if (isBrowser && !supabaseUrl) {
  // @ts-ignore
  if (window.ENV && window.ENV.NEXT_PUBLIC_SUPABASE_URL) {
    // @ts-ignore
    supabaseUrl = window.ENV.NEXT_PUBLIC_SUPABASE_URL;
  }
}

if (isBrowser && !supabaseAnonKey) {
  // @ts-ignore
  if (window.ENV && window.ENV.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    // @ts-ignore
    supabaseAnonKey = window.ENV.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  }
}

// Create the client with fallback empty strings (will be caught by the error check below)
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Check if the client was created with valid credentials
if (!supabaseUrl || supabaseUrl.length === 0) {
  console.error('Missing environment variable: NEXT_PUBLIC_SUPABASE_URL');
}

if (!supabaseAnonKey || supabaseAnonKey.length === 0) {
  console.error('Missing environment variable: NEXT_PUBLIC_SUPABASE_ANON_KEY');
}
