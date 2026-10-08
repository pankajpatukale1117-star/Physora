import React, { useState } from 'react';
import { Mail, ArrowLeft, ArrowRight, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { validateEmail } from './authHelpers';

interface ForgotPasswordFormProps {
  onBackToSignIn: () => void;
}

export const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({ onBackToSignIn }) => {
  const { resetPasswordForEmail } = useAuth();

  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      setError(emailValidation.error || 'Please enter a valid email address.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await resetPasswordForEmail(email.trim());
      if (res.success) {
        setIsSubmitted(true);
      } else {
        setError(res.error || 'Failed to send password reset link. Please try again.');
      }
    } catch {
      setError('A network error occurred. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
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
          Check Your Inbox
        </h3>

        <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 20 }}>
          If an account exists for <strong style={{ color: 'var(--text-primary)' }}>{email}</strong>, we have sent a secure password reset link.
        </p>

        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 24 }}>
          Please follow the instructions in the email within 1 hour to choose a new password.
        </p>

        <button
          type="button"
          onClick={onBackToSignIn}
          className="btn btn-secondary"
          style={{
            width: '100%',
            height: 42,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            fontSize: '0.88rem',
            fontWeight: 650
          }}
        >
          <ArrowLeft size={16} />
          <span>Return to Sign In</span>
        </button>
      </div>
    );
  }

  return (
    <div style={{ width: '100%' }}>
      <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 18 }}>
        Enter the email address registered with your Physora account. We will send you a secure verification link to reset your laboratory access password.
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label
            htmlFor="forgot-email"
            style={{ fontSize: '0.84rem', fontWeight: 650, color: 'var(--text-secondary)' }}
          >
            Account Email Address
          </label>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <span style={{ position: 'absolute', left: 12, color: 'var(--text-muted)', pointerEvents: 'none' }}>
              <Mail size={17} />
            </span>
            <input
              id="forgot-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError(null);
              }}
              placeholder="curie@physora.edu"
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '10px 14px 10px 38px',
                fontSize: '0.92rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-medium)',
                backgroundColor: 'var(--bg-surface)',
                color: 'var(--text-primary)',
                outline: 'none'
              }}
            />
          </div>
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
              <span>Sending Reset Link...</span>
            </>
          ) : (
            <>
              <span>Send Password Reset Link</span>
              <ArrowRight size={17} />
            </>
          )}
        </button>

        <button
          type="button"
          onClick={onBackToSignIn}
          style={{
            background: 'none',
            border: 'none',
            padding: '8px 0',
            fontSize: '0.84rem',
            fontWeight: 650,
            color: 'var(--text-tertiary)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-tertiary)')}
        >
          <ArrowLeft size={15} />
          <span>Back to Sign In</span>
        </button>
      </form>
    </div>
  );
};
