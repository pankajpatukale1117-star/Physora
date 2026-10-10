import React, { useState } from 'react';
import { 
  X, 
  User, 
  AtSign, 
  Mail, 
  Calendar, 
  LogOut, 
  Save, 
  Loader2, 
  CheckCircle, 
  AlertCircle,
  ShieldCheck,
  FlaskConical,
  Zap,
  ExternalLink,
  Sparkles,
  CreditCard,
  Crown
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { openStripeCustomerPortal } from '../../services/stripeService';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenPricing?: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({ isOpen, onClose, onOpenPricing }) => {
  const { user, profile, updateProfile, signOut, membershipTier, isPro, isInstitution, upgradeTier } = useAuth();
  const [isOpeningPortal, setIsOpeningPortal] = useState(false);
  const [portalError, setPortalError] = useState<string | null>(null);

  const [displayName, setDisplayName] = useState(profile?.display_name || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [isSaving, setIsSaving] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  if (!isOpen || !user) return null;

  const userInitial = (profile?.display_name || user.email || 'P')
    .charAt(0)
    .toUpperCase();

  const formattedJoinDate = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    : 'Recent Member';

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      const res = await updateProfile({
        display_name: displayName.trim(),
        bio: bio.trim() || null
      });

      if (res.success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        setSaveError(res.error || 'Failed to update profile.');
      }
    } catch {
      setSaveError('An unexpected error occurred while saving.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut();
      onClose();
    } catch {
      // Done
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <div
      className="experiment-modal-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="User Profile and Account"
      style={{ zIndex: 1050 }}
    >
      <div
        className="auth-modal-card"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 520,
          maxHeight: '90vh',
          overflowY: 'auto',
          backgroundColor: 'var(--bg-surface)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-xl)',
          border: '1px solid var(--border-medium)',
          padding: '24px 28px',
          position: 'relative'
        }}
      >
        {/* Close Button */}
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
          aria-label="Close profile modal"
        >
          <X size={20} />
        </button>

        {/* Header Profile Identity */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
          <div
            style={{
              width: 58,
              height: 58,
              borderRadius: '50%',
              backgroundColor: 'var(--phet-navy)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.4rem',
              fontWeight: 800,
              boxShadow: '0 4px 12px rgba(0, 39, 76, 0.25)',
              border: '2px solid var(--brand-primary-border)'
            }}
          >
            {userInitial}
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                {profile?.display_name || 'Physora Scientist'}
              </h2>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  fontSize: '0.68rem',
                  fontWeight: 750,
                  padding: '2px 7px',
                  borderRadius: 12,
                  backgroundColor: 'var(--brand-primary-soft)',
                  color: 'var(--brand-primary)',
                  border: '1px solid var(--brand-primary-border)'
                }}
              >
                <ShieldCheck size={12} />
                VERIFIED
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>
                @{profile?.username || 'user'}
              </span>
              <span style={{ color: 'var(--text-muted)' }}>•</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <Calendar size={13} />
                Joined {formattedJoinDate}
              </span>
            </div>
          </div>
        </div>

        {/* Feedback alerts */}
        {saveSuccess && (
          <div
            role="alert"
            style={{
              marginBottom: 16,
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--accent-success-soft)',
              border: '1px solid rgba(5, 150, 105, 0.25)',
              color: 'var(--accent-success)',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}
          >
            <CheckCircle size={16} />
            <span>Profile information updated successfully.</span>
          </div>
        )}

        {saveError && (
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
              gap: 8
            }}
          >
            <AlertCircle size={16} />
            <span>{saveError}</span>
          </div>
        )}

        {/* Profile Edit Form */}
        <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Email (Read-Only) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            <label style={{ fontSize: '0.82rem', fontWeight: 650, color: 'var(--text-secondary)' }}>
              Registered Email (Primary Identity)
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <span style={{ position: 'absolute', left: 10, color: 'var(--text-muted)', pointerEvents: 'none' }}>
                <Mail size={16} />
              </span>
              <input
                type="email"
                disabled
                value={user.email || ''}
                style={{
                  width: '100%',
                  padding: '9px 12px 9px 34px',
                  fontSize: '0.88rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  backgroundColor: 'var(--bg-subtle)',
                  color: 'var(--text-muted)',
                  cursor: 'not-allowed'
                }}
              />
            </div>
          </div>

          {/* Display Name */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            <label htmlFor="profile-display-name" style={{ fontSize: '0.82rem', fontWeight: 650, color: 'var(--text-secondary)' }}>
              Display Name
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <span style={{ position: 'absolute', left: 10, color: 'var(--text-muted)', pointerEvents: 'none' }}>
                <User size={16} />
              </span>
              <input
                id="profile-display-name"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Full display name"
                disabled={isSaving}
                style={{
                  width: '100%',
                  padding: '9px 12px 9px 34px',
                  fontSize: '0.88rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-medium)',
                  backgroundColor: 'var(--bg-surface)',
                  color: 'var(--text-primary)',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          {/* Username (Read-Only with @ indicator) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            <label style={{ fontSize: '0.82rem', fontWeight: 650, color: 'var(--text-secondary)' }}>
              Physora Scientific Handle
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <span style={{ position: 'absolute', left: 10, color: 'var(--text-muted)', pointerEvents: 'none' }}>
                <AtSign size={16} />
              </span>
              <input
                type="text"
                disabled
                value={profile?.username || ''}
                style={{
                  width: '100%',
                  padding: '9px 12px 9px 34px',
                  fontSize: '0.88rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  backgroundColor: 'var(--bg-subtle)',
                  color: 'var(--text-secondary)',
                  fontFamily: 'var(--font-mono)',
                  cursor: 'default'
                }}
              />
            </div>
          </div>

          {/* Bio / Research Field */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            <label htmlFor="profile-bio" style={{ fontSize: '0.82rem', fontWeight: 650, color: 'var(--text-secondary)' }}>
              Research Interests / Bio
            </label>
            <textarea
              id="profile-bio"
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="e.g. Studying quantum mechanics and astrophysics for JEE Advanced"
              disabled={isSaving}
              style={{
                width: '100%',
                padding: '10px 12px',
                fontSize: '0.88rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-medium)',
                backgroundColor: 'var(--bg-surface)',
                color: 'var(--text-primary)',
                outline: 'none',
                resize: 'vertical'
              }}
            />
          </div>

          {/* Save Button */}
          <button
            type="submit"
            disabled={isSaving}
            className="btn btn-primary"
            style={{
              marginTop: 4,
              height: 40,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              fontSize: '0.88rem',
              fontWeight: 700
            }}
          >
            {isSaving ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Saving Changes...</span>
              </>
            ) : (
              <>
                <Save size={16} />
                <span>Save Profile Changes</span>
              </>
            )}
          </button>
        </form>

        {/* Commercial Subscription & Stripe Billing Card */}
        <div
          style={{
            marginTop: 20,
            padding: '14px 16px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: isPro ? 'rgba(37, 99, 235, 0.05)' : 'var(--bg-subtle)',
            border: isPro ? '1px solid rgba(37, 99, 235, 0.25)' : '1px solid var(--border-subtle)',
            display: 'flex',
            flexDirection: 'column',
            gap: 10
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {isInstitution ? (
                <ShieldCheck size={18} color="#7C3AED" />
              ) : isPro ? (
                <Zap size={18} color="#2563EB" />
              ) : (
                <CreditCard size={18} color="var(--text-secondary)" />
              )}
              <div>
                <span style={{ fontSize: '0.74rem', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em', color: 'var(--text-tertiary)' }}>
                  Current Tier
                </span>
                <div style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {membershipTier === 'institution'
                    ? 'Classroom & School License'
                    : membershipTier === 'pro'
                    ? 'Physora Pro (Active)'
                    : 'Free Explorer Plan'}
                </div>
              </div>
            </div>

            {isPro ? (
              <button
                type="button"
                disabled={isOpeningPortal}
                onClick={async () => {
                  setPortalError(null);
                  setIsOpeningPortal(true);
                  const res = await openStripeCustomerPortal();
                  if (!res.success) {
                    setIsOpeningPortal(false);
                    setPortalError(res.error || 'Unable to open Stripe portal.');
                  }
                }}
                style={{
                  padding: '7px 12px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-medium)',
                  color: '#2563EB',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: isOpeningPortal ? 'wait' : 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6
                }}
              >
                {isOpeningPortal ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : (
                  <ExternalLink size={13} />
                )}
                <span>Manage in Stripe</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  if (onOpenPricing) {
                    onOpenPricing();
                  } else {
                    window.location.hash = '#pricing';
                  }
                }}
                style={{
                  padding: '7px 14px',
                  borderRadius: 'var(--radius-md)',
                  background: 'linear-gradient(135deg, #2563EB, #1D4ED8)',
                  border: 'none',
                  color: '#FFFFFF',
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  boxShadow: '0 2px 8px rgba(37, 99, 235, 0.25)'
                }}
              >
                <Sparkles size={13} />
                <span>Upgrade to Pro</span>
              </button>
            )}
          </div>

          {portalError && (
            <div style={{ fontSize: '0.78rem', color: 'var(--accent-error)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <AlertCircle size={14} />
              <span>{portalError}</span>
            </div>
          )}

          {/* Founder Master Access Control */}
          <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px dashed var(--border-subtle)', paddingTop: 8 }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>
              Founder & Creator Override:
            </span>
            <button
              type="button"
              onClick={async () => {
                await upgradeTier(isPro ? 'free' : 'institution');
              }}
              style={{
                background: isPro ? 'rgba(16, 185, 129, 0.1)' : 'rgba(37, 99, 235, 0.08)',
                border: isPro ? '1px solid #10B981' : '1px dashed #2563EB',
                borderRadius: '8px',
                padding: '4px 10px',
                color: isPro ? '#059669' : '#2563EB',
                fontSize: '0.74rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5
              }}
            >
              <Crown size={12} color={isPro ? '#059669' : '#F59E0B'} />
              <span>{isPro ? '👑 Founder Mode: Unlocked' : '👑 1-Click Founder Unlock'}</span>
            </button>
          </div>
        </div>

        {/* Divider */}
        <hr style={{ border: 'none', borderTop: '1px solid var(--border-subtle)', margin: '22px 0' }} />


        {/* Laboratory Status & Sign Out */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <FlaskConical size={16} color="var(--brand-primary)" />
            <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
              Session Active (Persistent)
            </span>
          </div>

          <button
            type="button"
            onClick={handleSignOut}
            disabled={isSigningOut}
            style={{
              background: 'none',
              border: '1px solid rgba(220, 38, 38, 0.3)',
              borderRadius: 'var(--radius-md)',
              padding: '7px 14px',
              fontSize: '0.82rem',
              fontWeight: 700,
              color: 'var(--accent-error)',
              cursor: isSigningOut ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--accent-error-soft)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            {isSigningOut ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <LogOut size={14} />
            )}
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};
