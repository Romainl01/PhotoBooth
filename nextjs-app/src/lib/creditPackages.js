/**
 * Credit Package Constants
 *
 * Single source of truth for credit packages across the app.
 * Used by:
 * - PaywallModal component (client-side UI)
 * - /api/credit-packages route (server-side API)
 * - Database seeding/synchronization
 *
 * IMPORTANT: These values must stay in sync with:
 * 1. Stripe price IDs (dashboard.stripe.com)
 * 2. Database credit_packages table
 * 3. Environment variables (.env.local / Vercel)
 *
 * Environment Variables Required:
 * - NEXT_PUBLIC_STRIPE_PRICE_STARTER
 * - NEXT_PUBLIC_STRIPE_PRICE_CREATOR
 * - NEXT_PUBLIC_STRIPE_PRICE_PRO
 *
 * When updating prices:
 * 1. Create new price in Stripe dashboard
 * 2. Update environment variables
 * 3. Update database via Supabase SQL editor
 */

// Validate environment variables on import
const requiredEnvVars = [
  'NEXT_PUBLIC_STRIPE_PRICE_STARTER',
  'NEXT_PUBLIC_STRIPE_PRICE_CREATOR',
  'NEXT_PUBLIC_STRIPE_PRICE_PRO',
];

const missingEnvVars = requiredEnvVars.filter(
  (varName) => !process.env[varName]
);

if (missingEnvVars.length > 0) {
  throw new Error(
    `Missing required environment variables: ${missingEnvVars.join(', ')}\n` +
    'Please add them to your .env.local file (for local dev) or Vercel environment variables (for production).'
  );
}

export const DEFAULT_CREDIT_PACKAGES = [
  {
    id: '1',
    name: 'Starter',
    emoji: '💫',
    credits: 10,
    price_cents: 299,
    currency: 'EUR',
    stripe_price_id: process.env.NEXT_PUBLIC_STRIPE_PRICE_STARTER,
  },
  {
    id: '2',
    name: 'Creator',
    emoji: '🎨',
    credits: 30,
    price_cents: 699,
    currency: 'EUR',
    stripe_price_id: process.env.NEXT_PUBLIC_STRIPE_PRICE_CREATOR,
  },
  {
    id: '3',
    name: 'Pro',
    emoji: '🏆',
    credits: 100,
    price_cents: 1799,
    currency: 'EUR',
    stripe_price_id: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO,
  },
]