import React, { useState, useMemo } from 'react';
import { Lock, Eye, EyeOff, Check, X, ArrowRight, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { calculatePasswordStrength } from './authHelpers';

interface ResetPasswordFormProps {
  onSuccess: () => void;
}

export const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({ onSuccess }) => {
  const { updatePassword } = useAuth();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const passwordStrength = useMemo(() => {
    return calculatePasswordStrength(password);
  }, [password]);

  const passwordsMatch = useMemo(() => {
    if (!confirmPassword) return null;
    return password === confirmPassword;
  }, [password, confirmPassword]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (passwordStrength.score < 2) {
      setError('Please choose a stronger password.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await updatePassword(password);
      if (res.success) {
        setIsSuccess(true);
      } else {
        setError(res.error || 'Failed to update password. Your reset link may have expired.');
      }
    } catch {
      setError('A connection error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div style={{ textAlign: 'center', padding: '12px 6px' }}>
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: '50%',
            backgroundColor: 'var(--accent-success-soft)',
            color: 'var(--accent-success)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 18px auto',
            border: '1px solid rgba(5, 150, 105, 0.25)'
          }}
        >
          <CheckCircle size={26} />
        </div>

        <h3 style={{ fontSize: '1.15rem', fontWeight: 750, color: 'var(--text-primary)', marginBottom: 8 }}>
          Password Reset Successfully
        </h3>

        <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 24 }}>
          Your Physora account password has been updated securely. You are now ready to access the laboratory.
        </p>

        <button
          type="button"
          onClick={onSuccess}
          style={{
            width: '100%',
            height: 44,
            borderRadius: 'var(--radius-md)',
            border: 'none',
            backgroundColor: 'var(--phet-navy)',
            color: '#FFFFFF',
            fontWeight: 700,
            fontSize: '0.92rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            cursor: 'pointer'
          }}
        >
          <span>Continue to Laboratory</span>
          <ArrowRight size={17} />
        </button>
      </div>
    );
  }

  return (
    <div style={{ width: '100%' }}>
      <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 18 }}>
        Please choose a new, strong password for your Physora account.
      </p>

      {error && (
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
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* New Password */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label
            htmlFor="reset-password-input"
            style={{ fontSize: '0.84rem', fontWeight: 650, color: 'var(--text-secondary)' }}
          >
            New Password
          </label>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <span style={{ position: 'absolute', left: 12, color: 'var(--text-muted)', pointerEvents: 'none' }}>
              <Lock size={17} />
            </span>
            <input
              id="reset-password-input"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) setError(null);
              }}
              placeholder="At least 8 characters"
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '10px 42px 10px 38px',
                fontSize: '0.92rem',
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
                right: 12,
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
              {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>

          {/* Strength Meter */}
          {password.length > 0 && (
            <div style={{ marginTop: 4 }}>
              <div style={{ display: 'flex', gap: 4, height: 4, marginBottom: 4 }}>
                {[1, 2, 3, 4].map((step) => (
                  <div
                    key={step}
                    style={{
                      flex: 1,
                      borderRadius: 2,
                      backgroundColor:
                        passwordStrength.score >= step ? passwordStrength.color : 'var(--border-subtle)',
                      transition: 'background-color 0.2s ease'
                    }}
                  />
                ))}
              </div>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: passwordStrength.color }}>
                Strength: {passwordStrength.label}
              </span>
            </div>
          )}
        </div>

        {/* Confirm New Password */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label
            htmlFor="reset-confirm-password-input"
            style={{ fontSize: '0.84rem', fontWeight: 650, color: 'var(--text-secondary)' }}
          >
            Confirm New Password
          </label>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <span style={{ position: 'absolute', left: 12, color: 'var(--text-muted)', pointerEvents: 'none' }}>
              <Lock size={17} />
            </span>
            <input
              id="reset-confirm-password-input"
              type={showConfirmPassword ? 'text' : 'password'}
              autoComplete="new-password"
              required
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (error) setError(null);
              }}
              placeholder="Confirm new password"
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '10px 42px 10px 38px',
                fontSize: '0.92rem',
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
                right: 12,
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
              {showConfirmPassword ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>

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

        <button
          type="submit"
          disabled={isLoading}
          style={{
            width: '100%',
            height: 44,
            borderRadius: 'var(--radius-md)',
            border: 'none',
            backgroundColor: 'var(--phet-navy)',
            color: '#FFFFFF',
            fontWeight: 700,
            fontSize: '0.92rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            cursor: isLoading ? 'not-allowed' : 'pointer',
            opacity: isLoading ? 0.75 : 1,
            boxShadow: '0 2px 8px rgba(0, 39, 76, 0.25)'
          }}
        >
          {isLoading ? (
            <>
              <Loader2 size={17} className="animate-spin" />
              <span>Updating Password...</span>
            </>
          ) : (
            <>
              <span>Save & Update Password</span>
              <ArrowRight size={17} />
            </>
          )}
        </button>
      </form>
    </div>
  );
};
