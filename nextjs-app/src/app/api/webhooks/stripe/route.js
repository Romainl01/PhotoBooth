import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/lib/supabase/server';
import { logger, logPaymentEvent } from '@/lib/logger';

// Lazy initialization to avoid build-time errors when env vars aren't available
const getStripe = () => {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not configured');
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2024-11-20.acacia',
  });
};

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
  logger.debug('Stripe Webhook - Webhook called');

  try {
    // Get raw body for signature verification (Next.js 15 compatible way)
    const rawBody = await request.arrayBuffer();
    const body = Buffer.from(rawBody).toString('utf8');
    logger.debug('Stripe Webhook - Body received', { bodyLength: body.length });

    const signature = request.headers.get('stripe-signature');
    logger.debug('Stripe Webhook - Signature check', { signaturePresent: !!signature });

    if (!signature) {
      logger.error('Stripe Webhook - Missing signature');
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 400 }
      );
    }

    // Verify webhook signature
    const stripe = getStripe();
    let event;
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      logger.error('Stripe Webhook - Signature verification failed', { error: err.message });
      return NextResponse.json(
        { error: `Webhook signature verification failed: ${err.message}` },
        { status: 400 }
      );
    }

    logger.info('Stripe Webhook - Event received', { eventType: event.type });

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;

        logPaymentEvent('Payment successful', {
          sessionId: session.id,
          userId: session.metadata.user_id,
          credits: session.metadata.credits,
        });

        // Extract metadata
        const userId = session.metadata.user_id;
        const credits = parseInt(session.metadata.credits, 10);
        const packageName = session.metadata.package_name;

        if (!userId || !credits) {
          logger.error('Stripe Webhook - Missing metadata', { hasUserId: !!userId, hasCredits: !!credits });
          return NextResponse.json(
            { error: 'Missing user_id or credits in metadata' },
            { status: 400 }
          );
        }

        // Add credits to user account
        logger.debug('Stripe Webhook - Creating Supabase client');
        const supabase = await createClient();
        logger.debug('Stripe Webhook - Supabase client created');

        // Use RPC function to add credits atomically
        logger.debug('Stripe Webhook - Calling add_credits RPC', { userId, credits, packageName });
        const { error: addCreditsError } = await supabase.rpc('add_credits', {
          p_user_id: userId,
          p_amount: credits,
          p_stripe_payment_id: session.payment_intent,
          p_package_name: packageName,
        });
        logger.debug('Stripe Webhook - RPC call completed');

        if (addCreditsError) {
          logger.error('Stripe Webhook - Failed to add credits', { error: addCreditsError.message });

          // Check if this is a duplicate (already processed)
          if (addCreditsError.message?.includes('already processed')) {
            logger.info('Stripe Webhook - Duplicate webhook detected, already processed');
            // Return 200 to prevent Stripe from retrying
            return NextResponse.json({
              received: true,
              message: 'Duplicate webhook - already processed'
            });
          }

          // Other errors - return 500 so Stripe retries
          return NextResponse.json(
            { error: 'Failed to add credits' },
            { status: 500 }
          );
        }

        logger.info('Stripe Webhook - Credits added successfully', { userId, credits });
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object;
        logger.warn('Stripe Webhook - Payment failed', {
          paymentIntentId: paymentIntent.id,
          error: paymentIntent.last_payment_error?.message,
        });
        // No action needed - user will see failure on Stripe checkout page
        break;
      }

      default:
        logger.debug('Stripe Webhook - Unhandled event type', { eventType: event.type });
    }

    // Return 200 to acknowledge receipt
    return NextResponse.json({ received: true });
  } catch (error) {
    logger.error('Stripe Webhook - Error processing webhook', { error: error.message });
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
