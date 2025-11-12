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
 *
 * When updating prices:
 * 1. Create new price in Stripe dashboard
 * 2. Update stripe_price_id here
 * 3. Update database via Supabase SQL editor
 */

export const DEFAULT_CREDIT_PACKAGES = [
  {
    id: '1',
    name: 'Starter',
    emoji: '💫',
    credits: 10,
    price_cents: 299,
    currency: 'EUR',
    stripe_price_id: 'price_1SS4E8K9cHL77TyOtdNpKgCr',
  },
  {
    id: '2',
    name: 'Creator',
    emoji: '🎨',
    credits: 30,
    price_cents: 699,
    currency: 'EUR',
    stripe_price_id: 'price_1SS4FjK9cHL77TyOJNL1mVLc',
  },
  {
    id: '3',
    name: 'Pro',
    emoji: '🏆',
    credits: 100,
    price_cents: 1799,
    currency: 'EUR',
    stripe_price_id: 'price_1SS4EtK9cHL77TyOS3mtMaHi',
  },
]