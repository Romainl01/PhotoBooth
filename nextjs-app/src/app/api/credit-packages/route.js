import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/credit-packages
 *
 * Returns all active credit packages from the database
 * Used by PaywallModal to display purchase options
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

    return NextResponse.json({ packages });
  } catch (error) {
    console.error('[credit-packages] Error fetching packages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch credit packages' },
      { status: 500 }
    );
  }
}
