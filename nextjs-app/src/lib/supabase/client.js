/**
 * Supabase Client for Browser (Client Components)
 *
 * Creates a Supabase client for use in client components.
 * Uses cookie-based sessions managed by @supabase/ssr
 *
 * Usage:
 * import { createClient } from '@/lib/supabase/client'
 *
 * const supabase = createClient()
 * const { data, error } = await supabase.auth.signInWithOAuth(...)
 */

import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
}
