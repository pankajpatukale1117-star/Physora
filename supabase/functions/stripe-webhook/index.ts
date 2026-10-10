// ==============================================================================
// SUPABASE EDGE FUNCTION: stripe-webhook
// Securely verifies Stripe signatures and automatically updates user tiers
// ==============================================================================

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.8';

serve(async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

  if (!stripeKey || !webhookSecret || !supabaseUrl || !supabaseServiceKey) {
    console.error('[Stripe Webhook] Missing required server environment secrets.');
    return new Response('Server configuration incomplete', { status: 500 });
  }

  const signature = req.headers.get('stripe-signature');
  if (!signature) {
    return new Response('Missing stripe-signature header', { status: 400 });
  }

  const stripe = new Stripe(stripeKey, {
    apiVersion: '2023-10-16',
    httpClient: Stripe.createFetchHttpClient()
  });

  const bodyText = await req.text();
  let event: Stripe.Event;

  try {
    event = await stripe.webhooks.constructEventAsync(bodyText, signature, webhookSecret);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Signature verification failed';
    console.error(`[Stripe Webhook] Signature verification failed: ${msg}`);
    return new Response(`Webhook Error: ${msg}`, { status: 400 });
  }

  // Supabase service-role client bypasses RLS to update database
  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

  console.log(`[Stripe Webhook] Received verified event: ${event.type} (ID: ${event.id})`);

  try {
    switch (event.type) {
      // 1. User successfully completed checkout session
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.client_reference_id || session.metadata?.userId;
        const tier = session.metadata?.tier || 'pro';
        const customerId = session.customer as string;
        const subscriptionId = session.subscription as string;

        if (!userId) {
          console.warn('[Stripe Webhook] checkout.session.completed received without userId.');
          break;
        }

        console.log(`[Stripe Webhook] Upgrading user ${userId} to ${tier} tier...`);

        const { error } = await supabaseAdmin
          .from('profiles')
          .update({
            membership_tier: tier,
            stripe_customer_id: customerId || null,
            stripe_subscription_id: subscriptionId || null,
            subscription_status: 'active',
            updated_at: new Date().toISOString()
          })
          .eq('id', userId);

        if (error) {
          console.error('[Stripe Webhook] Error updating profile on checkout:', error.message);
        } else {
          console.log(`[Stripe Webhook] User ${userId} successfully upgraded to ${tier}.`);
        }
        break;
      }

      // 2. Subscription state updated (renewed, changed plan, or lapsed)
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const status = subscription.status; // 'active' | 'past_due' | 'canceled' | 'unpaid'
        const customerId = subscription.customer as string;
        const periodEnd = new Date(subscription.current_period_end * 1000).toISOString();
        const tierMeta = subscription.metadata?.tier || 'pro';

        const isStillValid = status === 'active' || status === 'trialing';

        const { error } = await supabaseAdmin
          .from('profiles')
          .update({
            membership_tier: isStillValid ? tierMeta : 'free',
            subscription_status: status,
            subscription_period_end: periodEnd,
            updated_at: new Date().toISOString()
          })
          .eq('stripe_customer_id', customerId);

        if (error) {
          console.error('[Stripe Webhook] Error on subscription update:', error.message);
        }
        break;
      }

      // 3. Subscription deleted / canceled
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        console.log(`[Stripe Webhook] Subscription deleted for customer ${customerId}. Downgrading to free.`);

        const { error } = await supabaseAdmin
          .from('profiles')
          .update({
            membership_tier: 'free',
            subscription_status: 'canceled',
            stripe_subscription_id: null,
            updated_at: new Date().toISOString()
          })
          .eq('stripe_customer_id', customerId);

        if (error) {
          console.error('[Stripe Webhook] Error on subscription cancel:', error.message);
        }
        break;
      }

      // 4. Payment failed on renewal
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;

        console.warn(`[Stripe Webhook] Payment failed for customer ${customerId}. Marking past_due.`);

        await supabaseAdmin
          .from('profiles')
          .update({
            subscription_status: 'past_due',
            updated_at: new Date().toISOString()
          })
          .eq('stripe_customer_id', customerId);
        break;
      }

      default:
        // Ignore other unhandled events
        break;
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200
    });
  } catch (err: unknown) {
    console.error('[Stripe Webhook] Handler error:', err);
    return new Response('Webhook handling failed', { status: 500 });
  }
});
