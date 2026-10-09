import React, { useState } from 'react';
import {
  X,
  Check,
  Sparkles,
  Zap,
  Building2,
  GraduationCap,
  ShieldCheck,
  ArrowRight,
  FileCheck2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import type { MembershipTier } from '../../types/auth';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PricingModal: React.FC<PricingModalProps> = ({
  isOpen,
  onClose
}) => {
  const { membershipTier, upgradeTier, profile } = useAuth();

  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');
  const [currency, setCurrency] = useState<'USD' | 'INR'>('USD');
  const [activeTab, setActiveTab] = useState<'plans' | 'institution-quote'>('plans');
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Quote Form State
  const [institutionForm, setInstitutionForm] = useState({
    institutionName: '',
    contactName: profile?.display_name || '',
    contactEmail: '',
    studentCount: '100-500',
    notes: ''
  });
  const [quoteSubmitted, setQuoteSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSelectPlan = async (tier: MembershipTier) => {
    setIsProcessing(true);
    setSuccessMessage(null);

    // Simulate payment processing flow
    setTimeout(async () => {
      await upgradeTier(tier);
      setIsProcessing(false);
      setSuccessMessage(
        tier === 'pro'
          ? '🎉 Welcome to Physora Pro! All flagship simulations and Lab Report export are now unlocked.'
          : '🏛️ Institutional license active! Teacher Presenter Mode and LMS embeds enabled.'
      );
      setTimeout(() => {
        onClose();
      }, 2200);
    }, 900);
  };

  const handleQuoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setQuoteSubmitted(true);
    setTimeout(() => {
      // Simulate enterprise license assignment
      upgradeTier('institution', institutionForm.institutionName);
    }, 1200);
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
                  background: 'linear-gradient(135deg, #2563EB, #7C3AED)',
                  color: '#FFFFFF',
                  padding: '3px 8px',
                  borderRadius: '12px'
                }}
              >
                Commercial Edition
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

            {/* Currency & Annual Billing */}
            {activeTab === 'plans' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                {/* Currency selector */}
                <div style={{ display: 'flex', border: '1px solid var(--border-medium)', borderRadius: '8px', overflow: 'hidden' }}>
                  <button
                    type="button"
                    onClick={() => setCurrency('USD')}
                    style={{
                      padding: '6px 12px',
                      border: 'none',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      background: currency === 'USD' ? 'var(--electric-blue, #2563EB)' : 'var(--bg-card)',
                      color: currency === 'USD' ? '#FFFFFF' : 'var(--text-secondary)'
                    }}
                  >
                    USD ($)
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrency('INR')}
                    style={{
                      padding: '6px 12px',
                      border: 'none',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      background: currency === 'INR' ? 'var(--electric-blue, #2563EB)' : 'var(--bg-card)',
                      color: currency === 'INR' ? '#FFFFFF' : 'var(--text-secondary)'
                    }}
                  >
                    INR (₹)
                  </button>
                </div>

                {/* Billing Cycle */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-subtle)', padding: '4px', borderRadius: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setBillingCycle('monthly')}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '6px',
                      border: 'none',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      background: billingCycle === 'monthly' ? 'var(--bg-card)' : 'transparent',
                      color: billingCycle === 'monthly' ? 'var(--text-primary)' : 'var(--text-secondary)'
                    }}
                  >
                    Monthly
                  </button>
                  <button
                    type="button"
                    onClick={() => setBillingCycle('annual')}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '6px',
                      border: 'none',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      background: billingCycle === 'annual' ? 'var(--bg-card)' : 'transparent',
                      color: billingCycle === 'annual' ? 'var(--text-primary)' : 'var(--text-secondary)'
                    }}
                  >
                    Annual <span style={{ color: '#10B981', marginLeft: '3px' }}>(-30%)</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Tab 1: Three Tier Plans */}
          {activeTab === 'plans' ? (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))',
                gap: '20px'
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
                  background: 'var(--bg-card)',
                  opacity: membershipTier === 'free' ? 1 : 0.85
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
                  onClick={() => upgradeTier('free')}
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

                <button
                  type="button"
                  disabled={isProcessing || membershipTier === 'pro'}
                  onClick={() => handleSelectPlan('pro')}
                  style={{
                    padding: '12px 18px',
                    borderRadius: '10px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #2563EB, #1D4ED8)',
                    color: '#FFFFFF',
                    fontWeight: 800,
                    fontSize: '0.92rem',
                    cursor: membershipTier === 'pro' ? 'default' : 'pointer',
                    marginBottom: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)'
                  }}
                >
                  {isProcessing ? (
                    'Processing...'
                  ) : membershipTier === 'pro' ? (
                    'Active Plan ✓'
                  ) : (
                    <>
                      <Sparkles size={16} /> Upgrade to Pro
                    </>
                  )}
                </button>

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

                <button
                  type="button"
                  disabled={isProcessing || membershipTier === 'institution'}
                  onClick={() => handleSelectPlan('institution')}
                  style={{
                    padding: '12px 18px',
                    borderRadius: '10px',
                    border: 'none',
                    background: 'var(--bg-subtle)',
                    color: 'var(--text-primary)',
                    fontWeight: 700,
                    fontSize: '0.90rem',
                    cursor: membershipTier === 'institution' ? 'default' : 'pointer',
                    marginBottom: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  {membershipTier === 'institution' ? 'Institution Active ✓' : 'Activate Institutional Pass'}
                </button>

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
                    <li style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem' }}>
                      <Check size={16} color="#7C3AED" /> Priority teacher onboarding & PO Invoicing
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            /* Tab 2: School & Coaching Quote Form */
            <div
              style={{
                maxWidth: '680px',
                margin: '0 auto',
                background: 'var(--bg-subtle)',
                padding: '32px',
                borderRadius: '18px',
                border: '1px solid var(--border-medium)'
              }}
            >
              {quoteSubmitted ? (
                <div style={{ textAlign: 'center', padding: '30px 10px' }}>
                  <FileCheck2 size={54} color="#10B981" style={{ marginBottom: '16px' }} />
                  <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '8px' }}>
                    Institutional Inquiry Received!
                  </h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.6 }}>
                    Thank you, <strong>{institutionForm.contactName}</strong>. A dedicated educational licensing representative will reach out to <strong>{institutionForm.contactEmail}</strong> with custom pricing and an onboarding package for <strong>{institutionForm.institutionName || 'your institution'}</strong> within 24 hours.
                  </p>
                  <p style={{ marginTop: '16px', color: '#10B981', fontWeight: 700, fontSize: '0.88rem' }}>
                    ✨ Institutional Demonstration License has been temporarily enabled on your account.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleQuoteSubmit}>
                  <div style={{ marginBottom: '20px' }}>
                    <h3 style={{ fontSize: '1.3rem', fontWeight: 800, margin: '0 0 6px' }}>
                      Request Institutional School Quote
                    </h3>
                    <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', margin: 0 }}>
                      Empower your entire science and mathematics department with smartboard-ready 3D interactive laboratories.
                    </p>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '6px' }}>
                        Institution / School / Coaching Name
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Apex International School"
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
                        Estimated Student Volume
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
                        <option value="under-100">Under 100 students (Classroom)</option>
                        <option value="100-500">100 - 500 students (Department)</option>
                        <option value="500-2000">500 - 2,000 students (Whole School)</option>
                        <option value="2000+">2,000+ students (Campus / Group)</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '6px' }}>
                        Contact Name / Designation
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Dr. Ramesh / Head of Science"
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

                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '6px' }}>
                        Official Email Address
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="principal@school.edu"
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
                    Submit Request & Activate Instant Demo <ArrowRight size={18} />
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ShieldCheck size={16} color="#10B981" /> 256-bit Encrypted Checkout • Instant Tier Activation
            </div>
            <div>
              Compatible with Stripe & Razorpay (UPI, Netbanking, Cards)
            </div>
            <div>
              14-Day Money-Back Guarantee
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
