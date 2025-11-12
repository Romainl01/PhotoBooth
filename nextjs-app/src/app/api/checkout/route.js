import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/lib/supabase/server';

// Lazy initialization to avoid build-time errors when env vars aren't available
const getStripe = () => {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not configured');
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2024-11-20.acacia',
  });
};

/**
 * POST /api/checkout
 *
 * Creates a Stripe Checkout Session for credit purchase
 *
 * Flow:
 * 1. Verify user is authenticated
 * 2. Validate price_id exists in database
 * 3. Create Stripe checkout session with user metadata
 * 4. Return checkout URL to frontend
 *
 * Request body:
 * {
 *   priceId: string - Stripe price ID (e.g., price_1SS4E8K9cHL77TyOtdNpKgCr)
 * }
 *
 * Response:
 * {
 *   url: string - Stripe checkout URL to redirect to
 * }
 */
export async function POST(request) {
  try {
    // 1. Authenticate user
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error('[Checkout] Unauthorized:', authError?.message);
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in to purchase credits.' },
        { status: 401 }
      );
    }

    // 2. Parse request
    const { priceId } = await request.json();

    if (!priceId) {
      return NextResponse.json(
        { error: 'Missing priceId parameter' },
        { status: 400 }
      );
    }

    // 3. Validate price exists in our database (security check)
    const { data: package_data, error: pkgError } = await supabase
      .from('credit_packages')
      .select('*')
      .eq('stripe_price_id', priceId)
      .eq('active', true)
      .single();

    if (pkgError || !package_data) {
      console.error('[Checkout] Invalid price ID:', priceId);
      return NextResponse.json(
        { error: 'Invalid price ID' },
        { status: 400 }
      );
    }

    console.log(`[Checkout] Creating session for user ${user.id}, package: ${package_data.name}`);

    // 4. Create Stripe Checkout Session
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}?payment=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}?payment=cancelled`,
      client_reference_id: user.id, // Link payment to user
      metadata: {
        user_id: user.id,
        user_email: user.email,
        package_name: package_data.name,
        credits: package_data.credits.toString(),
      },
    });

    console.log(`[Checkout] Session created: ${session.id}`);

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('[Checkout] Error creating session:', error);
    return NextResponse.json(
      {
        error: 'Failed to create checkout session',
        message: error.message,
      },
      { status: 500 }
    );
  }
}
