// ==============================================================================
// SUPABASE EDGE FUNCTION: create-stripe-checkout
// Creates a secure Stripe Checkout Session for authenticated Physora users
// ==============================================================================

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.8';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

interface RequestBody {
  planId: 'pro_monthly' | 'pro_annual' | 'institution_annual';
  currency?: 'USD' | 'INR';
  returnUrl?: string;
}

const PLAN_AMOUNTS = {
  USD: {
    pro_monthly: { amount: 900, interval: 'month', name: 'Physora Pro (Monthly)' },
    pro_annual: { amount: 7900, interval: 'year', name: 'Physora Pro (Annual)' },
    institution_annual: { amount: 49900, interval: 'year', name: 'Physora Educator & School (Annual)' }
  },
  INR: {
    pro_monthly: { amount: 49900, interval: 'month', name: 'Physora Pro (Monthly)' },
    pro_annual: { amount: 399900, interval: 'year', name: 'Physora Pro (Annual)' },
    institution_annual: { amount: 2499900, interval: 'year', name: 'Physora Educator & School (Annual)' }
  }
} as const;

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeKey) {
      return new Response(
        JSON.stringify({
          error: 'STRIPE_SECRET_KEY is not set in Supabase Edge Function environment secrets.'
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing Authorization header.' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Authenticate user with Supabase
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const {
      data: { user },
      error: userError
    } = await supabaseClient.auth.getUser();

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'User is not authenticated.' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body: RequestBody = await req.json();
    const planId = body.planId || 'pro_monthly';
    const currency = (body.currency || 'USD').toUpperCase() as 'USD' | 'INR';
    const returnUrl = body.returnUrl || 'http://localhost:5173/#pricing';

    const planConfig = PLAN_AMOUNTS[currency]?.[planId] || PLAN_AMOUNTS.USD.pro_monthly;
    const tier = planId === 'institution_annual' ? 'institution' : 'pro';

    const stripe = new Stripe(stripeKey, {
      apiVersion: '2023-10-16',
      httpClient: Stripe.createFetchHttpClient()
    });

    // Supabase admin client for database updates
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // 1. Fetch user's existing stripe_customer_id if any
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .maybeSingle();

    let customerId = profile?.stripe_customer_id;

    if (!customerId) {
      // Create Stripe customer
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          supabase_uid: user.id
        }
      });
      customerId = customer.id;

      // Save customer ID to public.profiles
      await supabaseAdmin
        .from('profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', user.id);
    }

    // 2. Check for pre-configured Stripe Price ID or use dynamic price_data
    const envPriceIdKey = `STRIPE_PRICE_${planId.toUpperCase()}_${currency}`;
    const customPriceId = Deno.env.get(envPriceIdKey);

    const lineItems = customPriceId
      ? [{ price: customPriceId, quantity: 1 }]
      : [
          {
            price_data: {
              currency: currency.toLowerCase(),
              product_data: {
                name: planConfig.name,
                description: `Full access to Physora interactive STEM simulations & AI Mentor (${planConfig.interval}ly)`,
                metadata: {
                  tier,
                  planId
                }
              },
              unit_amount: planConfig.amount,
              recurring: {
                interval: planConfig.interval as 'month' | 'year'
              }
            },
            quantity: 1
          }
        ];

    // 3. Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      client_reference_id: user.id,
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'subscription',
      success_url: `${returnUrl}?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${returnUrl}?payment=cancelled`,
      metadata: {
        userId: user.id,
        planId,
        tier
      },
      subscription_data: {
        metadata: {
          userId: user.id,
          planId,
          tier
        }
      },
      allow_promotion_codes: true,
      billing_address_collection: 'auto'
    });

    return new Response(JSON.stringify({ url: session.url, sessionId: session.id }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });
  } catch (err: unknown) {
    console.error('Error creating checkout session:', err);
    const message = err instanceof Error ? err.message : 'Unknown server error';
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400
    });
  }
});
