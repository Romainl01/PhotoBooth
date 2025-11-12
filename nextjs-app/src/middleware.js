/**
 * Next.js Middleware
 *
 * Handles:
 * - Session refresh (keeps user logged in)
 * - Route protection (redirects unauthenticated users to /sign-in)
 * - Authenticated user redirects (prevents accessing /sign-in when logged in)
 *
 * Protected routes:
 * - / (camera page) - requires authentication
 *
 * Public routes:
 * - /sign-in
 * - /auth/callback
 * - /_next/* (Next.js internals)
 * - /icons/* (static assets)
 * - /showcase/* (static assets)
 */

import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder (icons, showcase, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|icons|showcase|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
