import React, { useState, useMemo } from 'react';
import { 
  User, 
  AtSign, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Check, 
  X, 
  ArrowRight, 
  Loader2, 
  AlertCircle 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { 
  validateUsername, 
  validateEmail, 
  validateDisplayName, 
  calculatePasswordStrength 
} from './authHelpers';

interface SignUpFormProps {
  onSwitchToSignIn: () => void;
  onRequiresVerification: (email: string) => void;
  onSuccess?: () => void;
}

export const SignUpForm: React.FC<SignUpFormProps> = ({
  onSwitchToSignIn,
  onRequiresVerification,
  onSuccess
}) => {
  const { signUp, isConfigured } = useAuth();

  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  // Field Validations
  const nameError = useMemo(() => {
    if (!touched.displayName) return null;
    const v = validateDisplayName(displayName);
    return v.isValid ? null : v.error;
  }, [displayName, touched.displayName]);

  const usernameError = useMemo(() => {
    if (!touched.username) return null;
    const v = validateUsername(username);
    return v.isValid ? null : v.error;
  }, [username, touched.username]);

  const emailError = useMemo(() => {
    if (!touched.email) return null;
    const v = validateEmail(email);
    return v.isValid ? null : v.error;
  }, [email, touched.email]);

  const passwordStrength = useMemo(() => {
    return calculatePasswordStrength(password);
  }, [password]);

  const passwordsMatch = useMemo(() => {
    if (!confirmPassword) return null;
    return password === confirmPassword;
  }, [password, confirmPassword]);

  const isFormValid = useMemo(() => {
    const isNameOk = validateDisplayName(displayName).isValid;
    const isUserOk = validateUsername(username).isValid;
    const isEmailOk = validateEmail(email).isValid;
    const isPassOk = passwordStrength.score >= 2; // At least medium strength
    const isMatch = password === confirmPassword && confirmPassword.length > 0;
    return isNameOk && isUserOk && isEmailOk && isPassOk && isMatch;
  }, [displayName, username, email, passwordStrength, password, confirmPassword]);

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    // Mark all as touched
    setTouched({
      displayName: true,
      username: true,
      email: true,
      password: true,
      confirmPassword: true
    });

    if (!isFormValid) {
      if (password !== confirmPassword) {
        setServerError('Passwords do not match.');
      } else if (passwordStrength.score < 2) {
        setServerError('Please choose a stronger password before continuing.');
      } else {
        setServerError('Please correct the highlighted form errors.');
      }
      return;
    }

    setIsLoading(true);
    try {
      const result = await signUp({
        displayName,
        username,
        email,
        password,
        confirmPassword
      });

      if (result.success) {
        if (result.requiresVerification) {
          onRequiresVerification(email.trim());
        } else if (onSuccess) {
          onSuccess();
        }
      } else {
        setServerError(result.error || 'Unable to register account. Please try again.');
      }
    } catch {
      setServerError('A network error occurred. Please verify your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ width: '100%' }}>
      {/* Dev Advisory if Supabase is unconfigured */}
      {!isConfigured && (
        <div
          role="alert"
          style={{
            marginBottom: 16,
            padding: '10px 14px',
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
            <strong>Configuration Notice:</strong> Real registration requires Supabase keys in{' '}
            <code style={{ fontFamily: 'var(--font-mono)' }}>.env.local</code>.
          </div>
        </div>
      )}

      {/* Server Error Alert */}
      {serverError && (
        <div
          role="alert"
          style={{
            marginBottom: 16,
            padding: '10px 14px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--accent-error-soft)',
            border: '1px solid rgba(220, 38, 38, 0.25)',
            color: 'var(--accent-error)',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: 10
          }}
        >
          <AlertCircle size={16} style={{ flexShrink: 0 }} />
          <span style={{ fontWeight: 500 }}>{serverError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* Row 1: Display Name & Username */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
          {/* Display Name */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            <label
              htmlFor="signup-display-name"
              style={{ fontSize: '0.82rem', fontWeight: 650, color: 'var(--text-secondary)' }}
            >
              Full Name
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <span style={{ position: 'absolute', left: 10, color: 'var(--text-muted)', pointerEvents: 'none' }}>
                <User size={16} />
              </span>
              <input
                id="signup-display-name"
                type="text"
                autoComplete="name"
                required
                value={displayName}
                onChange={(e) => {
                  setDisplayName(e.target.value);
                  if (serverError) setServerError(null);
                }}
                onBlur={() => handleBlur('displayName')}
                placeholder="e.g. Marie Curie"
                disabled={isLoading}
                style={{
                  width: '100%',
                  padding: '9px 12px 9px 34px',
                  fontSize: '0.88rem',
                  borderRadius: 'var(--radius-md)',
                  border: `1px solid ${nameError ? 'var(--accent-error)' : 'var(--border-medium)'}`,
                  backgroundColor: 'var(--bg-surface)',
                  color: 'var(--text-primary)',
                  outline: 'none'
                }}
              />
            </div>
            {nameError && (
              <span style={{ fontSize: '0.74rem', color: 'var(--accent-error)', fontWeight: 500 }}>
                {nameError}
              </span>
            )}
          </div>

          {/* Username */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            <label
              htmlFor="signup-username"
              style={{ fontSize: '0.82rem', fontWeight: 650, color: 'var(--text-secondary)' }}
            >
              Username
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <span style={{ position: 'absolute', left: 10, color: 'var(--text-muted)', pointerEvents: 'none' }}>
                <AtSign size={16} />
              </span>
              <input
                id="signup-username"
                type="text"
                autoComplete="username"
                required
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value.toLowerCase().replace(/\s+/g, ''));
                  if (serverError) setServerError(null);
                }}
                onBlur={() => handleBlur('username')}
                placeholder="curie_rad"
                disabled={isLoading}
                style={{
                  width: '100%',
                  padding: '9px 12px 9px 34px',
                  fontSize: '0.88rem',
                  borderRadius: 'var(--radius-md)',
                  border: `1px solid ${usernameError ? 'var(--accent-error)' : 'var(--border-medium)'}`,
                  backgroundColor: 'var(--bg-surface)',
                  color: 'var(--text-primary)',
                  outline: 'none',
                  fontFamily: 'var(--font-mono)'
                }}
              />
            </div>
            {usernameError && (
              <span style={{ fontSize: '0.74rem', color: 'var(--accent-error)', fontWeight: 500 }}>
                {usernameError}
              </span>
            )}
          </div>
        </div>

        {/* Email Address */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          <label
            htmlFor="signup-email"
            style={{ fontSize: '0.82rem', fontWeight: 650, color: 'var(--text-secondary)' }}
          >
            Email Address
          </label>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <span style={{ position: 'absolute', left: 10, color: 'var(--text-muted)', pointerEvents: 'none' }}>
              <Mail size={16} />
            </span>
            <input
              id="signup-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (serverError) setServerError(null);
              }}
              onBlur={() => handleBlur('email')}
              placeholder="marie@curie-lab.org"
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '9px 12px 9px 34px',
                fontSize: '0.88rem',
                borderRadius: 'var(--radius-md)',
                border: `1px solid ${emailError ? 'var(--accent-error)' : 'var(--border-medium)'}`,
                backgroundColor: 'var(--bg-surface)',
                color: 'var(--text-primary)',
                outline: 'none'
              }}
            />
          </div>
          {emailError && (
            <span style={{ fontSize: '0.74rem', color: 'var(--accent-error)', fontWeight: 500 }}>
              {emailError}
            </span>
          )}
        </div>

        {/* Password */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          <label
            htmlFor="signup-password"
            style={{ fontSize: '0.82rem', fontWeight: 650, color: 'var(--text-secondary)' }}
          >
            Password
          </label>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <span style={{ position: 'absolute', left: 10, color: 'var(--text-muted)', pointerEvents: 'none' }}>
              <Lock size={16} />
            </span>
            <input
              id="signup-password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (serverError) setServerError(null);
              }}
              onBlur={() => handleBlur('password')}
              placeholder="At least 8 characters"
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '9px 38px 9px 34px',
                fontSize: '0.88rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-medium)',
                backgroundColor: 'var(--bg-surface)',
                color: 'var(--text-primary)',
                outline: 'none'
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                right: 10,
                background: 'none',
                border: 'none',
                padding: 4,
                cursor: 'pointer',
                color: 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center'
              }}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {/* Password Strength Meter */}
          {password.length > 0 && (
            <div style={{ marginTop: 6 }}>
              {/* Progress Bar Segments */}
              <div style={{ display: 'flex', gap: 4, height: 4, marginBottom: 5 }}>
                {[1, 2, 3, 4].map((step) => (
                  <div
                    key={step}
                    style={{
                      flex: 1,
                      borderRadius: 2,
                      backgroundColor:
                        passwordStrength.score >= step
                          ? passwordStrength.color
                          : 'var(--border-subtle)',
                      transition: 'background-color 0.2s ease'
                    }}
                  />
                ))}
              </div>

              {/* Strength Label and Micro-Requirements */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    color: passwordStrength.color
                  }}
                >
                  Strength: {passwordStrength.label}
                </span>

                <div style={{ display: 'flex', gap: 8, fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  <span style={{ color: passwordStrength.requirements.minLength ? 'var(--accent-success)' : 'inherit' }}>
                    8+ chars {passwordStrength.requirements.minLength ? '✓' : ''}
                  </span>
                  <span style={{ color: passwordStrength.requirements.hasNumber ? 'var(--accent-success)' : 'inherit' }}>
                    123 {passwordStrength.requirements.hasNumber ? '✓' : ''}
                  </span>
                  <span style={{ color: passwordStrength.requirements.hasSpecial ? 'var(--accent-success)' : 'inherit' }}>
                    @#$ {passwordStrength.requirements.hasSpecial ? '✓' : ''}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Confirm Password */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          <label
            htmlFor="signup-confirm-password"
            style={{ fontSize: '0.82rem', fontWeight: 650, color: 'var(--text-secondary)' }}
          >
            Confirm Password
          </label>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <span style={{ position: 'absolute', left: 10, color: 'var(--text-muted)', pointerEvents: 'none' }}>
              <Lock size={16} />
            </span>
            <input
              id="signup-confirm-password"
              type={showConfirmPassword ? 'text' : 'password'}
              autoComplete="new-password"
              required
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (serverError) setServerError(null);
              }}
              onBlur={() => handleBlur('confirmPassword')}
              placeholder="Re-enter password"
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '9px 38px 9px 34px',
                fontSize: '0.88rem',
                borderRadius: 'var(--radius-md)',
                border: `1px solid ${
                  passwordsMatch === false
                    ? 'var(--accent-error)'
                    : passwordsMatch === true
                    ? 'var(--accent-success)'
                    : 'var(--border-medium)'
                }`,
                backgroundColor: 'var(--bg-surface)',
                color: 'var(--text-primary)',
                outline: 'none'
              }}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              style={{
                position: 'absolute',
                right: 10,
                background: 'none',
                border: 'none',
                padding: 4,
                cursor: 'pointer',
                color: 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center'
              }}
              aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
            >
              {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {/* Match Status Feedback */}
          {confirmPassword.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
              {passwordsMatch ? (
                <>
                  <Check size={14} color="var(--accent-success)" />
                  <span style={{ fontSize: '0.74rem', color: 'var(--accent-success)', fontWeight: 600 }}>
                    Passwords match
                  </span>
                </>
              ) : (
                <>
                  <X size={14} color="var(--accent-error)" />
                  <span style={{ fontSize: '0.74rem', color: 'var(--accent-error)', fontWeight: 600 }}>
                    Passwords do not match
                  </span>
                </>
              )}
            </div>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          style={{
            marginTop: 8,
            width: '100%',
            height: 44,
            borderRadius: 'var(--radius-md)',
            border: 'none',
            backgroundColor: 'var(--phet-orange)',
            color: '#FFFFFF',
            fontWeight: 700,
            fontSize: '0.94rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            cursor: isLoading ? 'not-allowed' : 'pointer',
            opacity: isLoading ? 0.75 : 1,
            boxShadow: '0 2px 8px rgba(255, 102, 0, 0.35)',
            transition: 'background-color 0.15s ease'
          }}
          onMouseEnter={(e) => {
            if (!isLoading) e.currentTarget.style.backgroundColor = 'var(--phet-orange-hover)';
          }}
          onMouseLeave={(e) => {
            if (!isLoading) e.currentTarget.style.backgroundColor = 'var(--phet-orange)';
          }}
        >
          {isLoading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              <span>Creating Physora Account...</span>
            </>
          ) : (
            <>
              <span>Create Laboratory Account</span>
              <ArrowRight size={17} />
            </>
          )}
        </button>
      </form>

      {/* Switch to Sign In */}
      <div
        style={{
          marginTop: 20,
          paddingTop: 16,
          borderTop: '1px solid var(--border-subtle)',
          textAlign: 'center',
          fontSize: '0.86rem',
          color: 'var(--text-tertiary)'
        }}
      >
        <span>Already have an account? </span>
        <button
          type="button"
          onClick={onSwitchToSignIn}
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
          Sign in
        </button>
      </div>
    </div>
  );
};
