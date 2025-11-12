/**
 * Sign-In Page Route
 *
 * Public page for user authentication (Google OAuth)
 * Phase 1: UI only (button non-functional)
 * Phase 2: Will integrate Supabase Auth
 *
 * Route: /sign-in
 */

import SignInLayout from '@/components/auth/SignInLayout';

export const metadata = {
  title: 'Sign In - Morpheo',
  description: 'Sign in to Morpheo AI Photobooth with your Google account. Transform your selfies with AI - one selfie, infinite possibilities.',
  openGraph: {
    title: 'Sign In - Morpheo',
    description: 'Transform your selfies with AI',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sign In - Morpheo',
    description: 'Transform your selfies with AI',
  },
};

export default function SignInPage() {
  return <SignInLayout />;
}
