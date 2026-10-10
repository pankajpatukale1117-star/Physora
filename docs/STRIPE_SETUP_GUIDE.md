# 💳 Physora Real-Money Stripe Payments & Subscriptions Integration Guide

Physora uses **Stripe Checkout** combined with **Supabase Edge Functions and Webhooks** to process real-money payments securely.

This architecture ensures:
1. **Zero credit card data touches your frontend servers** (PCI DSS Level 1 compliant).
2. **Subscriptions cannot be forged or faked** from the client browser.
3. User membership tiers (`pro` or `institution`) are **automatically verified and unlocked via cryptographically signed webhooks**.
4. Customers can self-manage invoices, VAT receipts, and cancellations via the **Stripe Customer Billing Portal**.

---

## 🛠️ Architecture Overview

```
[Student / Teacher]
        │
        ▼ (Clicks "Upgrade to Pro")
[Physora React Frontend]
        │
        ▼ (Invokes via authenticated Supabase JWT)
[Supabase Edge Function: create-stripe-checkout]
        │
        ▼ (Creates Session with Stripe API)
[Stripe Hosted Checkout] ── (Customer enters real Card / Apple Pay / UPI)
        │
        ▼ (Payment confirmed)
[Stripe Webhook Event: checkout.session.completed]
        │
        ▼ (Verifies stripe-signature header)
[Supabase Edge Function: stripe-webhook]
        │
        ▼ (Service-Role Admin Database Update)
[PostgreSQL Database: public.profiles]
(Sets membership_tier = 'pro', stripe_customer_id, stripe_subscription_id)
        │
        ▼
[Physora Frontend Refreshes & Unlocks All Labs, PDF Reports & AI Tutor]
```

---

## 📋 Step-by-Step Setup Instructions

### Step 1: Run the Database Migration in Supabase

1. Open your **Supabase Project Dashboard** ([https://supabase.com/dashboard](https://supabase.com/dashboard)).
2. Navigate to **SQL Editor** in the left sidebar.
3. Open or copy the script from [`supabase/migrations/20261009_stripe_billing.sql`](../supabase/migrations/20261009_stripe_billing.sql):

```sql
-- Add Stripe Subscription columns to public.profiles table
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
  ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'inactive',
  ADD COLUMN IF NOT EXISTS subscription_period_end TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer_id 
  ON public.profiles(stripe_customer_id);

CREATE INDEX IF NOT EXISTS idx_profiles_stripe_subscription_id 
  ON public.profiles(stripe_subscription_id);
```

4. Click **Run**. This safely adds the subscription tracking columns.

---

### Step 2: Get Your Stripe API Keys

1. Sign in to your [Stripe Dashboard](https://dashboard.stripe.com).
2. Toggle to **Test Mode** (top-right toggle) for development.
3. Go to **Developers $\rightarrow$ API Keys**:
   * **Publishable key** (`pk_test_...` or `pk_live_...`)
   * **Secret key** (`sk_test_...` or `sk_live_...`)
4. Add the publishable key to your `.env.local` file:

```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
```

---

### Step 3: Deploy Supabase Edge Functions

Install the Supabase CLI if you haven't already:

```bash
# Via npm
npm install -g supabase

# Or via Homebrew / Scoop
# scoop bucket add supabase https://github.com/supabase/scoop-bucket.git && scoop install supabase
```

Link your project and deploy the functions located in `supabase/functions/`:

```bash
# 1. Log in to Supabase CLI
supabase login

# 2. Link your local repo to your Supabase project (find Ref in Project Settings -> General)
supabase link --project-ref your-project-ref

# 3. Deploy all three Edge Functions
supabase functions deploy create-stripe-checkout --no-verify-jwt
supabase functions deploy stripe-webhook --no-verify-jwt
supabase functions deploy create-portal-session --no-verify-jwt
```

---

### Step 4: Configure Supabase Function Secrets

Set your Stripe Secret Key and Supabase Service Role Key as secrets for the Edge Functions:

```bash
supabase secrets set STRIPE_SECRET_KEY=sk_test_your_secret_key_here
```

---

### Step 5: Configure the Stripe Webhook

Stripe needs to notify your Supabase Edge Function whenever a real payment succeeds.

1. In the Stripe Dashboard, go to **Developers $\rightarrow$ Webhooks**.
2. Click **Add destination** / **Add an endpoint**.
3. **Endpoint URL**:
   ```
   https://<your-project-ref>.supabase.co/functions/v1/stripe-webhook
   ```
4. **Events to listen for**:
   * `checkout.session.completed`
   * `customer.subscription.updated`
   * `customer.subscription.deleted`
   * `invoice.payment_failed`
5. Click **Add endpoint**.
6. Reveal the **Signing secret** (`whsec_...`).
7. Save this secret in your Supabase project:

```bash
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

---

### Step 6: Test the Payment Flow

1. Start your local Physora dev server:
   ```bash
   npm run dev
   ```
2. Click **Pricing** in the navbar or **Upgrade to Pro**.
3. Select **Pro** or **Classroom & School**.
4. You will be redirected to the official Stripe Checkout page!
5. In Stripe Test Mode, use the standard test card:
   * **Card number:** `4242 4242 4242 4242`
   * **Expiry date:** Any date in the future (e.g. `12/30`)
   * **CVC:** `123`
   * **ZIP/Postal Code:** Any valid ZIP (e.g. `10001` or `400001`)
6. Click **Subscribe**.
7. Stripe processes the payment, triggers the webhook, and redirects back to Physora with `#pricing?payment=success`.
8. The success banner pops up, a celebration chime plays, and your account is upgraded to **PRO**!

---

### Step 7: Switching to Live Mode (Real Money)

When you are ready to accept real money from real students and institutions:
1. Complete your Stripe business activation (Business info, bank account for payouts).
2. Switch Stripe toggle to **Live Mode**.
3. Update `.env.local` / production environment:
   * `VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...`
4. Update Supabase Edge Function secrets with Live keys:
   ```bash
   supabase secrets set STRIPE_SECRET_KEY=sk_live_...
   supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_live_...
   ```
5. Add the live webhook endpoint in Stripe under Live Mode Webhooks.

That's it! Real money will now be deposited directly into your linked bank account, and user accounts will automatically have Pro unlocked.
