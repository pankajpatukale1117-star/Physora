import type { User, Session } from '@supabase/supabase-js';

export interface PhysoraProfile {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
  bio: string | null;
  created_at: string;
  updated_at: string;
}

export type AuthView = 
  | 'login' 
  | 'signup' 
  | 'forgot-password' 
  | 'reset-password' 
  | 'verify-email';

export interface LoginFormData {
  emailOrUsername: string;
  password: string;
}

export interface SignUpFormData {
  displayName: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface ForgotPasswordFormData {
  email: string;
}

export interface ResetPasswordFormData {
  password: string;
  confirmPassword: string;
}

export interface PasswordStrength {
  score: number; // 0 to 4
  label: 'Very Weak' | 'Weak' | 'Medium' | 'Strong' | 'Very Strong';
  color: string;
  requirements: {
    minLength: boolean; // >= 8 chars
    hasUppercase: boolean;
    hasLowercase: boolean;
    hasNumber: boolean;
    hasSpecial: boolean;
  };
}

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: PhysoraProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isConfigured: boolean;
  signIn: (data: LoginFormData) => Promise<{ success: boolean; error?: string }>;
  signUp: (data: SignUpFormData) => Promise<{ success: boolean; requiresVerification?: boolean; error?: string }>;
  signOut: () => Promise<void>;
  resetPasswordForEmail: (email: string) => Promise<{ success: boolean; error?: string }>;
  updatePassword: (password: string) => Promise<{ success: boolean; error?: string }>;
  updateProfile: (updates: Partial<Pick<PhysoraProfile, 'display_name' | 'username' | 'bio' | 'avatar_url'>>) => Promise<{ success: boolean; error?: string }>;
  refreshProfile: () => Promise<void>;
}
