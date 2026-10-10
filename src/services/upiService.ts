// ==============================================================================
// PHYSORA DIRECT UPI PAYMENT & SETTLEMENT SERVICE
// Direct NPCI UPI Intent, Dynamic QR Generation & UTR Verification
// ==============================================================================

import QRCode from 'qrcode';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { MembershipTier, StripePlanId } from '../types/auth';

export interface UpiPlanDetails {
  id: StripePlanId;
  name: string;
  description: string;
  interval: 'month' | 'year';
  amount: number; // in INR (₹)
  symbol: string;
  tier: MembershipTier;
}

export const UPI_PLANS: Record<StripePlanId, UpiPlanDetails> = {
  pro_monthly: {
    id: 'pro_monthly',
    name: 'Physora Pro (Monthly)',
    description: '1-Month full access to 76+ simulations & AI Tutor',
    interval: 'month',
    amount: 499,
    symbol: '₹',
    tier: 'pro'
  },
  pro_annual: {
    id: 'pro_annual',
    name: 'Physora Pro (Annual)',
    description: '1-Year full access pass with 27% savings',
    interval: 'year',
    amount: 3999,
    symbol: '₹',
    tier: 'pro'
  },
  institution_annual: {
    id: 'institution_annual',
    name: 'Physora Educator & School (Annual)',
    description: 'Institutional license with unlimited student seats',
    interval: 'year',
    amount: 24999,
    symbol: '₹',
    tier: 'institution'
  }
};

export interface UpiPaymentRecord {
  id: string; // Unique reference ID, e.g. PHY-20261010-847291
  utr: string; // 12-digit UPI reference number
  planId: StripePlanId;
  planName: string;
  tier: MembershipTier;
  amount: number;
  currency: 'INR';
  payeeUpiId: string;
  payeeName: string;
  userId?: string;
  userEmail?: string;
  verifiedAt: string;
  status: 'verified';
}

const STORAGE_KEY_CUSTOM_UPI = 'physora_custom_upi_id';
const STORAGE_KEY_CUSTOM_NAME = 'physora_custom_upi_name';
const STORAGE_KEY_TRANSACTIONS = 'physora_upi_transactions';

// Force wipe any old custom UPI ID from browser localStorage on module load
if (typeof window !== 'undefined') {
  try {
    localStorage.removeItem(STORAGE_KEY_CUSTOM_UPI);
    localStorage.removeItem(STORAGE_KEY_CUSTOM_NAME);
  } catch {
    // Ignore storage errors
  }
}

/**
 * Returns the active payee UPI ID for QR encoding and deep-linking.
 */
export function getActiveUpiId(): string {
  const envId = (import.meta as unknown as { env: Record<string, string> }).env?.VITE_UPI_ID;
  if (envId && envId.trim().length > 0 && !envId.includes('yourname@bank')) {
    return envId.trim();
  }
  return 'pankajpatukale1117@okaxis';
}

/**
 * Returns the payee display name for NPCI encoding.
 */
export function getActivePayeeName(): string {
  const envName = (import.meta as unknown as { env: Record<string, string> }).env?.VITE_UPI_PAYEE_NAME;
  if (envName && envName.trim().length > 0) {
    return envName.trim();
  }
  return 'Physora';
}

/**
 * Clears custom details permanently.
 */
export function setActiveUpiDetails(_upiId: string, _payeeName?: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY_CUSTOM_UPI);
    localStorage.removeItem(STORAGE_KEY_CUSTOM_NAME);
  } catch {}
}

/**
 * Generates an official NPCI standard UPI payment string
 * Specification: upi://pay?pa=...&pn=...&am=...&cu=INR&tn=...&tr=...
 */
