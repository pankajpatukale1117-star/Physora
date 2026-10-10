// ==============================================================================
// PHYSORA STRIPE CHECKOUT & BILLING SERVICE
// Secure Payment Gateway Integration for Global Subscriptions
// ==============================================================================

import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { StripePlanId, BillingCurrency } from '../types/auth';

export interface PlanPricing {
  id: StripePlanId;
  name: string;
  description: string;
  interval: 'month' | 'year';
  amount: number; // in currency unit (e.g., 9 for $9, 499 for ₹499)
  currency: BillingCurrency;
  symbol: string;
}

export const STRIPE_PLANS: Record<BillingCurrency, Record<StripePlanId, PlanPricing>> = {
  USD: {
    pro_monthly: {
      id: 'pro_monthly',
      name: 'Physora Pro (Monthly)',
      description: 'Monthly unlimited access to all 76+ simulations & AI Tutor',
      interval: 'month',
      amount: 9,
      currency: 'USD',
      symbol: '$'
    },
    pro_annual: {
      id: 'pro_annual',
      name: 'Physora Pro (Annual)',
      description: 'Annual full-access pass with 27% discount ($6.58/mo billed yearly)',
      interval: 'year',
      amount: 79,
      currency: 'USD',
      symbol: '$'
    },
    institution_annual: {
      id: 'institution_annual',
      name: 'Physora Educator & School (Annual)',
      description: 'Classroom Presenter Mode, unlimited student access, and LMS integration',
      interval: 'year',
      amount: 499,
      currency: 'USD',
      symbol: '$'
    }
  },
  INR: {
    pro_monthly: {
      id: 'pro_monthly',
      name: 'Physora Pro (Monthly)',
      description: 'Monthly unlimited access to all 76+ simulations & AI Tutor',
      interval: 'month',
      amount: 499,
      currency: 'INR',
      symbol: '₹'
    },
    pro_annual: {
      id: 'pro_annual',
      name: 'Physora Pro (Annual)',
      description: 'Annual full-access pass for JEE / NEET / CBSE mastery',
      interval: 'year',
      amount: 3999,
      currency: 'INR',
      symbol: '₹'
    },
    institution_annual: {
      id: 'institution_annual',
      name: 'Physora Educator & School (Annual)',
      description: 'School institutional license with unlimited student seats',
      interval: 'year',
      amount: 24999,
      currency: 'INR',
      symbol: '₹'
    }
  }
};

export interface CheckoutResult {
  success: boolean;
  url?: string;
  error?: string;
}

export interface PortalResult {
  success: boolean;
  url?: string;
  error?: string;
}

/**
 * Initiates real Stripe Checkout via Supabase Edge Function
 * Redirects the browser directly to the official Stripe-hosted checkout page.
 */
export async function startStripeCheckout(
  planId: StripePlanId,
  currency: BillingCurrency = 'USD'
): Promise<CheckoutResult> {
  // 1. Check if user is authenticated with Supabase
  if (!isSupabaseConfigured) {
    return {
      success: false,
      error:
        'Supabase is not configured yet. Please configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env.local file to process real payments.'
    };
  }

  const { data: sessionData } = await supabase.auth.getSession();
  const session = sessionData?.session;

  if (!session || !session.user) {
    return {
      success: false,
      error: 'Please sign in or create an account first to attach your subscription to your profile.'
    };
  }

  // Build clean return URL
  const origin = window.location.origin;
  const returnUrl = `${origin}/#pricing`;

  try {
    // 2. Call Supabase Edge Function 'create-stripe-checkout'
    const { data, error } = await supabase.functions.invoke('create-stripe-checkout', {
      body: {
        planId,
        currency,
        returnUrl
      }
    });

    if (error) {
      console.error('[Stripe Service] Edge function checkout error:', error);
      return {
        success: false,
        error:
          error.message ||
          'Failed to reach the payment processor. Please verify that the "create-stripe-checkout" Supabase Edge Function is deployed.'
      };
    }

    if (!data?.url) {
      return {
        success: false,
        error: data?.error || 'Stripe did not return a checkout session URL.'
      };
    }

    // 3. Redirect user directly to Stripe Hosted Checkout
    window.location.assign(data.url);
    return { success: true, url: data.url };
  } catch (err: unknown) {
    console.error('[Stripe Service] Checkout exception:', err);
    const msg = err instanceof Error ? err.message : 'An unexpected payment error occurred.';
    return { success: false, error: msg };
  }
}

/**
 * Opens Stripe Customer Portal for managing active subscriptions,
 * updating credit/debit cards, downloading VAT receipts, or canceling.
 */
export async function openStripeCustomerPortal(): Promise<PortalResult> {
  if (!isSupabaseConfigured) {
    return {
      success: false,
      error: 'Supabase configuration is required to access billing portal.'
    };
  }

  const { data: sessionData } = await supabase.auth.getSession();
  if (!sessionData?.session?.user) {
    return {
      success: false,
      error: 'You must be signed in to manage your billing settings.'
    };
  }

  const origin = window.location.origin;
  const returnUrl = `${origin}/#profile`;

  try {
    const { data, error } = await supabase.functions.invoke('create-portal-session', {
      body: { returnUrl }
    });

    if (error) {
      return {
        success: false,
        error:
          error.message ||
          'Failed to generate customer billing portal. Please verify that the "create-portal-session" Edge Function is deployed.'
      };
    }

    if (!data?.url) {
      return {
        success: false,
        error: data?.error || 'Stripe did not return a customer portal URL.'
      };
    }

    window.location.assign(data.url);
    return { success: true, url: data.url };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unable to open billing portal.';
    return { success: false, error: msg };
  }
}
