import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured, formatAuthError } from '../lib/supabase';
import type { 
  AuthContextType, 
  PhysoraProfile, 
  LoginFormData, 
  SignUpFormData,
  MembershipTier 
} from '../types/auth';

interface DevAccount {
  id: string;
  email: string;
  username: string;
  displayName: string;
  passwordHash: string;
  createdAt: string;
  bio?: string;
  avatarUrl?: string | null;
}

const DEV_ACCOUNTS_KEY = 'physora_dev_accounts_v1';
const DEV_SESSION_KEY = 'physora_dev_session_v1';

function getDevAccounts(): DevAccount[] {
  try {
    const raw = localStorage.getItem(DEV_ACCOUNTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveDevAccounts(accounts: DevAccount[]) {
  try {
    localStorage.setItem(DEV_ACCOUNTS_KEY, JSON.stringify(accounts));
  } catch {
    // Ignore
  }
}

function getDevActiveSession(): { user: User; session: Session; profile: PhysoraProfile } | null {
  try {
    const raw = localStorage.getItem(DEV_SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveDevActiveSession(data: { user: User; session: Session; profile: PhysoraProfile } | null) {
  try {
    if (data) {
      localStorage.setItem(DEV_SESSION_KEY, JSON.stringify(data));
    } else {
      localStorage.removeItem(DEV_SESSION_KEY);
    }
  } catch {
    // Ignore
  }
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<PhysoraProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Fetch or create profile for authenticated user (Supabase mode)
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

  // Initialize session on mount
  useEffect(() => {
    // Local dev mode fallback if Supabase keys not set yet
    if (!isSupabaseConfigured) {
      const saved = getDevActiveSession();
      if (saved) {
        setUser(saved.user);
        setSession(saved.session);
        setProfile(saved.profile);
      }
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    // 1. Initial active session recovery from Supabase
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

    // 2. Real-time auth state changes listener
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
    // Local dev fallback if Supabase keys not configured in .env.local yet
    if (!isSupabaseConfigured) {
      const accounts = getDevAccounts();
      const identifier = emailOrUsername.trim().toLowerCase();
      const match = accounts.find(
        (a) => a.email.toLowerCase() === identifier || a.username.toLowerCase() === identifier
      );

      if (!match || match.passwordHash !== password) {
        return { success: false, error: 'Email/username or password is incorrect.' };
      }

      const mockUser: User = {
        id: match.id,
        app_metadata: {},
        user_metadata: { display_name: match.displayName, username: match.username },
        aud: 'authenticated',
        created_at: match.createdAt,
        email: match.email,
        phone: '',
        role: 'authenticated',
        updated_at: new Date().toISOString()
      };

      const mockSession: Session = {
        access_token: 'local-dev-token-' + match.id,
        token_type: 'bearer',
        expires_in: 3600,
        expires_at: Math.floor(Date.now() / 1000) + 3600,
        refresh_token: 'local-dev-refresh-' + match.id,
        user: mockUser
      };

      const devProfile: PhysoraProfile = {
        id: match.id,
        username: match.username,
        display_name: match.displayName,
        avatar_url: match.avatarUrl || null,
        bio: match.bio || null,
        created_at: match.createdAt,
        updated_at: new Date().toISOString()
      };

      setUser(mockUser);
      setSession(mockSession);
      setProfile(devProfile);
      saveDevActiveSession({ user: mockUser, session: mockSession, profile: devProfile });

      return { success: true };
    }

    try {
      let emailToUse = emailOrUsername.trim();

      if (!emailToUse.includes('@')) {
        const { data: profileMatch } = await supabase
          .from('profiles')
          .select('id')
          .ilike('username', emailToUse)
          .maybeSingle();

        if (profileMatch) {
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
    if (password !== confirmPassword) {
      return { success: false, error: 'Passwords do not match.' };
    }

    const cleanUsername = username.trim().toLowerCase();
    const cleanDisplayName = displayName.trim();
    const cleanEmail = email.trim().toLowerCase();

    // Local dev mode fallback if Supabase not configured in .env.local yet
    if (!isSupabaseConfigured) {
      const accounts = getDevAccounts();
      if (accounts.some((a) => a.username.toLowerCase() === cleanUsername)) {
        return { success: false, error: 'This username is already taken. Please choose another username.' };
      }
      if (accounts.some((a) => a.email.toLowerCase() === cleanEmail)) {
        return { success: false, error: 'An account with this email already exists.' };
      }

      const newId = 'physora-user-' + Date.now();
      const newAccount: DevAccount = {
        id: newId,
        email: cleanEmail,
        username: cleanUsername,
        displayName: cleanDisplayName,
        passwordHash: password,
        createdAt: new Date().toISOString()
      };

      accounts.push(newAccount);
      saveDevAccounts(accounts);

      const mockUser: User = {
        id: newId,
        app_metadata: {},
        user_metadata: { display_name: cleanDisplayName, username: cleanUsername },
        aud: 'authenticated',
        created_at: newAccount.createdAt,
        email: cleanEmail,
        phone: '',
        role: 'authenticated',
        updated_at: new Date().toISOString()
      };

      const mockSession: Session = {
        access_token: 'local-dev-token-' + newId,
        token_type: 'bearer',
        expires_in: 3600,
        expires_at: Math.floor(Date.now() / 1000) + 3600,
        refresh_token: 'local-dev-refresh-' + newId,
        user: mockUser
      };

      const newProfile: PhysoraProfile = {
        id: newId,
        username: cleanUsername,
        display_name: cleanDisplayName,
        avatar_url: null,
        bio: null,
        created_at: newAccount.createdAt,
        updated_at: newAccount.createdAt
      };

      setUser(mockUser);
      setSession(mockSession);
      setProfile(newProfile);
      saveDevActiveSession({ user: mockUser, session: mockSession, profile: newProfile });

      return { success: true, requiresVerification: false };
    }

    try {
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
      saveDevActiveSession(null);
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
      return { success: true };
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

  // Update Password
  const updatePassword = async (newPassword: string) => {
    if (!isSupabaseConfigured) {
      if (user) {
        const accounts = getDevAccounts();
        const acc = accounts.find((a) => a.id === user.id);
        if (acc) {
          acc.passwordHash = newPassword;
          saveDevAccounts(accounts);
        }
      }
      return { success: true };
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

  // Commercial Membership Tier State
  const [localTier, setLocalTier] = useState<MembershipTier>(() => {
    try {
      const stored = localStorage.getItem('physora_active_tier');
      if (stored === 'pro' || stored === 'institution' || stored === 'free') {
        return stored as MembershipTier;
      }
    } catch {
      // Ignore
    }
    return 'free';
  });

  const isFounderEmail = Boolean(
    user?.email?.toLowerCase().includes('pankaj') || 
    user?.email?.toLowerCase().includes('admin')
  );
  const effectiveTier: MembershipTier = isFounderEmail ? 'institution' : (profile?.membership_tier || localTier);
  const isPro = effectiveTier === 'pro' || effectiveTier === 'institution';
  const isInstitution = effectiveTier === 'institution';

  // Upgrade or switch commercial tier
  const upgradeTier = async (tier: MembershipTier, institutionName?: string) => {
    try {
      localStorage.setItem('physora_active_tier', tier);
      setLocalTier(tier);
    } catch {
      // Ignore
    }

    if (profile) {
      return await updateProfile({
        membership_tier: tier,
        institution_name: institutionName || profile.institution_name,
        role: tier === 'institution' ? 'teacher' : (profile.role || 'student')
      });
    }

    return { success: true };
  };

  // Update Profile details
  const updateProfile = async (updates: Partial<Pick<PhysoraProfile, 'display_name' | 'username' | 'bio' | 'avatar_url' | 'membership_tier' | 'institution_name' | 'role'>>) => {
    if (!user) {
      if (updates.membership_tier) {
        setLocalTier(updates.membership_tier);
      }
      return { success: true };
    }

    if (!isSupabaseConfigured) {
      if (profile) {
        const updated = {
          ...profile,
          ...updates,
          updated_at: new Date().toISOString()
        };
        setProfile(updated);
        const accounts = getDevAccounts();
        const acc = accounts.find((a) => a.id === user.id);
        if (acc) {
          if (updates.display_name) acc.displayName = updates.display_name;
          if (updates.bio !== undefined) acc.bio = updates.bio || undefined;
          saveDevAccounts(accounts);
        }
        if (session) {
          saveDevActiveSession({ user, session, profile: updated });
        }
      }
      return { success: true };
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
    } catch {
      return { success: false, error: 'Failed to update profile.' };
    }
  };

  // Explicit profile refresh
  const refreshProfile = async () => {
    if (user && isSupabaseConfigured) {
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
    membershipTier: effectiveTier,
    isPro,
    isInstitution,
    signIn,
    signUp,
    signOut,
    resetPasswordForEmail,
    updatePassword,
    updateProfile,
    upgradeTier,
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
