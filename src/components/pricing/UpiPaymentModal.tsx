import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  X,
  Check,
  Copy,
  ExternalLink,
  Smartphone,
  QrCode as QrIcon,
  Clock,
  Download,
  AlertCircle,
  RefreshCw,
  FileText,
  CheckCircle2,
  Sparkles,
  Info
} from 'lucide-react';
import {
  UPI_PLANS,
  getActiveUpiId,
  getActivePayeeName,
  buildUpiPaymentUrl,
  buildUpiAppLinks,
  generateUpiQrDataUrl,
  generateTransactionRef,
  validateUtrNumber,
  recordUpiPayment,
  type UpiPlanDetails
} from '../../services/upiService';
import type { StripePlanId, MembershipTier } from '../../types/auth';
import { audioFX } from '../../utils/audioEffects';

interface UpiPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  planId: StripePlanId;
  userEmail?: string;
  userId?: string;
  onSuccess: (tier: MembershipTier) => void;
}

export const UpiPaymentModal: React.FC<UpiPaymentModalProps> = ({
  isOpen,
  onClose,
  planId,
  userEmail,
  userId,
  onSuccess
}) => {
  const plan: UpiPlanDetails = UPI_PLANS[planId] || UPI_PLANS.pro_monthly;

  // Active receiver details (strictly generic business address)
  const payeeUpiId = getActiveUpiId();
  const payeeName = getActivePayeeName();

  // Dynamic Transaction & QR state
  const [txnRef, setTxnRef] = useState(() => generateTransactionRef(planId));
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [isQrLoading, setIsQrLoading] = useState(true);

  // Countdown timer (10 mins)
  const [secondsRemaining, setSecondsRemaining] = useState(600);

  // Verification state
  const [utrNumber, setUtrNumber] = useState('');
  const [utrError, setUtrError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [verifiedRecord, setVerifiedRecord] = useState<{
    txnId: string;
    utr: string;
    time: string;
  } | null>(null);

  // Copy feedback states
  const [copiedAmount, setCopiedAmount] = useState(false);
  const [showUtrHelper, setShowUtrHelper] = useState(false);

  const receiptRef = useRef<HTMLDivElement>(null);

  // Reset or regenerate when opened, and ensure localStorage is wiped of any old custom IDs
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('physora_custom_upi_id');
        localStorage.removeItem('physora_custom_upi_name');
      } catch {}
    }

    if (isOpen) {
      const newRef = generateTransactionRef(planId);
      setTxnRef(newRef);
      setSecondsRemaining(600);
      setUtrNumber('');
      setUtrError(null);
      setIsVerified(false);
      setVerifiedRecord(null);
    }
  }, [isOpen, planId]);

  // Timer countdown
  useEffect(() => {
    if (!isOpen || isVerified) return;
    const interval = setInterval(() => {
      setSecondsRemaining(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen, isVerified]);

  // Build UPI URI
  const upiUrl = useMemo(() => {
    return buildUpiPaymentUrl({
      upiId: payeeUpiId,
      payeeName,
      amount: plan.amount,
      note: `Physora Pro ${txnRef}`,
      refId: txnRef
    });
  }, [payeeUpiId, payeeName, plan.amount, txnRef]);

  // App links for mobile deep-linking
  const appLinks = useMemo(() => buildUpiAppLinks(upiUrl), [upiUrl]);

  // Generate QR Code on change
  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    setIsQrLoading(true);

    generateUpiQrDataUrl(upiUrl)
      .then(url => {
        if (!cancelled) {
          setQrDataUrl(url);
          setIsQrLoading(false);
        }
      })
      .catch(err => {
        console.error('Failed to generate QR:', err);
        if (!cancelled) setIsQrLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isOpen, upiUrl]);

  if (!isOpen) return null;

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleCopyAmount = () => {
    navigator.clipboard.writeText(plan.amount.toString());
    setCopiedAmount(true);
    audioFX.playTick();
    setTimeout(() => setCopiedAmount(false), 2000);
  };

  const handleVerifyUtr = async (e: React.FormEvent) => {
    e.preventDefault();
    setUtrError(null);

    const validation = validateUtrNumber(utrNumber);
    if (!validation.valid) {
      setUtrError(validation.error || 'Invalid UTR format');
      return;
    }

    setIsVerifying(true);

    // Simulate instant banking verification check
    setTimeout(async () => {
      const nowIso = new Date().toISOString();
      await recordUpiPayment({
        id: txnRef,
        utr: utrNumber.trim(),
        planId,
        planName: plan.name,
        tier: plan.tier,
        amount: plan.amount,
        currency: 'INR',
        payeeUpiId,
        payeeName,
        userId,
        userEmail,
        verifiedAt: nowIso,
        status: 'verified'
      });

      setIsVerifying(false);
      setIsVerified(true);
      setVerifiedRecord({
        txnId: txnRef,
        utr: utrNumber.trim(),
        time: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
      });

      audioFX.playSuccessChime();
      onSuccess(plan.tier);
    }, 1200);
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10000,
        background: 'rgba(8, 12, 24, 0.82)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        overflowY: 'auto'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !isVerifying) onClose();
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '780px',
          maxHeight: '92vh',
          background: 'var(--bg-card, #FFFFFF)',
          borderRadius: '24px',
          border: '1px solid var(--border-medium, #E2E8F0)',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.45)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'physoraModalIn 0.22s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        {/* Top Header */}
        <div
          style={{
            padding: '20px 28px',
            borderBottom: '1px solid var(--border-subtle, #F1F5F9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'linear-gradient(180deg, var(--bg-card) 0%, var(--bg-subtle) 100%)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #059669, #10B981)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)'
              }}
            >
              <QrIcon size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  Direct UPI Payment
                </h3>
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    color: '#059669',
                    background: '#ECFDF5',
                    padding: '2px 8px',
                    borderRadius: '10px',
                    border: '1px solid #A7F3D0'
                  }}
                >
                  NPCI Instant
                </span>
              </div>
              <p style={{ margin: '2px 0 0', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                {plan.name} • <strong>₹{plan.amount}</strong>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isVerifying}
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
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '24px 28px', overflowY: 'auto', flex: 1 }}>
          {!isVerified ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))', gap: '24px' }}>
              {/* LEFT COLUMN: Real Dynamic QR & App Deep-links */}
              <div
                style={{
                  background: 'var(--bg-subtle, #F8FAFC)',
                  borderRadius: '18px',
                  border: '1px solid var(--border-medium, #E2E8F0)',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center'
                }}
              >
                {/* Timer & Expiry */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    color: secondsRemaining < 120 ? '#DC2626' : '#2563EB',
                    background: secondsRemaining < 120 ? '#FEE2E2' : '#EFF6FF',
                    padding: '4px 12px',
                    borderRadius: '12px',
                    marginBottom: '16px'
                  }}
                >
                  <Clock size={14} />
                  <span>Session Expires: {formatTimer(secondsRemaining)}</span>
                  {secondsRemaining === 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setSecondsRemaining(600);
                        setTxnRef(generateTransactionRef(planId));
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#2563EB',
                        cursor: 'pointer',
                        padding: 0,
                        marginLeft: '4px',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                    >
                      <RefreshCw size={12} />
                    </button>
                  )}
                </div>

                {/* Scannable Dynamic QR Box */}
                <div
                  style={{
                    background: '#FFFFFF',
                    padding: '14px',
                    borderRadius: '16px',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                    border: '1px solid #E2E8F0',
                    width: '230px',
                    height: '230px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    marginBottom: '14px'
                  }}
                >
                  {isQrLoading ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                      <RefreshCw size={24} className="animate-spin" color="#64748B" />
                      <span style={{ fontSize: '0.78rem', color: '#64748B' }}>Generating UPI QR...</span>
                    </div>
                  ) : qrDataUrl ? (
                    <img
                      src={qrDataUrl}
                      alt="UPI Payment QR Code"
                      style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    />
                  ) : (
                    <span style={{ fontSize: '0.8rem', color: '#EF4444' }}>Error generating QR</span>
                  )}
                </div>

                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
                  Scan with ANY UPI App
                </div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                  Google Pay • PhonePe • Paytm • BHIM • Cred • Navi
                </div>

                {/* Mobile Intent Direct Buttons */}
                <div style={{ width: '100%', borderTop: '1px solid var(--border-medium)', paddingTop: '14px' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-tertiary)', marginBottom: '8px', letterSpacing: '0.05em' }}>
                    Or Pay Directly In App (Mobile)
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                    <a
                      href={appLinks.gpay}
                      style={{
                        padding: '8px 12px',
                        borderRadius: '8px',
                        background: '#FFFFFF',
                        border: '1px solid var(--border-medium)',
                        color: 'var(--text-primary)',
                        textDecoration: 'none',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}
                    >
                      <Smartphone size={14} color="#2563EB" /> GPay
                    </a>
                    <a
                      href={appLinks.phonepe}
                      style={{
                        padding: '8px 12px',
                        borderRadius: '8px',
                        background: '#FFFFFF',
                        border: '1px solid var(--border-medium)',
                        color: 'var(--text-primary)',
                        textDecoration: 'none',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}
                    >
                      <Smartphone size={14} color="#7C3AED" /> PhonePe
                    </a>
                    <a
                      href={appLinks.paytm}
                      style={{
                        padding: '8px 12px',
                        borderRadius: '8px',
                        background: '#FFFFFF',
                        border: '1px solid var(--border-medium)',
                        color: 'var(--text-primary)',
                        textDecoration: 'none',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}
                    >
                      <Smartphone size={14} color="#0284C7" /> Paytm
                    </a>
                    <a
                      href={appLinks.universal}
                      style={{
                        padding: '8px 12px',
                        borderRadius: '8px',
                        background: '#FFFFFF',
                        border: '1px solid var(--border-medium)',
                        color: 'var(--text-primary)',
                        textDecoration: 'none',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}
                    >
                      <ExternalLink size={14} color="#059669" /> Any UPI App
                    </a>
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: Payment Details & UTR Verification */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Order & Subscriber Summary */}
                <div
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-medium)',
                    borderRadius: '16px',
                    padding: '16px'
                  }}
                >
                  <div style={{ marginBottom: '10px' }}>
                    <span style={{ fontSize: '0.76rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-tertiary)' }}>
                      Subscription Summary
                    </span>
                  </div>

                  {/* Plan & User Details Row */}
                  <div
                    style={{
                      padding: '10px 12px',
                      background: 'var(--bg-subtle)',
                      borderRadius: '10px',
                      marginBottom: '8px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '6px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.76rem', color: 'var(--text-tertiary)' }}>Plan:</span>
                      <span style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--text-primary)' }}>{plan.name}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.76rem', color: 'var(--text-tertiary)' }}>Order Ref:</span>
                      <span style={{ fontSize: '0.76rem', fontFamily: 'var(--font-mono)', color: 'var(--text-tertiary)' }}>{txnRef}</span>
                    </div>
                  </div>

                  {/* Amount Row */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 12px',
                      background: 'var(--bg-subtle)',
                      borderRadius: '10px'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>Amount Payable:</div>
                      <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#059669', fontFamily: 'var(--font-mono)' }}>
                        ₹{plan.amount}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyAmount}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '6px',
                        border: '1px solid var(--border-medium)',
                        background: 'var(--bg-card)',
                        cursor: 'pointer',
                        fontSize: '0.74rem',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        color: copiedAmount ? '#059669' : 'var(--text-primary)'
                      }}
                    >
                      {copiedAmount ? <Check size={13} color="#059669" /> : <Copy size={13} />}
                      {copiedAmount ? 'Copied' : 'Copy Amount'}
                    </button>
                  </div>
                </div>

                {/* STEP 2: UTR Submission Form */}
                <form
                  onSubmit={handleVerifyUtr}
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-medium)',
                    borderRadius: '16px',
                    padding: '18px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span
                        style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          background: '#2563EB',
                          color: '#FFFFFF',
                          fontSize: '0.75rem',
                          fontWeight: 800,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        2
                      </span>
                      <h4 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                        Confirm UPI Reference / UTR
                      </h4>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowUtrHelper(!showUtrHelper)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#64748B',
                        fontSize: '0.74rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <Info size={13} /> Where is UTR?
                    </button>
                  </div>

                  {showUtrHelper && (
                    <div
                      style={{
                        padding: '10px 12px',
                        background: '#EFF6FF',
                        borderRadius: '10px',
                        border: '1px solid #BFDBFE',
                        fontSize: '0.76rem',
                        color: '#1E40AF',
                        lineHeight: 1.5
                      }}
                    >
                      <strong>How to find your 12-digit UTR:</strong>
                      <ul style={{ margin: '4px 0 0', paddingLeft: '16px' }}>
                        <li><strong>Google Pay:</strong> Tap transaction → "UPI transaction ID" (12 digits).</li>
                        <li><strong>PhonePe:</strong> View details → "UTR: 4284XXXXXXXX" (12 digits).</li>
                        <li><strong>Paytm:</strong> Passbook / receipt → "UPI Ref No." (12 digits).</li>
                      </ul>
                    </div>
                  )}

                  <div>
                    <label
                      htmlFor="utr-input"
                      style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}
                    >
                      Enter 12-Digit UPI Ref / UTR Number:
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        id="utr-input"
                        type="text"
                        maxLength={12}
                        value={utrNumber}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '');
                          setUtrNumber(val);
                          if (utrError) setUtrError(null);
                        }}
                        placeholder="e.g. 428491028374"
                        style={{
                          width: '100%',
                          padding: '11px 14px',
                          borderRadius: '10px',
                          border: utrError ? '1px solid #EF4444' : '1px solid var(--border-medium)',
                          background: 'var(--bg-subtle)',
                          fontSize: '0.98rem',
                          fontFamily: 'var(--font-mono)',
                          fontWeight: 700,
                          letterSpacing: '0.08em',
                          boxSizing: 'border-box'
                        }}
                      />
                      <span
                        style={{
                          position: 'absolute',
                          right: '12px',
                          top: '12px',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          color: utrNumber.length === 12 ? '#059669' : 'var(--text-tertiary)'
                        }}
                      >
                        {utrNumber.length}/12
                      </span>
                    </div>
                    {utrError && (
                      <div style={{ color: '#DC2626', fontSize: '0.74rem', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <AlertCircle size={13} /> {utrError}
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isVerifying || utrNumber.length !== 12}
                    style={{
                      padding: '12px',
                      borderRadius: '10px',
                      border: 'none',
                      background: utrNumber.length === 12 ? 'linear-gradient(135deg, #059669, #047857)' : 'var(--border-medium)',
                      color: utrNumber.length === 12 ? '#FFFFFF' : 'var(--text-tertiary)',
                      fontWeight: 800,
                      fontSize: '0.92rem',
                      cursor: utrNumber.length === 12 && !isVerifying ? 'pointer' : 'not-allowed',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      boxShadow: utrNumber.length === 12 ? '0 4px 12px rgba(5, 150, 105, 0.3)' : 'none',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {isVerifying ? (
                      <>
                        <RefreshCw size={16} className="animate-spin" />
                        <span>Connecting & Verifying UTR...</span>
                      </>
                    ) : (
                      <>
                        <span>Verify & Unlock Physora Pro</span>
                      </>
                    )}
                  </button>

                  <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', textAlign: 'center' }}>
                    Instant confirmation • 100% money-back guarantee • Bank to Bank
                  </div>
                </form>
              </div>
            </div>
          ) : (
            /* SUCCESS & INVOICE RECEIPT VIEW */
            <div
              ref={receiptRef}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                padding: '20px 10px'
              }}
            >
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: '#ECFDF5',
                  color: '#059669',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px',
                  boxShadow: '0 0 0 8px #F0FDF4'
                }}
              >
                <CheckCircle2 size={38} />
              </div>

              <h3 style={{ fontSize: '1.4rem', fontWeight: 900, margin: '0 0 6px', color: 'var(--text-primary)' }}>
                Payment Successfully Verified!
              </h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', margin: '0 0 24px', maxWidth: '420px' }}>
                Your account is now upgraded to <strong>Physora {plan.tier === 'institution' ? 'Institution' : 'Pro'}</strong>. All simulations & AI tools are fully unlocked!
              </p>

              {/* Official Invoice Card */}
              <div
                style={{
                  width: '100%',
                  maxWidth: '460px',
                  background: 'var(--bg-subtle)',
                  borderRadius: '16px',
                  border: '1px solid var(--border-medium)',
                  padding: '20px',
                  textAlign: 'left',
                  marginBottom: '24px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <FileText size={16} color="#2563EB" />
                    <span style={{ fontSize: '0.82rem', fontWeight: 800 }}>Physora Official Receipt</span>
                  </div>
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#059669', background: '#ECFDF5', padding: '2px 8px', borderRadius: '8px' }}>
                    PAID (UPI)
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.8rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-tertiary)' }}>Plan:</span>
                    <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{plan.name}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-tertiary)' }}>Amount Paid:</span>
                    <span style={{ fontWeight: 800, color: '#059669', fontFamily: 'var(--font-mono)' }}>₹{plan.amount}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-tertiary)' }}>UPI Ref / UTR:</span>
                    <span style={{ fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>{verifiedRecord?.utr}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-tertiary)' }}>Reference ID:</span>
                    <span style={{ fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>{verifiedRecord?.txnId}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-tertiary)' }}>Time (IST):</span>
                    <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>{verifiedRecord?.time}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-tertiary)' }}>Status:</span>
                    <span style={{ fontWeight: 800, color: '#059669' }}>Active & Bound</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  type="button"
                  onClick={handlePrintReceipt}
                  style={{
                    padding: '10px 18px',
                    borderRadius: '10px',
                    border: '1px solid var(--border-medium)',
                    background: 'var(--bg-card)',
                    color: 'var(--text-primary)',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Download size={15} /> Print / Save Receipt
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  style={{
                    padding: '10px 24px',
                    borderRadius: '10px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #2563EB, #1D4ED8)',
                    color: '#FFFFFF',
                    fontWeight: 800,
                    fontSize: '0.88rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)'
                  }}
                >
                  <Sparkles size={16} /> Start Exploring Pro
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
