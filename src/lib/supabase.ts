import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Read environment variables (Vite-specific)
const rawSupabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const rawSupabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const FALLBACK_SUPABASE_URL = 'https://qadcqxmxbggfybzvdkjn.supabase.co';
const FALLBACK_SUPABASE_ANON_KEY = 'sb_publishable_AWtfYkPp1dyFb3m36Wdf0A_jaxpp05m';

export const supabaseUrl = (rawSupabaseUrl && rawSupabaseUrl.startsWith('https://') && !rawSupabaseUrl.includes('your-project.supabase.co'))
  ? rawSupabaseUrl
  : FALLBACK_SUPABASE_URL;

export const supabaseAnonKey = (rawSupabaseAnonKey && !rawSupabaseAnonKey.includes('your-anon-key'))
  ? rawSupabaseAnonKey
  : FALLBACK_SUPABASE_ANON_KEY;

// Check if valid Supabase configuration is present
export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.startsWith('https://')
);

/**
 * Production Supabase Client instance for Physora
 * - Built-in session persistence in localStorage via Supabase Auth
 * - Automatic token refresh on expiration
 * - Real-time auth state synchronization across tabs
 * - URL detection for password reset & email confirmation links
 */
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'physora-auth-session'
  }
});

/**
 * Format raw authentication errors into clear, professional, user-friendly messages
 * Never reveals sensitive backend or database internals
 */
export function formatAuthError(error: unknown): string {
  if (!error) return 'An unexpected error occurred. Please try again.';
  
  const message = typeof error === 'object' && error !== null && 'message' in error
    ? String((error as { message: unknown }).message)
    : String(error);

  const lower = message.toLowerCase();

  if (lower.includes('invalid login credentials') || lower.includes('invalid_grant')) {
    return 'Email/username or password is incorrect.';
  }
  if (lower.includes('user already registered') || lower.includes('already exists') || lower.includes('unique constraint')) {
    return 'An account with this email already exists.';
  }
  if (lower.includes('email not confirmed')) {
    return 'Please verify your email address to continue. Check your inbox for the confirmation link.';
  }
  if (lower.includes('password') && (lower.includes('short') || lower.includes('weak') || lower.includes('least'))) {
    return 'Password is too weak. Please ensure it is at least 8 characters long.';
  }
  if (lower.includes('rate limit') || lower.includes('too many requests')) {
    return 'Too many login attempts. Please wait a moment before trying again.';
  }
  if (lower.includes('network') || lower.includes('fetch') || lower.includes('failed to fetch')) {
    return "We couldn't connect right now. Please check your internet connection and try again.";
  }
  if (lower.includes('invalid email') || lower.includes('email format')) {
    return 'Please enter a valid email address.';
  }
  if (lower.includes('token has expired') || lower.includes('expired')) {
    return 'This reset or verification link has expired. Please request a new one.';
  }
  if (lower.includes('user not found')) {
    return 'No account was found with this email address.';
  }

  return message.length > 120 ? 'Authentication error occurred. Please try again.' : message;
}
