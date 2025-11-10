/**
 * SignInLayout Component
 *
 * Complete sign-in page layout composing:
 * - MorpheoLogo (camera icon + brand name)
 * - Text frame (tagline + stats)
 * - ShowcaseTV (skeuomorphic TV with hero photo)
 * - GoogleButton (Continue with Google CTA)
 *
 * Layout:
 * - Mobile-first responsive design
 * - Centered vertical stack with 24px gaps
 * - Light gray background (#e3e3e3)
 * - 32px horizontal padding
 *
 * Authentication:
 * - Google OAuth via Supabase
 * - Redirects to /auth/callback after consent
 * - Session managed via cookies
 */

'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import MorpheoLogo from './MorpheoLogo';
import ShowcaseTV from './ShowcaseTV';
import GoogleButton from './GoogleButton';

export default function SignInLayout() {
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClient();

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        console.error('OAuth error:', error.message);
        alert('Failed to sign in with Google. Please try again.');
        setIsLoading(false);
      }

      // If successful, user will be redirected to Google
      // No need to reset loading state as page will navigate away
    } catch (err) {
      console.error('Unexpected error during sign-in:', err);
      alert('An unexpected error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <main className="
      min-h-screen
      bg-[#e3e3e3]
      flex
      flex-col
      items-center
      justify-center
      py-[24px]
      px-[32px]
    ">
      {/* Content Container */}
      <div className="
        flex
        flex-col
        gap-[24px]
        items-center
        w-full
        max-w-[864px]
      ">
        {/* Logo Section */}
        <MorpheoLogo showRedDot={true} />

        {/* Text Frame - Tagline + Stats */}
        <div className="
          flex
          flex-col
          gap-[8px]
          items-center
          w-full
          text-center
        ">
          {/* Tagline */}
          <p className="
            font-['IBM_Plex_Mono']
            font-semibold
            text-[16px]
            leading-[32px]
            text-black
          ">
            One selfie, infinite possibilities
          </p>

          {/* Stats */}
          <p className="
            font-['IBM_Plex_Mono']
            font-semibold
            text-[12px]
            leading-[24px]
            text-black
          ">
            ⚡ 1,576 photos created this week
            {/* TODO Phase 2: Replace with Supabase query: {weeklyPhotoCount} */}
          </p>
        </div>

        {/* Showcase TV Component with embedded Google Button */}
        <ShowcaseTV
          imageSrc="/showcase/hero-photo.jpg"
          alt="AI-generated showcase photo - Morpheo capabilities"
        >
          <GoogleButton onClick={handleGoogleSignIn} disabled={isLoading} />
        </ShowcaseTV>
      </div>
    </main>
  );
}
