-- ==============================================================================
-- PHYSORA STRIPE BILLING & SUBSCRIPTIONS MIGRATION
-- Run this script in your Supabase SQL Editor (Dashboard -> SQL Editor)
-- ==============================================================================

-- 1. Add Stripe Subscription columns to public.profiles table
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
  ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'inactive',
  ADD COLUMN IF NOT EXISTS subscription_period_end TIMESTAMPTZ;

-- 2. Indexes for fast webhook lookups by Stripe Customer ID
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer_id 
  ON public.profiles(stripe_customer_id);

CREATE INDEX IF NOT EXISTS idx_profiles_stripe_subscription_id 
  ON public.profiles(stripe_subscription_id);

-- 3. Comments for database documentation
COMMENT ON COLUMN public.profiles.membership_tier IS 'Current commercial tier: free, pro, or institution';
COMMENT ON COLUMN public.profiles.stripe_customer_id IS 'Unique Stripe Customer ID (cus_xxx)';
COMMENT ON COLUMN public.profiles.stripe_subscription_id IS 'Active Stripe Subscription ID (sub_xxx)';
COMMENT ON COLUMN public.profiles.subscription_status IS 'Status from Stripe: active, trialing, past_due, canceled, or inactive';
COMMENT ON COLUMN public.profiles.subscription_period_end IS 'Timestamp when the current billing period expires';
