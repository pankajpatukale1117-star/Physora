import React, { useState, useEffect } from 'react';
import { X, Shield } from 'lucide-react';
import { PhysoraLogo } from '../PhysoraLogo';
import { LoginForm } from './LoginForm';
import { SignUpForm } from './SignUpForm';
import { ForgotPasswordForm } from './ForgotPasswordForm';
import { ResetPasswordForm } from './ResetPasswordForm';
import { EmailVerificationNotice } from './EmailVerificationNotice';
import type { AuthView } from '../../types/auth';

interface AuthModalProps {
  isOpen: boolean;
  initialView?: AuthView;
  onClose: () => void;
  onSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialView = 'login',
  onClose,
  onSuccess
}) => {
  const [currentView, setCurrentView] = useState<AuthView>(initialView);
  const [pendingVerificationEmail, setPendingVerificationEmail] = useState<string>('');

  // Sync initial view if opened from external trigger
  useEffect(() => {
    if (isOpen) {
      setCurrentView(initialView);
    }
  }, [isOpen, initialView]);

  // Handle escape key to close
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleRequiresVerification = (email: string) => {
    setPendingVerificationEmail(email);
    setCurrentView('verify-email');
  };

  const handleAuthSuccess = () => {
    if (onSuccess) onSuccess();
    onClose();
  };

  return (
    <div
      className="experiment-modal-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
      style={{
        zIndex: 1050,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
    >
      <div
        className="auth-modal-card"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 460,
          backgroundColor: 'var(--bg-surface)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-xl)',
          border: '1px solid var(--border-medium)',
          padding: '28px 30px',
          position: 'relative',
          maxHeight: '92vh',
          overflowY: 'auto'
        }}
      >
        {/* Modal Close Button */}
        <button
          type="button"
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 18,
            right: 18,
            background: 'none',
            border: 'none',
            padding: 6,
            borderRadius: 'var(--radius-sm)',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          aria-label="Close authentication window"
        >
          <X size={20} />
        </button>

        {/* Physora Brand Identity Header */}
        <div style={{ textAlign: 'center', marginBottom: 22 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
            <PhysoraLogo variant="horizontal" size={36} />
          </div>

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              fontSize: '0.7rem',
              fontWeight: 800,
              padding: '2px 8px',
              borderRadius: 12,
              backgroundColor: 'var(--brand-primary-soft)',
              color: 'var(--brand-primary)',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              marginBottom: 10
            }}
          >
            <Shield size={12} />
            Laboratory Access & Authentication
          </div>

          <h2
            id="auth-modal-title"
            style={{
              fontSize: '1.35rem',
              fontWeight: 800,
              color: 'var(--text-primary)',
              letterSpacing: '-0.02em',
              margin: 0
            }}
          >
            {currentView === 'login' && 'Sign in to Physora'}
            {currentView === 'signup' && 'Create Your Researcher Account'}
            {currentView === 'forgot-password' && 'Reset Access Password'}
            {currentView === 'reset-password' && 'Set New Password'}
            {currentView === 'verify-email' && 'Verify Your Email'}
          </h2>

          <p style={{ fontSize: '0.86rem', color: 'var(--text-tertiary)', marginTop: 4, marginBottom: 0 }}>
            {currentView === 'login' && 'Access interactive simulations, custom setups & lab data.'}
            {currentView === 'signup' && 'Join students and educators worldwide in interactive STEM.'}
            {currentView === 'forgot-password' && 'Recover access to your registered laboratory workspace.'}
            {currentView === 'reset-password' && 'Enter and confirm your new laboratory access password.'}
            {currentView === 'verify-email' && 'Check your inbox to complete registration.'}
          </p>
        </div>

        {/* Tab switch between Sign In and Sign Up */}
        {(currentView === 'login' || currentView === 'signup') && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 4,
              backgroundColor: 'var(--bg-subtle)',
              padding: 4,
              borderRadius: 'var(--radius-md)',
              marginBottom: 20,
              border: '1px solid var(--border-subtle)'
            }}
          >
            <button
              type="button"
              onClick={() => setCurrentView('login')}
              style={{
                padding: '8px 0',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.86rem',
                fontWeight: currentView === 'login' ? 750 : 600,
                backgroundColor: currentView === 'login' ? 'var(--bg-surface)' : 'transparent',
                color: currentView === 'login' ? 'var(--text-primary)' : 'var(--text-tertiary)',
                boxShadow: currentView === 'login' ? 'var(--shadow-sm)' : 'none',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setCurrentView('signup')}
              style={{
                padding: '8px 0',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.86rem',
                fontWeight: currentView === 'signup' ? 750 : 600,
                backgroundColor: currentView === 'signup' ? 'var(--bg-surface)' : 'transparent',
                color: currentView === 'signup' ? 'var(--text-primary)' : 'var(--text-tertiary)',
                boxShadow: currentView === 'signup' ? 'var(--shadow-sm)' : 'none',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              Create Account
            </button>
          </div>
        )}

        {/* Form Body Views */}
        {currentView === 'login' && (
          <LoginForm
            onSwitchToSignUp={() => setCurrentView('signup')}
            onSwitchToForgotPassword={() => setCurrentView('forgot-password')}
            onSuccess={handleAuthSuccess}
          />
        )}

        {currentView === 'signup' && (
          <SignUpForm
            onSwitchToSignIn={() => setCurrentView('login')}
            onRequiresVerification={handleRequiresVerification}
            onSuccess={handleAuthSuccess}
          />
        )}

        {currentView === 'forgot-password' && (
          <ForgotPasswordForm onBackToSignIn={() => setCurrentView('login')} />
        )}

        {currentView === 'reset-password' && (
          <ResetPasswordForm onSuccess={() => setCurrentView('login')} />
        )}

        {currentView === 'verify-email' && (
          <EmailVerificationNotice
            email={pendingVerificationEmail}
            onBackToSignIn={() => setCurrentView('login')}
          />
        )}
      </div>
    </div>
  );
};
