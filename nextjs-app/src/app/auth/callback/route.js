/**
 * OAuth Callback Route Handler
 *
 * Handles the OAuth redirect from Google after user authentication.
 * Exchanges the authorization code for a session and redirects to home.
 *
 * Flow:
 * 1. User clicks "Continue with Google" on /sign-in
 * 2. Redirected to Google OAuth consent screen
 * 3. Google redirects back to this route with authorization code
 * 4. Exchange code for session (sets auth cookies)
 * 5. Redirect user to camera page (/)
 *
 * Error handling:
 * - Invalid code: Redirect to /sign-in with error
 * - Exchange fails: Redirect to /sign-in with error
 */

import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Session created successfully, redirect to home
      const forwardedHost = request.headers.get('x-forwarded-host')
      const isLocalEnv = process.env.NODE_ENV === 'development'

      if (isLocalEnv) {
        // Local development
        return NextResponse.redirect(`${origin}${next}`)
      } else if (forwardedHost) {
        // Production (Vercel)
        return NextResponse.redirect(`https://${forwardedHost}${next}`)
      } else {
        // Fallback
        return NextResponse.redirect(`${origin}${next}`)
      }
    }
  }

  // OAuth failed or no code provided, redirect to sign-in with error
  return NextResponse.redirect(`${origin}/sign-in?error=auth_failed`)
}
