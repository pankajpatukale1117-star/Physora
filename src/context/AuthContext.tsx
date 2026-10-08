import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured, formatAuthError } from '../lib/supabase';
import type { 
  AuthContextType, 
  PhysoraProfile, 
  LoginFormData, 
  SignUpFormData 
} from '../types/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<PhysoraProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Fetch or create profile for authenticated user
  const fetchProfile = useCallback(async (userId: string, authUser?: User) => {
    if (!isSupabaseConfigured) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.warn('[Physora Auth] Failed to fetch profile from database:', error.message);
      }

      if (data) {
        setProfile(data as PhysoraProfile);
      } else if (authUser) {
        // Fallback: If profile row doesn't exist yet, derive from user_metadata
        const meta = authUser.user_metadata || {};
        const fallbackProfile: PhysoraProfile = {
          id: userId,
          username: meta.username || authUser.email?.split('@')[0] || 'scientist',
          display_name: meta.display_name || meta.full_name || 'Physora Researcher',
          avatar_url: meta.avatar_url || null,
          bio: null,
          created_at: authUser.created_at || new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        setProfile(fallbackProfile);

        // Attempt to create the initial row in profiles table
        try {
          await supabase.from('profiles').insert(fallbackProfile);
        } catch {
          // Trigger or RLS might handle or restrict, safe to continue
        }
      }
    } catch (err) {
      console.warn('[Physora Auth] Profile fetch exception:', err);
    }
  }, []);

  // Initialize session on mount & subscribe to Supabase auth events
  useEffect(() => {
    if (!isSupabaseConfigured) {
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    // 1. Initial active session recovery
    supabase.auth.getSession().then(({ data: { session: initialSession }, error }) => {
      if (!isMounted) return;

      if (error) {
        console.warn('[Physora Auth] Session recovery error:', error.message);
      }

      if (initialSession?.user) {
        setSession(initialSession);
        setUser(initialSession.user);
        fetchProfile(initialSession.user.id, initialSession.user);
      } else {
        setSession(null);
        setUser(null);
        setProfile(null);
      }
      setIsLoading(false);
    });

    // 2. Real-time auth state changes listener (cross-tab sync, token refresh, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      if (!isMounted) return;

      setSession(newSession);
      setUser(newSession?.user ?? null);

      if (newSession?.user) {
        await fetchProfile(newSession.user.id, newSession.user);
      } else {
        setProfile(null);
      }

      if (event === 'PASSWORD_RECOVERY') {
        // Broadcast or set hash to trigger reset view
        window.location.hash = '#reset-password';
      }

      setIsLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  // Sign In implementation
  const signIn = async ({ emailOrUsername, password }: LoginFormData) => {
    if (!isSupabaseConfigured) {
      return {
        success: false,
        error: 'Supabase credentials are not configured in .env.local. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.'
      };
    }

    try {
      let emailToUse = emailOrUsername.trim();

      // Check if user entered a username instead of an email address
      if (!emailToUse.includes('@')) {
        const { data: profileMatch } = await supabase
          .from('profiles')
          .select('id')
          .ilike('username', emailToUse)
          .maybeSingle();

        if (profileMatch) {
          // If we found a matching profile ID, we can query users or use standard identifier
          // Note: In Supabase, standard signIn requires the user's email.
          // If username lookup isn't paired with an email column in profiles, we query or inform user.
          const { data: profileWithEmail } = await supabase
            .from('profiles')
            .select('email')
            .eq('id', profileMatch.id)
            .maybeSingle();

          if (profileWithEmail && (profileWithEmail as { email?: string }).email) {
            emailToUse = (profileWithEmail as { email: string }).email;
          }
        }
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: emailToUse,
        password
      });

      if (error) {
        return { success: false, error: formatAuthError(error) };
      }

      if (data.user) {
        setUser(data.user);
        setSession(data.session);
        await fetchProfile(data.user.id, data.user);
        return { success: true };
      }

      return { success: false, error: 'Sign in failed. Please verify credentials.' };
    } catch (err) {
      return { success: false, error: formatAuthError(err) };
    }
  };

  // Sign Up implementation
  const signUp = async ({ displayName, username, email, password, confirmPassword }: SignUpFormData) => {
    if (!isSupabaseConfigured) {
      return {
        success: false,
        error: 'Supabase credentials are not configured in .env.local. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.'
      };
    }

    if (password !== confirmPassword) {
      return { success: false, error: 'Passwords do not match.' };
    }

    try {
      const cleanUsername = username.trim().toLowerCase();
      const cleanDisplayName = displayName.trim();
      const cleanEmail = email.trim().toLowerCase();

      // 1. Verify username uniqueness in profiles table
      const { data: existingUser, error: checkError } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', cleanUsername)
        .maybeSingle();

      if (!checkError && existingUser) {
        return { success: false, error: 'This username is already taken. Please choose another username.' };
      }

      // 2. Perform Supabase Auth signup
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: {
            display_name: cleanDisplayName,
            username: cleanUsername
          }
        }
      });

      if (error) {
        return { success: false, error: formatAuthError(error) };
      }

      if (!data.user) {
        return { success: false, error: 'Unable to create account. Please try again.' };
      }

      // 3. Insert or update the public profile record
      const initialProfile: PhysoraProfile = {
        id: data.user.id,
        username: cleanUsername,
        display_name: cleanDisplayName,
        avatar_url: null,
        bio: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      try {
        await supabase.from('profiles').upsert(initialProfile);
      } catch (profileErr) {
        console.warn('[Physora Auth] Profile auto-creation note:', profileErr);
      }

      // 4. Check if confirmation email is required
      const isEmailConfirmationRequired = data.user && !data.session;

      if (data.session) {
        setSession(data.session);
        setUser(data.user);
        setProfile(initialProfile);
      }

      return {
        success: true,
        requiresVerification: Boolean(isEmailConfirmationRequired)
      };
    } catch (err) {
      return { success: false, error: formatAuthError(err) };
    }
  };

  // Sign Out implementation
  const signOut = async () => {
    if (!isSupabaseConfigured) {
      setUser(null);
      setSession(null);
      setProfile(null);
      return;
    }

    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn('[Physora Auth] Error during sign out:', err);
    } finally {
      setUser(null);
      setSession(null);
      setProfile(null);
    }
  };

  // Password Reset Request
  const resetPasswordForEmail = async (email: string) => {
    if (!isSupabaseConfigured) {
      return {
        success: false,
        error: 'Supabase credentials are not configured in .env.local.'
      };
    }

    try {
      const redirectUrl = `${window.location.origin}/#reset-password`;
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: redirectUrl
      });

      if (error) {
        return { success: false, error: formatAuthError(error) };
      }

      return { success: true };
    } catch (err) {
      return { success: false, error: formatAuthError(err) };
    }
  };

  // Update Password (when arriving from recovery link or from profile)
  const updatePassword = async (newPassword: string) => {
    if (!isSupabaseConfigured) {
      return {
        success: false,
        error: 'Supabase credentials are not configured in .env.local.'
      };
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        return { success: false, error: formatAuthError(error) };
      }

      return { success: true };
    } catch (err) {
      return { success: false, error: formatAuthError(err) };
    }
  };

  // Update Profile details
  const updateProfile = async (updates: Partial<Pick<PhysoraProfile, 'display_name' | 'username' | 'bio' | 'avatar_url'>>) => {
    if (!isSupabaseConfigured || !user) {
      return { success: false, error: 'Must be logged in to update profile.' };
    }

    try {
      const updatedFields = {
        ...updates,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('profiles')
        .update(updatedFields)
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      setProfile(data as PhysoraProfile);
      return { success: true };
    } catch (err) {
      return { success: false, error: 'Failed to update profile.' };
    }
  };

  // Explicit profile refresh
  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id, user);
    }
  };

  const value: AuthContextType = {
    user,
    session,
    profile,
    isLoading,
    isAuthenticated: Boolean(user && session),
    isConfigured: isSupabaseConfigured,
    signIn,
    signUp,
    signOut,
    resetPasswordForEmail,
    updatePassword,
    updateProfile,
    refreshProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
