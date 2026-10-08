import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { validateEmail } from './authHelpers';

interface LoginFormProps {
  onSwitchToSignUp: () => void;
  onSwitchToForgotPassword: () => void;
  onSuccess?: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onSwitchToSignUp,
  onSwitchToForgotPassword,
  onSuccess
}) => {
  const { signIn, isConfigured } = useAuth();
  
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const trimmedIdentifier = emailOrUsername.trim();
    if (!trimmedIdentifier) {
      setFormError('Please enter your email or username.');
      return;
    }

    if (!password) {
      setFormError('Please enter your password.');
      return;
    }

    // Basic format check if email format is attempted
    if (trimmedIdentifier.includes('@')) {
      const emailValidation = validateEmail(trimmedIdentifier);
      if (!emailValidation.isValid) {
        setFormError(emailValidation.error || 'Please enter a valid email address.');
        return;
      }
    }

    setIsLoading(true);
    try {
      const result = await signIn({
        emailOrUsername: trimmedIdentifier,
        password
      });

      if (result.success) {
        if (onSuccess) onSuccess();
      } else {
        setFormError(result.error || 'Invalid credentials. Please try again.');
      }
    } catch {
      setFormError('An unexpected error occurred. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ width: '100%' }}>
      {/* Configuration Advisory if Supabase is unconfigured in development */}
      {!isConfigured && (
        <div
          role="alert"
          style={{
            marginBottom: 20,
            padding: '12px 14px',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(245, 158, 11, 0.1)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            color: 'var(--accent-amber)',
            fontSize: '0.82rem',
            lineHeight: 1.5,
            display: 'flex',
            alignItems: 'flex-start',
            gap: 10
          }}
        >
          <AlertCircle size={16} style={{ marginTop: 2, flexShrink: 0 }} />
          <div>
            <strong>Configuration Notice:</strong> Add your Supabase project keys to{' '}
            <code style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}>.env.local</code>{' '}
            (<code style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}>VITE_SUPABASE_URL</code> &{' '}
            <code style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}>VITE_SUPABASE_ANON_KEY</code>) to connect live authentication.
          </div>
        </div>
      )}

      {/* Main Error Banner */}
      {formError && (
        <div
          role="alert"
          style={{
            marginBottom: 18,
            padding: '10px 14px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--accent-error-soft)',
            border: '1px solid rgba(220, 38, 38, 0.25)',
            color: 'var(--accent-error)',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            animation: 'fadeIn 0.2s ease-out'
          }}
        >
          <AlertCircle size={16} style={{ flexShrink: 0 }} />
          <span style={{ fontWeight: 500 }}>{formError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        {/* Email or Username */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label
            htmlFor="login-identifier"
            style={{
              fontSize: '0.84rem',
              fontWeight: 650,
              color: 'var(--text-secondary)',
              letterSpacing: '0.01em'
            }}
          >
            Email or Username
          </label>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <span
              style={{
                position: 'absolute',
                left: 12,
                color: 'var(--text-muted)',
                pointerEvents: 'none',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <Mail size={17} />
            </span>
            <input
              id="login-identifier"
              type="text"
              autoComplete="username"
              required
              value={emailOrUsername}
              onChange={(e) => {
                setEmailOrUsername(e.target.value);
                if (formError) setFormError(null);
              }}
              placeholder="e.g. scientist@physora.edu or curie_phys"
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '10px 14px 10px 38px',
                fontSize: '0.92rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-medium)',
                backgroundColor: 'var(--bg-surface)',
                color: 'var(--text-primary)',
                outline: 'none',
                transition: 'border-color 0.15s ease, box-shadow 0.15s ease'
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'var(--brand-primary)';
                e.currentTarget.style.boxShadow = 'var(--shadow-glow)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-medium)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
          </div>
        </div>

        {/* Password */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label
              htmlFor="login-password"
              style={{
                fontSize: '0.84rem',
                fontWeight: 650,
                color: 'var(--text-secondary)',
                letterSpacing: '0.01em'
              }}
            >
              Password
            </label>
            <button
              type="button"
              onClick={onSwitchToForgotPassword}
              style={{
                background: 'none',
                border: 'none',
                padding: 0,
                fontSize: '0.8rem',
                fontWeight: 600,
                color: 'var(--brand-primary)',
                cursor: 'pointer',
                textDecoration: 'none'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')}
              onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}
            >
              Forgot password?
            </button>
          </div>

          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <span
              style={{
                position: 'absolute',
                left: 12,
                color: 'var(--text-muted)',
                pointerEvents: 'none',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <Lock size={17} />
            </span>
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (formError) setFormError(null);
              }}
              placeholder="••••••••••••"
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '10px 42px 10px 38px',
                fontSize: '0.92rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-medium)',
                backgroundColor: 'var(--bg-surface)',
                color: 'var(--text-primary)',
                outline: 'none',
                transition: 'border-color 0.15s ease, box-shadow 0.15s ease'
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'var(--brand-primary)';
                e.currentTarget.style.boxShadow = 'var(--shadow-glow)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-medium)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                right: 12,
                background: 'none',
                border: 'none',
                padding: 4,
                cursor: 'pointer',
                color: 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 'var(--radius-xs)'
              }}
              title={showPassword ? 'Hide password' : 'Show password'}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          style={{
            marginTop: 6,
            width: '100%',
            height: 44,
            borderRadius: 'var(--radius-md)',
            border: 'none',
            backgroundColor: 'var(--phet-navy)',
            color: '#FFFFFF',
            fontWeight: 700,
            fontSize: '0.94rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            cursor: isLoading ? 'not-allowed' : 'pointer',
            opacity: isLoading ? 0.75 : 1,
            transition: 'background-color 0.15s ease, transform 0.1s ease, box-shadow 0.15s ease',
            boxShadow: '0 2px 8px rgba(0, 39, 76, 0.25)'
          }}
          onMouseEnter={(e) => {
            if (!isLoading) e.currentTarget.style.backgroundColor = 'var(--phet-navy-light)';
          }}
          onMouseLeave={(e) => {
            if (!isLoading) e.currentTarget.style.backgroundColor = 'var(--phet-navy)';
          }}
        >
          {isLoading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              <span>Verifying Credentials...</span>
            </>
          ) : (
            <>
              <span>Sign In to Laboratory</span>
              <ArrowRight size={17} />
            </>
          )}
        </button>
      </form>

      {/* Switch to Sign Up */}
      <div
        style={{
          marginTop: 24,
          paddingTop: 18,
          borderTop: '1px solid var(--border-subtle)',
          textAlign: 'center',
          fontSize: '0.88rem',
          color: 'var(--text-tertiary)'
        }}
      >
        <span>Don't have a Physora account? </span>
        <button
          type="button"
          onClick={onSwitchToSignUp}
          style={{
            background: 'none',
            border: 'none',
            padding: 0,
            fontWeight: 700,
            color: 'var(--brand-primary)',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')}
          onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}
        >
          Create an account
        </button>
      </div>
    </div>
  );
};
