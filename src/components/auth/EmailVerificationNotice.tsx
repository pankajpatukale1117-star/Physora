import React, { useState, useEffect } from 'react';
import { Mail, ArrowLeft, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase, formatAuthError } from '../../lib/supabase';

interface EmailVerificationNoticeProps {
  email: string;
  onBackToSignIn: () => void;
}

export const EmailVerificationNotice: React.FC<EmailVerificationNoticeProps> = ({
  email,
  onBackToSignIn
}) => {
  const [resendCooldown, setResendCooldown] = useState(60);
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [resendError, setResendError] = useState<string | null>(null);

  // Countdown timer for resend cooldown
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleResend = async () => {
    if (resendCooldown > 0 || isResending) return;

    setIsResending(true);
    setResendError(null);
    setResendSuccess(false);

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email.trim()
      });

      if (error) {
        setResendError(formatAuthError(error));
      } else {
        setResendSuccess(true);
        setResendCooldown(60);
      }
    } catch {
      setResendError('Network error while requesting verification email.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div style={{ textAlign: 'center', padding: '10px 4px' }}>
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: '50%',
          backgroundColor: 'var(--brand-primary-soft)',
          color: 'var(--brand-primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px auto',
          border: '1px solid var(--brand-primary-border)'
        }}
      >
        <Mail size={28} />
      </div>

      <h3 style={{ fontSize: '1.2rem', fontWeight: 750, color: 'var(--text-primary)', marginBottom: 8 }}>
        Check Your Email
      </h3>

      <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 16 }}>
        Your Physora account is almost ready. We have dispatched a secure verification link to{' '}
        <strong style={{ color: 'var(--text-primary)' }}>{email}</strong>.
      </p>

      <div
        style={{
          backgroundColor: 'var(--bg-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '12px 16px',
          marginBottom: 20,
          border: '1px solid var(--border-subtle)',
          textAlign: 'left',
          fontSize: '0.82rem',
          color: 'var(--text-tertiary)',
          lineHeight: 1.5
        }}
      >
        <p style={{ margin: 0, marginBottom: 6 }}>
          • Open the link on this device to activate full simulation access.
        </p>
        <p style={{ margin: 0 }}>
          • If you don't see it within 2 minutes, check your junk or spam folder.
        </p>
      </div>

      {resendSuccess && (
        <div
          role="alert"
          style={{
            marginBottom: 16,
            padding: '8px 12px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--accent-success-soft)',
            border: '1px solid rgba(5, 150, 105, 0.25)',
            color: 'var(--accent-success)',
            fontSize: '0.82rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6
          }}
        >
          <CheckCircle size={15} />
          <span>New verification email sent.</span>
        </div>
      )}

      {resendError && (
        <div
          role="alert"
          style={{
            marginBottom: 16,
            padding: '8px 12px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--accent-error-soft)',
            border: '1px solid rgba(220, 38, 38, 0.25)',
            color: 'var(--accent-error)',
            fontSize: '0.82rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6
          }}
        >
          <AlertCircle size={15} />
          <span>{resendError}</span>
        </div>
      )}

      {/* Resend button */}
      <div style={{ marginBottom: 20 }}>
        <button
          type="button"
          onClick={handleResend}
          disabled={resendCooldown > 0 || isResending}
          style={{
            background: 'none',
            border: 'none',
            color: resendCooldown > 0 ? 'var(--text-muted)' : 'var(--brand-primary)',
            fontSize: '0.85rem',
            fontWeight: 650,
            cursor: resendCooldown > 0 ? 'not-allowed' : 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6
          }}
        >
          <RefreshCw size={14} className={isResending ? 'animate-spin' : ''} />
          <span>
            {resendCooldown > 0
              ? `Resend link in ${resendCooldown}s`
              : isResending
              ? 'Sending...'
              : 'Resend Verification Email'}
          </span>
        </button>
      </div>

      {/* Return to Sign In */}
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
        <span>Back to Sign In</span>
      </button>
    </div>
  );
};
