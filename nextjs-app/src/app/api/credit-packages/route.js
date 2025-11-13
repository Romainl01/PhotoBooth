import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { DEFAULT_CREDIT_PACKAGES } from '@/lib/creditPackages';

/**
 * GET /api/credit-packages
 *
 * Returns all active credit packages from the database
 * Falls back to DEFAULT_CREDIT_PACKAGES if database fails
 * Used by PaywallModal to display purchase options
 *
 * Environment-aware filtering:
 * - Only returns packages matching Stripe price IDs from env variables
 * - Prevents test packages from showing in production (and vice versa)
 * - Environment variables act as a whitelist for which packages to display
 *
 * Response:
 * {
 *   packages: [
 *     { id, name, emoji, credits, price_cents, currency, stripe_price_id, display_order }
 *   ]
 * }
 */
export async function GET() {
  try {
    const supabase = await createClient();

    // Get allowed Stripe price IDs from environment variables
    // This acts as a whitelist to filter test vs production packages
    const allowedPriceIds = [
      process.env.NEXT_PUBLIC_STRIPE_PRICE_STARTER,
      process.env.NEXT_PUBLIC_STRIPE_PRICE_CREATOR,
      process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO,
    ].filter(Boolean); // Remove any undefined values

    // Fetch active packages ordered by display_order
    const { data: packages, error } = await supabase
      .from('credit_packages')
      .select('*')
      .eq('active', true)
      .order('display_order', { ascending: true });

    if (error) {
      console.error('[credit-packages] Database error:', error);
      throw error;
    }

    // Filter packages to only include those matching environment variables
    // This prevents duplicate test/production packages from appearing
    const filteredPackages = packages.filter((pkg) =>
      allowedPriceIds.includes(pkg.stripe_price_id)
    );

    return NextResponse.json({ packages: filteredPackages });
  } catch (error) {
    console.error('[credit-packages] Error fetching packages, using fallback:', error);
    // Return constants as fallback to ensure consistent pricing
    return NextResponse.json({ packages: DEFAULT_CREDIT_PACKAGES });
  }
}