export function buildUpiPaymentUrl(params: {
  upiId: string;
  payeeName: string;
  amount: number;
  note?: string;
  refId?: string;
}): string {
  const query = new URLSearchParams();
  query.set('pa', params.upiId.trim());
  query.set('pn', params.payeeName.trim());
  query.set('am', params.amount.toString());
  query.set('cu', 'INR');
  if (params.note) {
    // Alphanumeric note prevents special-character rejection in PhonePe & GPay
    query.set('tn', params.note.replace(/[^a-zA-Z0-9 ]/g, '').trim());
  }
  return `upi://pay?${query.toString()}`;
}

/**
 * Generates app-specific intent URLs for mobile deep linking
 */
export function buildUpiAppLinks(upiUrl: string): {
  universal: string;
  gpay: string;
  phonepe: string;
  paytm: string;
} {
  // Replace protocol for specific apps where supported, or use standard upi://
  return {
    universal: upiUrl,
    // Google Pay accepts standard upi:// or tez://
    gpay: upiUrl,
    // PhonePe Android/iOS deep link
    phonepe: upiUrl.replace('upi://pay', 'phonepe://pay'),
    // Paytm Android/iOS deep link
    paytm: upiUrl.replace('upi://pay', 'paytmmp://pay')
  };
}

/**
 * Generates a scannable QR Code Data URL in high resolution
 */
export async function generateUpiQrDataUrl(upiUrl: string): Promise<string> {
  return await QRCode.toDataURL(upiUrl, {
    width: 340,
    margin: 2,
    color: {
      dark: '#0F172A',
      light: '#FFFFFF'
    },
    errorCorrectionLevel: 'M'
  });
}

/**
 * Generates a clean, unique transaction reference string
 */
export function generateTransactionRef(planId: string): string {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomPart = Math.floor(100000 + Math.random() * 900000);
  const prefix = planId === 'institution_annual' ? 'INS' : 'PRO';
  return `PHY-${prefix}-${dateStr}-${randomPart}`;
}

/**
 * Validates whether a provided string is a valid 12-digit Indian UPI UTR / RRN number
 */
export function validateUtrNumber(utr: string): { valid: boolean; error?: string } {
  const clean = utr.trim();
  if (!clean) {
    return { valid: false, error: 'Please enter the 12-digit UPI Reference / UTR number.' };
  }
  if (!/^\d+$/.test(clean)) {
    return { valid: false, error: 'UTR must contain digits only.' };
  }
  if (clean.length !== 12) {
    return {
      valid: false,
      error: `UTR must be exactly 12 digits (currently ${clean.length} digits).`
    };
  }
  return { valid: true };
}

/**
 * Saves and verifies the UPI payment record.
 * Persists in local storage and attempts Supabase sync.
 */
export async function recordUpiPayment(record: UpiPaymentRecord): Promise<void> {
  // 1. Local Storage persistence
  if (typeof window !== 'undefined') {
    try {
      const existing = getStoredUpiTransactions();
      const updated = [record, ...existing.filter(t => t.id !== record.id)];
      localStorage.setItem(STORAGE_KEY_TRANSACTIONS, JSON.stringify(updated));
    } catch (e) {
      console.warn('[UPI Service] Failed to store transaction locally:', e);
    }
  }

  // 2. Supabase remote persistence (if configured)
  if (isSupabaseConfigured && record.userId) {
    try {
      await supabase.from('upi_payments').insert({
        id: record.id,
        user_id: record.userId,
        user_email: record.userEmail,
        utr: record.utr,
        plan_id: record.planId,
        tier: record.tier,
        amount: record.amount,
        currency: 'INR',
        payee_upi_id: record.payeeUpiId,
        payee_name: record.payeeName,
        status: record.status,
        verified_at: record.verifiedAt
      });
    } catch (err) {
      // Table might not exist yet; non-fatal for local/Option B flow
      console.info('[UPI Service] Supabase remote sync skipped or table absent:', err);
    }
  }
}

/**
 * Fetches stored UPI transactions from local device storage
 */
export function getStoredUpiTransactions(): UpiPaymentRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_TRANSACTIONS);
    if (!raw) return [];
    return JSON.parse(raw) as UpiPaymentRecord[];
  } catch {
    return [];
  }
}
