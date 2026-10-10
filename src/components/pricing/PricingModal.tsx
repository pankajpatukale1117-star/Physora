import React, { useState, useEffect } from 'react';
import {
  X,
  Check,
  Zap,
  Building2,
  GraduationCap,
  ShieldCheck,
  ArrowRight,
  FileCheck2,
  AlertCircle,
  ExternalLink,
  Loader2,
  Lock,
  CreditCard,
  CheckCircle2,
  QrCode
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSubscription } from '../../context/SubscriptionContext';
import type { MembershipTier, StripePlanId } from '../../types/auth';
import { startStripeCheckout, openStripeCustomerPortal } from '../../services/stripeService';
import { isSupabaseConfigured } from '../../lib/supabase';
import { audioFX } from '../../utils/audioEffects';
import { UpiPaymentModal } from './UpiPaymentModal';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAuthModal?: (view: 'login' | 'signup') => void;
}

export const PricingModal: React.FC<PricingModalProps> = ({
  isOpen,
  onClose,
  onOpenAuthModal
}) => {
  const { user, membershipTier, upgradeTier, profile, refreshProfile } = useAuth();
  const { setTier } = useSubscription();

  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');
  const [currency, setCurrencyState] = useState<'USD' | 'INR'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('physora_preferred_currency');
      if (saved === 'USD' || saved === 'INR') return saved;
    }
    return 'INR';
  });

  const setCurrency = (c: 'USD' | 'INR') => {
    setCurrencyState(c);
    if (typeof window !== 'undefined') {
      localStorage.setItem('physora_preferred_currency', c);
    }
  };

  const [activeTab, setActiveTab] = useState<'plans' | 'institution-quote'>('plans');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isOpeningPortal, setIsOpeningPortal] = useState(false);
  const [upiModalPlanId, setUpiModalPlanId] = useState<StripePlanId | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Quote Form State
  const [institutionForm, setInstitutionForm] = useState({
    institutionName: '',
    contactName: profile?.display_name || '',
    contactEmail: user?.email || '',
    studentCount: '100-500',
    notes: ''
  });
  const [quoteSubmitted, setQuoteSubmitted] = useState(false);

  // Listen for Stripe redirect return status from URL query/hash
  useEffect(() => {
    if (!isOpen || typeof window === 'undefined') return;

    const href = window.location.href;
    if (href.includes('payment=success')) {
      audioFX.playSuccessChime();
      setSuccessMessage('🎉 Payment successfully verified with Stripe! Your account is upgraded to Physora Pro.');
      refreshProfile().then(() => {
        setTier('PRO');
      });
      // Clean up URL query
      if (window.history && window.history.replaceState) {
        window.history.replaceState(null, '', window.location.pathname + '#pricing');
      }
    } else if (href.includes('payment=cancelled')) {
      setErrorMessage('Checkout was canceled. No charges were made to your account.');
      if (window.history && window.history.replaceState) {
        window.history.replaceState(null, '', window.location.pathname + '#pricing');
      }
    }
  }, [isOpen, refreshProfile, setTier]);

  if (!isOpen) return null;

  // Real Stripe Checkout or Direct UPI Trigger
  const handleSelectPlan = async (tier: MembershipTier) => {
    setErrorMessage(null);
    setSuccessMessage(null);

    // 1. Free plan downgrade
    if (tier === 'free') {
      await upgradeTier('free');
      setTier('FREE');
      setSuccessMessage('You are now on the Free Explorer plan.');
      return;
    }

    // 2. Authentication check: User must be signed in to attach subscription to profile
    if (!user) {
      setErrorMessage('Please sign in or create a Physora account first so your subscription is safely attached to your email.');
      if (onOpenAuthModal) {
        onOpenAuthModal('signup');
      } else {
        window.location.hash = '#signup';
      }
      return;
    }

    const planId: StripePlanId =
      tier === 'institution'
        ? 'institution_annual'
        : billingCycle === 'annual'
        ? 'pro_annual'
        : 'pro_monthly';

    // 3. For INR: Route to Direct UPI Payment flow (Dynamic QR & Mobile Intent)
    if (currency === 'INR') {
      setUpiModalPlanId(planId);
      return;
    }

    // 4. For USD: Check if Supabase Edge Functions are deployed
    if (!isSupabaseConfigured) {
      setErrorMessage(
        'Stripe USD requires Supabase edge functions. Please switch to "INR (₹ UPI / Cards)" to pay or test with Google Pay & PhonePe!'
      );
      return;
    }

    // 5. Call Stripe Hosted Checkout
    setIsProcessing(true);
    const result = await startStripeCheckout(planId, currency);

    if (!result.success) {
      setIsProcessing(false);
      setErrorMessage(result.error || 'Failed to initiate secure Stripe checkout.');
    }
  };

  // Open Stripe Customer Billing Portal
  const handleOpenBillingPortal = async () => {
    setErrorMessage(null);
    setIsOpeningPortal(true);
    const res = await openStripeCustomerPortal();
    if (!res.success) {
      setIsOpeningPortal(false);
      setErrorMessage(res.error || 'Unable to open billing portal.');
    }
  };

  const handleQuoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setQuoteSubmitted(true);
  };

  // Pricing calculations
  const prices = {
    USD: {
      proMonthly: 9,
      proAnnual: 79,
      instAnnual: 499
    },
    INR: {
      proMonthly: 499,
      proAnnual: 3999,
      instAnnual: 24999
    }
  };

  const currentPrices = prices[currency];
  const symbol = currency === 'USD' ? '$' : '₹';
  const isPaidSubscriber = membershipTier === 'pro' || membershipTier === 'institution';

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(10, 15, 30, 0.75)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        overflowY: 'auto'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '1060px',
          maxHeight: '94vh',
          background: 'var(--bg-card, #FFFFFF)',
          borderRadius: '24px',
          border: '1px solid var(--border-medium, #E2E8F0)',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.35)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'physoraModalIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        {/* Header Bar */}
        <div
          style={{
            padding: '24px 32px 18px',
            borderBottom: '1px solid var(--border-subtle, #F1F5F9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'relative',
            background: 'linear-gradient(180deg, var(--bg-card) 0%, var(--bg-subtle) 100%)'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  background: currency === 'INR' ? 'linear-gradient(135deg, #059669, #10B981)' : 'linear-gradient(135deg, #2563EB, #7C3AED)',
                  color: '#FFFFFF',
                  padding: '3px 8px',
                  borderRadius: '12px'
                }}
              >
                {currency === 'INR' ? 'Direct UPI • NPCI' : 'Stripe Verified'}
              </span>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                Current plan: <strong style={{ textTransform: 'capitalize' }}>{membershipTier}</strong>
              </span>
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
              Supercharge Your STEM Mastery & Teaching
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'var(--bg-subtle, #F1F5F9)',
              border: 'none',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--text-secondary)'
            }}
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Success Alert Banner */}
        {successMessage && (
          <div
            style={{
              padding: '14px 24px',
              background: '#10B981',
              color: '#FFFFFF',
              fontWeight: 700,
              fontSize: '0.92rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px'
            }}
          >
            <ShieldCheck size={20} />
            {successMessage}
          </div>
        )}

        {/* Error Alert Banner */}
        {errorMessage && (
          <div
            style={{
              padding: '12px 24px',
              background: '#FEE2E2',
              color: '#B91C1C',
              fontWeight: 650,
              fontSize: '0.88rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              borderBottom: '1px solid #FCA5A5'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <span>{errorMessage}</span>
              {currency === 'USD' && !isSupabaseConfigured && (
                <button
                  type="button"
                  onClick={() => {
                    setCurrency('INR');
                    setErrorMessage(null);
                  }}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '6px',
                    border: 'none',
                    background: '#B91C1C',
                    color: '#FFFFFF',
                    fontWeight: 700,
                    fontSize: '0.78rem',
                    cursor: 'pointer'
                  }}
                >
                  Switch to INR (UPI)
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={() => setErrorMessage(null)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#B91C1C' }}
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Content Area */}
        <div style={{ padding: '24px 32px 32px', overflowY: 'auto', flex: 1 }}>
          {/* Controls Bar: Currency + Billing Cycle + Tabs */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '16px',
              marginBottom: '28px'
            }}
          >
            {/* View Switcher */}
            <div style={{ display: 'flex', gap: '4px', background: 'var(--bg-subtle)', padding: '4px', borderRadius: '12px' }}>
              <button
                type="button"
                onClick={() => setActiveTab('plans')}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  background: activeTab === 'plans' ? 'var(--bg-card)' : 'transparent',
                  color: activeTab === 'plans' ? 'var(--text-primary)' : 'var(--text-secondary)',
                  boxShadow: activeTab === 'plans' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none'
                }}
              >
                Individual & Classroom Plans
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('institution-quote')}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  background: activeTab === 'institution-quote' ? 'var(--bg-card)' : 'transparent',
                  color: activeTab === 'institution-quote' ? 'var(--text-primary)' : 'var(--text-secondary)',
                  boxShadow: activeTab === 'institution-quote' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none'
                }}
              >
                Institutional School Licensing
              </button>
            </div>

            {/* Currency & Billing Cycle Toggles */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
              {/* Currency Selector */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'var(--bg-subtle)', padding: '4px', borderRadius: '10px' }}>
                <button
                  type="button"
                  onClick={() => setCurrency('USD')}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    border: 'none',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    background: currency === 'USD' ? 'var(--bg-card)' : 'transparent',
                    color: currency === 'USD' ? 'var(--text-primary)' : 'var(--text-secondary)',
                    boxShadow: currency === 'USD' ? '0 1px 4px rgba(0,0,0,0.08)' : 'none'
                  }}
                >
                  USD ($)
                </button>
                <button
                  type="button"
                  onClick={() => setCurrency('INR')}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    border: 'none',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    background: currency === 'INR' ? 'var(--bg-card)' : 'transparent',
                    color: currency === 'INR' ? 'var(--text-primary)' : 'var(--text-secondary)',
                    boxShadow: currency === 'INR' ? '0 1px 4px rgba(0,0,0,0.08)' : 'none'
                  }}
                >
                  INR (₹ UPI / Cards)
                </button>
              </div>

              {/* Annual / Monthly Toggle */}
              {activeTab === 'plans' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: billingCycle === 'monthly' ? 700 : 500, color: 'var(--text-secondary)' }}>
                    Monthly
                  </span>
                  <button
                    type="button"
                    onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'annual' : 'monthly')}
                    style={{
                      width: '46px',
                      height: '24px',
                      borderRadius: '12px',
                      background: billingCycle === 'annual' ? '#2563EB' : 'var(--border-medium)',
                      border: 'none',
                      position: 'relative',
                      cursor: 'pointer',
                      padding: 0,
                      transition: 'background 0.2s ease'
                    }}
                    aria-label="Toggle billing cycle"
                  >
                    <span
                      style={{
                        position: 'absolute',
                        top: '2px',
                        left: billingCycle === 'annual' ? '24px' : '2px',
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        background: '#FFFFFF',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                        transition: 'left 0.2s ease'
                      }}
                    />
                  </button>
                  <span style={{ fontSize: '0.82rem', fontWeight: billingCycle === 'annual' ? 700 : 500, color: 'var(--text-secondary)' }}>
                    Annual
                  </span>
                  <span
                    style={{
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      color: '#059669',
                      background: '#ECFDF5',
                      padding: '2px 8px',
                      borderRadius: '10px',
                      border: '1px solid #A7F3D0'
                    }}
                  >
                    Save 27%
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* ACTIVE SUBSCRIBER QUICK ACTIONS */}
          {isPaidSubscriber && (
            <div
              style={{
                marginBottom: '28px',
                padding: '16px 20px',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.08), rgba(124, 58, 237, 0.08))',
                border: '1.5px solid rgba(37, 99, 235, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <CheckCircle2 size={24} color="#2563EB" />
                <div>
                  <div style={{ fontSize: '0.94rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    Your {membershipTier.toUpperCase()} Subscription is Active
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                    Update payment methods, view official VAT receipts, or manage your renewal in Stripe.
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={handleOpenBillingPortal}
                disabled={isOpeningPortal}
                style={{
                  padding: '9px 18px',
                  borderRadius: '10px',
                  background: 'var(--bg-card)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-medium)',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: isOpeningPortal ? 'wait' : 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.06)'
                }}
              >
                {isOpeningPortal ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Opening Stripe Portal...</span>
                  </>
                ) : (
                  <>
                    <ExternalLink size={16} />
                    <span>Manage Billing & Invoices (Stripe)</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* TAB 1: STANDARD TIER CARDS */}
          {activeTab === 'plans' && (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))',
                gap: '24px',
                alignItems: 'stretch'
              }}
            >
              {/* TIER 1: FREE */}
              <div
                style={{
                  borderRadius: '18px',
                  border: '1px solid var(--border-medium)',
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  background: 'var(--bg-card)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <GraduationCap size={20} color="var(--text-secondary)" />
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>Free Explorer</h3>
                </div>
                <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginBottom: '16px', minHeight: '38px' }}>
                  Fundamental simulations for everyday science homework and formula reference.
                </p>

                <div style={{ marginBottom: '20px' }}>
                  <span style={{ fontSize: '2.2rem', fontWeight: 900, fontFamily: 'var(--font-mono)' }}>{symbol}0</span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)' }}> / forever</span>
                </div>

                <button
                  type="button"
                  disabled={membershipTier === 'free'}
                  onClick={() => handleSelectPlan('free')}
                  style={{
                    padding: '10px 16px',
                    borderRadius: '10px',
                    border: '1px solid var(--border-medium)',
                    background: membershipTier === 'free' ? 'var(--bg-subtle)' : 'var(--bg-card)',
                    color: 'var(--text-primary)',
                    fontWeight: 700,
                    fontSize: '0.88rem',
                    cursor: membershipTier === 'free' ? 'default' : 'pointer',
                    marginBottom: '20px'
                  }}
                >
                  {membershipTier === 'free' ? 'Current Plan' : 'Downgrade to Free'}
                </button>

                <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '16px', flex: 1 }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-tertiary)', letterSpacing: '0.05em' }}>
                    What's included:
                  </span>
                  <ul style={{ listStyle: 'none', padding: 0, margin: '10px 0 0', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem' }}>
                      <Check size={16} color="#10B981" /> 10 Core Physics & Math simulations
                    </li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem' }}>
                      <Check size={16} color="#10B981" /> Basic interactive formula bank
                    </li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem' }}>
                      <Check size={16} color="#10B981" /> Standard 3D anatomy viewer
                    </li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem' }}>
                      <Check size={16} color="#10B981" /> 3 AI Tutor queries per day
                    </li>
                  </ul>
                </div>
              </div>

              {/* TIER 2: PRO (HERO) */}
              <div
                style={{
                  borderRadius: '18px',
                  border: '2px solid #2563EB',
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  background: 'linear-gradient(180deg, var(--bg-card) 0%, rgba(37, 99, 235, 0.04) 100%)',
                  position: 'relative',
                  boxShadow: '0 12px 30px -10px rgba(37, 99, 235, 0.2)'
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    top: '-12px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'linear-gradient(135deg, #2563EB, #7C3AED)',
                    color: '#FFFFFF',
                    padding: '3px 14px',
                    borderRadius: '12px',
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase'
                  }}
                >
                  Most Popular for Students
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <Zap size={20} color="#2563EB" />
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: '#2563EB' }}>Physora Pro</h3>
                </div>
                <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginBottom: '16px', minHeight: '38px' }}>
                  Complete mastery tool with exam challenges, AI science tutor, and 1-click PDF Lab Reports.
                </p>

                <div style={{ marginBottom: '20px' }}>
                  <span style={{ fontSize: '2.2rem', fontWeight: 900, fontFamily: 'var(--font-mono)' }}>
                    {symbol}
                    {billingCycle === 'monthly' ? currentPrices.proMonthly : Math.round(currentPrices.proAnnual / 12)}
                  </span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>
                    {' '}/ month {billingCycle === 'annual' && `(${symbol}${currentPrices.proAnnual}/yr)`}
                  </span>
                </div>

                {membershipTier === 'pro' ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
                    <div
                      style={{
                        padding: '10px 16px',
                        borderRadius: '10px',
                        background: '#EFF6FF',
                        color: '#1D4ED8',
                        fontWeight: 800,
                        fontSize: '0.88rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}
                    >
                      <Check size={16} /> Active Pro Plan
                    </div>
                    <button
                      type="button"
                      disabled={isOpeningPortal}
                      onClick={handleOpenBillingPortal}
                      style={{
                        padding: '8px 14px',
                        borderRadius: '8px',
                        border: '1px solid #BFDBFE',
                        background: '#FFFFFF',
                        color: '#1D4ED8',
                        fontWeight: 700,
                        fontSize: '0.82rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}
                    >
                      <ExternalLink size={14} /> Stripe Customer Portal
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={() => handleSelectPlan('pro')}
                    style={{
                      padding: '12px 18px',
                      borderRadius: '10px',
                      border: 'none',
                      background: currency === 'INR' ? 'linear-gradient(135deg, #059669, #047857)' : 'linear-gradient(135deg, #2563EB, #1D4ED8)',
                      color: '#FFFFFF',
                      fontWeight: 800,
                      fontSize: '0.92rem',
                      cursor: isProcessing ? 'wait' : 'pointer',
                      marginBottom: '20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      boxShadow: currency === 'INR' ? '0 4px 12px rgba(5, 150, 105, 0.3)' : '0 4px 12px rgba(37, 99, 235, 0.3)'
                    }}
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>Connecting...</span>
                      </>
                    ) : currency === 'INR' ? (
                      <>
                        <QrCode size={16} />
                        <span>Pay via UPI / QR ({symbol}{billingCycle === 'annual' ? currentPrices.proAnnual : currentPrices.proMonthly})</span>
                      </>
                    ) : (
                      <>
                        <Lock size={15} />
                        <span>Pay with Stripe ({symbol}{billingCycle === 'annual' ? currentPrices.proAnnual : currentPrices.proMonthly})</span>
                      </>
                    )}
                  </button>
                )}

                <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '16px', flex: 1 }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-tertiary)', letterSpacing: '0.05em' }}>
                    Everything in Free, plus:
                  </span>
                  <ul style={{ listStyle: 'none', padding: 0, margin: '10px 0 0', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem' }}>
                      <Check size={16} color="#2563EB" /> <strong>All 76+ Precision Simulations</strong> & Labs
                    </li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem' }}>
                      <Check size={16} color="#2563EB" /> <strong>1-Click Academic Lab Report PDF Exporter</strong>
                    </li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem' }}>
                      <Check size={16} color="#2563EB" /> Full 3D Écorché Muscular & Skeletal Model
                    </li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem' }}>
                      <Check size={16} color="#2563EB" /> <strong>Physora AI Science Tutor</strong> (Unlimited)
                    </li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem' }}>
                      <Check size={16} color="#2563EB" /> JEE / NEET / AP Physics exam visual challenges
                    </li>
                  </ul>
                </div>
              </div>

              {/* TIER 3: INSTITUTION */}
              <div
                style={{
                  borderRadius: '18px',
                  border: '1px solid var(--border-medium)',
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  background: 'var(--bg-card)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <Building2 size={20} color="#7C3AED" />
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>Classroom & School</h3>
                </div>
                <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginBottom: '16px', minHeight: '38px' }}>
                  For schools, junior colleges, coaching institutes & universities.
                </p>

                <div style={{ marginBottom: '20px' }}>
                  <span style={{ fontSize: '2.2rem', fontWeight: 900, fontFamily: 'var(--font-mono)' }}>
                    {symbol}
                    {currentPrices.instAnnual}
                  </span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)' }}> / year</span>
                </div>

                {membershipTier === 'institution' ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
                    <div
                      style={{
                        padding: '10px 16px',
                        borderRadius: '10px',
                        background: '#F5F3FF',
                        color: '#6D28D9',
                        fontWeight: 800,
                        fontSize: '0.88rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}
                    >
                      <Check size={16} /> Institution Active
                    </div>
                    <button
                      type="button"
                      disabled={isOpeningPortal}
                      onClick={handleOpenBillingPortal}
                      style={{
                        padding: '8px 14px',
                        borderRadius: '8px',
                        border: '1px solid #DDD6FE',
                        background: '#FFFFFF',
                        color: '#6D28D9',
                        fontWeight: 700,
                        fontSize: '0.82rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}
                    >
                      <ExternalLink size={14} /> Stripe Billing Portal
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={() => handleSelectPlan('institution')}
                    style={{
                      padding: '12px 18px',
                      borderRadius: '10px',
                      border: 'none',
                      background: currency === 'INR' ? 'linear-gradient(135deg, #059669, #047857)' : 'linear-gradient(135deg, #7C3AED, #6D28D9)',
                      color: '#FFFFFF',
                      fontWeight: 800,
                      fontSize: '0.90rem',
                      cursor: isProcessing ? 'wait' : 'pointer',
                      marginBottom: '20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      boxShadow: currency === 'INR' ? '0 4px 12px rgba(5, 150, 105, 0.25)' : '0 4px 12px rgba(124, 58, 237, 0.25)'
                    }}
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>Connecting...</span>
                      </>
                    ) : currency === 'INR' ? (
                      <>
                        <QrCode size={16} />
                        <span>Pay via UPI / QR ({symbol}{currentPrices.instAnnual}/yr)</span>
                      </>
                    ) : (
                      <>
                        <Lock size={15} />
                        <span>Pay with Stripe ({symbol}{currentPrices.instAnnual}/yr)</span>
                      </>
                    )}
                  </button>
                )}

                <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '16px', flex: 1 }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-tertiary)', letterSpacing: '0.05em' }}>
                    Institutional advantages:
                  </span>
                  <ul style={{ listStyle: 'none', padding: 0, margin: '10px 0 0', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem' }}>
                      <Check size={16} color="#7C3AED" /> <strong>Smartboard Presenter Mode & Laser Pointer</strong>
                    </li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem' }}>
                      <Check size={16} color="#7C3AED" /> Unlimited Student & Faculty seats
                    </li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem' }}>
                      <Check size={16} color="#7C3AED" /> <strong>Canvas & Google Classroom LMS Embeds</strong>
                    </li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem' }}>
                      <Check size={16} color="#7C3AED" /> Custom school branding on exported Lab Reports
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: INSTITUTION QUOTE FORM */}
          {activeTab === 'institution-quote' && (
            <div
              style={{
                maxWidth: '680px',
                margin: '0 auto',
                background: 'var(--bg-subtle)',
                padding: '28px',
                borderRadius: '18px',
                border: '1px solid var(--border-medium)'
              }}
            >
              <div style={{ marginBottom: '20px', textAlign: 'center' }}>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, margin: '0 0 8px', color: 'var(--text-primary)' }}>
                  Request Institutional License & School Onboarding
                </h3>
                <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', margin: 0 }}>
                  Volume pricing for schools, universities, school districts, and coaching centers.
                </p>
              </div>

              {quoteSubmitted ? (
                <div style={{ textAlign: 'center', padding: '32px 16px' }}>
                  <div
                    style={{
                      width: '56px',
                      height: '56px',
                      borderRadius: '50%',
                      background: '#10B981',
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 16px'
                    }}
                  >
                    <FileCheck2 size={28} />
                  </div>
                  <h4 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '8px' }}>
                    Institutional Proposal Dispatched!
                  </h4>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6, maxWidth: '460px', margin: '0 auto 20px' }}>
                    Thank you, <strong>{institutionForm.contactName}</strong>. An educational licensing representative will reach out to <strong>{institutionForm.contactEmail}</strong> with custom pricing and an onboarding package for <strong>{institutionForm.institutionName || 'your institution'}</strong> within 24 hours.
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveTab('plans')}
                    style={{
                      padding: '10px 20px',
                      borderRadius: '8px',
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border-medium)',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    Return to Plans
                  </button>
                </div>
              ) : (
                <form onSubmit={handleQuoteSubmit}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '6px' }}>
                        Institution or School Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. St. Xavier's Science College"
                        value={institutionForm.institutionName}
                        onChange={(e) => setInstitutionForm({ ...institutionForm, institutionName: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          borderRadius: '8px',
                          border: '1px solid var(--border-medium)',
                          background: 'var(--bg-card)',
                          fontSize: '0.88rem'
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '6px' }}>
                        Contact Person Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Dr. A. Sharma"
                        value={institutionForm.contactName}
                        onChange={(e) => setInstitutionForm({ ...institutionForm, contactName: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          borderRadius: '8px',
                          border: '1px solid var(--border-medium)',
                          background: 'var(--bg-card)',
                          fontSize: '0.88rem'
                        }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '6px' }}>
                        Official Institutional Email *
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="e.g. principal@school.edu"
                        value={institutionForm.contactEmail}
                        onChange={(e) => setInstitutionForm({ ...institutionForm, contactEmail: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          borderRadius: '8px',
                          border: '1px solid var(--border-medium)',
                          background: 'var(--bg-card)',
                          fontSize: '0.88rem'
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '6px' }}>
                        Estimated Student Count
                      </label>
                      <select
                        value={institutionForm.studentCount}
                        onChange={(e) => setInstitutionForm({ ...institutionForm, studentCount: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          borderRadius: '8px',
                          border: '1px solid var(--border-medium)',
                          background: 'var(--bg-card)',
                          fontSize: '0.88rem'
                        }}
                      >
                        <option value="50-100">50 - 100 students</option>
                        <option value="100-500">100 - 500 students</option>
                        <option value="500-2000">500 - 2,000 students</option>
                        <option value="2000+">2,000+ students (District/University)</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '6px' }}>
                      Curriculum Focus or Special Requirements
                    </label>
                    <textarea
                      rows={3}
                      placeholder="e.g. CBSE Class 11-12 Physics & Chemistry, JEE Main batch smartboard presentation."
                      value={institutionForm.notes}
                      onChange={(e) => setInstitutionForm({ ...institutionForm, notes: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: '1px solid var(--border-medium)',
                        background: 'var(--bg-card)',
                        fontSize: '0.88rem',
                        resize: 'vertical'
                      }}
                    />
                  </div>

                  <button
                    type="submit"
                    style={{
                      width: '100%',
                      padding: '12px 20px',
                      borderRadius: '10px',
                      border: 'none',
                      background: 'linear-gradient(135deg, #7C3AED, #6D28D9)',
                      color: '#FFFFFF',
                      fontWeight: 800,
                      fontSize: '0.94rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                  >
                    Submit Request & Contact Sales <ArrowRight size={18} />
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Trust badges footer */}
          <div
            style={{
              marginTop: '32px',
              paddingTop: '20px',
              borderTop: '1px solid var(--border-subtle)',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '16px',
              fontSize: '0.78rem',
              color: 'var(--text-tertiary)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={16} color="#10B981" />
              <span>
                {currency === 'INR' ? (
                  <><strong>NPCI Instant UPI & Bank Transfer</strong> • Zero Gateway Surcharge</>
                ) : (
                  <><strong>Secured by Stripe</strong> • Official 256-bit SSL Encryption</>
                )}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CreditCard size={15} />
              <span>
                {currency === 'INR' ? (
                  'Google Pay • PhonePe • Paytm • BHIM • Cred • Netbanking (INR)'
                ) : (
                  'Credit & Debit Cards • Apple Pay • Google Pay (USD)'
                )}
              </span>
            </div>
            <div>
              <span>Automatic Invoicing & Instant Activation</span>
            </div>
          </div>
        </div>
      </div>

      {/* Direct UPI Intent & Dynamic QR Modal */}
      {upiModalPlanId && (
        <UpiPaymentModal
          isOpen={!!upiModalPlanId}
          onClose={() => setUpiModalPlanId(null)}
          planId={upiModalPlanId}
          userEmail={user?.email || undefined}
          userId={user?.id || undefined}
          onSuccess={async (targetTier) => {
            setUpiModalPlanId(null);
            await upgradeTier(targetTier);
            setTier(targetTier === 'institution' ? 'EDUCATOR' : 'PRO');
            setSuccessMessage(
              `🎉 UPI Payment successfully verified! Your account is upgraded to Physora ${targetTier.toUpperCase()}.`
            );
            refreshProfile();
          }}
        />
      )}
    </div>
  );
};
