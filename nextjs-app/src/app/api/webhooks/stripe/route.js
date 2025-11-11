import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/lib/supabase/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-11-20.acacia',
});

// Configure route for webhooks
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * POST /api/webhooks/stripe
 *
 * Stripe webhook handler - processes payment events
 *
 * Critical Events:
 * - checkout.session.completed: Payment succeeded, add credits to user
 *
 * Security:
 * - Verifies webhook signature using STRIPE_WEBHOOK_SECRET
 * - Prevents replay attacks and unauthorized requests
 *
 * Flow:
 * 1. Verify webhook signature
 * 2. Parse event type
 * 3. Extract user_id and credits from session metadata
 * 4. Add credits to user's account (via credit_transactions + update profile)
 * 5. Return 200 to acknowledge receipt
 */
export async function POST(request) {
  console.log('[Stripe Webhook] ========== WEBHOOK CALLED ==========');

  try {
    // Get raw body for signature verification (Next.js 15 compatible way)
    const rawBody = await request.arrayBuffer();
    const body = Buffer.from(rawBody).toString('utf8');
    console.log('[Stripe Webhook] Body received, length:', body.length);

    const signature = request.headers.get('stripe-signature');
    console.log('[Stripe Webhook] Signature present:', !!signature);

    if (!signature) {
      console.error('[Stripe Webhook] Missing signature');
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 400 }
      );
    }

    // Verify webhook signature
    let event;
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error('[Stripe Webhook] Signature verification failed:', err.message);
      return NextResponse.json(
        { error: `Webhook signature verification failed: ${err.message}` },
        { status: 400 }
      );
    }

    console.log(`[Stripe Webhook] Event received: ${event.type}`);

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;

        console.log('[Stripe Webhook] Payment successful:', {
          sessionId: session.id,
          userId: session.metadata.user_id,
          credits: session.metadata.credits,
        });

        // Extract metadata
        const userId = session.metadata.user_id;
        const credits = parseInt(session.metadata.credits, 10);
        const packageName = session.metadata.package_name;

        if (!userId || !credits) {
          console.error('[Stripe Webhook] Missing metadata:', session.metadata);
          return NextResponse.json(
            { error: 'Missing user_id or credits in metadata' },
            { status: 400 }
          );
        }

        // Add credits to user account
        console.log('[Stripe Webhook] Creating Supabase client...');
        const supabase = await createClient();
        console.log('[Stripe Webhook] Supabase client created');

        // Use RPC function to add credits atomically
        console.log('[Stripe Webhook] Calling add_credits RPC...');
        const { error: addCreditsError } = await supabase.rpc('add_credits', {
          p_user_id: userId,
          p_amount: credits,
          p_stripe_payment_id: session.payment_intent,
          p_package_name: packageName,
        });
        console.log('[Stripe Webhook] RPC call completed');

        if (addCreditsError) {
          console.error('[Stripe Webhook] Failed to add credits:', addCreditsError);
          // Return 500 so Stripe retries the webhook
          return NextResponse.json(
            { error: 'Failed to add credits' },
            { status: 500 }
          );
        }

        console.log(`[Stripe Webhook] Successfully added ${credits} credits to user ${userId}`);
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object;
        console.error('[Stripe Webhook] Payment failed:', {
          paymentIntentId: paymentIntent.id,
          error: paymentIntent.last_payment_error?.message,
        });
        // No action needed - user will see failure on Stripe checkout page
        break;
      }

      default:
        console.log(`[Stripe Webhook] Unhandled event type: ${event.type}`);
    }

    // Return 200 to acknowledge receipt
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('[Stripe Webhook] Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
